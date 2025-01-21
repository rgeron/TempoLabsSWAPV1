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
    const { userId, amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Add Credits",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/app/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/app/purchase-cancelled`,
      metadata: {
        userId,
        type: "recharge",
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
    const purchaseDate = new Date().toISOString();

    // Start a Supabase transaction
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select(
        "*, profiles!decks_creatorid_fkey(stripe_connect_id, stripe_connect_status)",
      )
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    if (!deck) throw new Error("Deck not found");

    const seller = deck.profiles;
    if (
      !seller?.stripe_connect_id ||
      seller.stripe_connect_status !== "active"
    ) {
      throw new Error("Seller's Stripe account is not properly set up");
    }

    // Calculate shares (90% to seller, 10% platform fee)
    const platformFee = Math.round(amount * 0.1 * 100); // in cents
    const sellerAmount = Math.round(amount * 0.9 * 100); // in cents

    // Create transfer to seller's Connect account
    const transfer = await stripe.transfers.create({
      amount: sellerAmount,
      currency: "usd",
      destination: seller.stripe_connect_id,
      description: `Deck sale: ${deckId}`,
    });

    // Update buyer's profile
    const { error: buyerError } = await supabase
      .from("profiles")
      .update({
        balance: supabase.sql`balance - ${amount}`,
        purchaseddeckids: supabase.sql`array_append(purchaseddeckids, ${deckId})`,
        purchaseinfo: supabase.sql`coalesce(purchaseinfo, '[]'::jsonb) || ${JSON.stringify(
          [
            {
              deckId,
              purchaseDate,
              amount,
            },
          ],
        )}::jsonb`,
      })
      .eq("id", buyerId);

    if (buyerError) throw buyerError;

    // Update seller's earnings
    const { error: sellerError } = await supabase
      .from("profiles")
      .update({
        total_earnings: supabase.sql`coalesce(total_earnings, 0) + ${amount * 0.9}`,
        total_sales: supabase.sql`coalesce(total_sales, 0) + 1`,
      })
      .eq("id", deck.creatorid);

    if (sellerError) throw sellerError;

    // Update deck's purchase history
    const { error: historyError } = await supabase
      .from("decks")
      .update({
        purchase_history: supabase.sql`coalesce(purchase_history, '[]'::jsonb) || ${JSON.stringify(
          [
            {
              buyerId,
              purchaseDate,
              amount,
            },
          ],
        )}::jsonb`,
      })
      .eq("id", deckId);

    if (historyError) throw historyError;

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
      .select("stripe_connect_id, stripe_connect_status, balance")
      .eq("id", userId)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    if (userData.stripe_connect_status !== "active") {
      throw new Error("Account not fully onboarded");
    }

    if ((userData.balance || 0) < amount) {
      throw new Error("Insufficient balance");
    }

    // Create payout
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      },
      {
        stripeAccount: userData.stripe_connect_id,
      },
    );

    // Update user's balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        balance: supabase.sql`balance - ${amount}`,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

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
          const { userId, type } = session.metadata;
          const amount = session.amount_total / 100; // Convert from cents

          if (type === "recharge") {
            // Update user's balance
            const { error } = await supabase
              .from("profiles")
              .update({
                balance: supabase.sql`coalesce(balance, 0) + ${amount}`,
              })
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
