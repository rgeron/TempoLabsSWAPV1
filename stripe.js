require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
router.use(express.json());

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

// Create a Connect account
router.post("/create-connect-account", async (req, res) => {
  try {
    const { userId } = req.body;

    // Get user's email from Supabase auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);

    if (userError) throw userError;
    if (!user?.email) throw new Error("User email not found");

    // Create Express account
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Update Supabase with Connect account ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_connect_id: account.id,
        stripe_connect_status: "pending",
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    res.json({ accountId: account.id });
  } catch (error) {
    console.error("Error creating Connect account:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create onboarding link
router.post("/create-onboarding-link", async (req, res) => {
  try {
    const { userId } = req.body;

    // Get Connect account ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("stripe_connect_id")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const accountLink = await stripe.accountLinks.create({
      account: userData.stripe_connect_id,
      refresh_url: `${process.env.CLIENT_URL}/onboarding/refresh`,
      return_url: `${process.env.CLIENT_URL}/onboarding/complete`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating onboarding link:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a checkout session for credits
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, amount, isRecharge } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isRecharge ? "Add Credits" : "Purchase Deck",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancelled`,
      metadata: {
        userId,
        isRecharge: isRecharge ? "true" : "false",
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Process deck purchase
router.post("/process-deck-purchase", async (req, res) => {
  try {
    const { buyerId, deckId, amount } = req.body;

    // Get seller's Connect account ID
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select("creatorid")
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;

    const { data: sellerData, error: sellerError } = await supabase
      .from("profiles")
      .select("stripe_connect_id, stripe_connect_status")
      .eq("id", deckData.creatorid)
      .single();

    if (sellerError) throw sellerError;

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.1 * 100); // Convert to cents
    const sellerAmount = Math.round(amount * 0.9 * 100); // Convert to cents

    // Create a Transfer to the seller's Connect account
    const transfer = await stripe.transfers.create({
      amount: sellerAmount,
      currency: "usd",
      destination: sellerData.stripe_connect_id,
      description: `Deck sale: ${deckId}`,
    });

    // Update balances in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ balance: supabase.sql`balance - ${amount}` })
      .eq("id", buyerId);

    if (updateError) throw updateError;

    res.json({ success: true, transfer });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a payout
router.post("/create-payout", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Get Connect account ID
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("stripe_connect_id, stripe_connect_status")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    if (userData.stripe_connect_status !== "active") {
      throw new Error("Account not fully onboarded");
    }

    // Create payout
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency: "usd",
      },
      {
        stripeAccount: userData.stripe_connect_id,
      },
    );

    res.json({ success: true, payout });
  } catch (error) {
    console.error("Error creating payout:", error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const { userId, isRecharge } = session.metadata;
          const amount = session.amount_total / 100; // Convert from cents

          if (isRecharge === "true") {
            // Update user's balance
            const { error } = await supabase
              .from("profiles")
              .update({ balance: supabase.sql`balance + ${amount}` })
              .eq("id", userId);

            if (error) throw error;
          }
          break;
        }

        case "account.updated": {
          const account = event.data.object;

          // Update account status if charges capability is active
          if (account.charges_enabled) {
            const { error } = await supabase
              .from("profiles")
              .update({ stripe_connect_status: "active" })
              .eq("stripe_connect_id", account.id);

            if (error) throw error;
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
