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

// Create a Connect account
router.post("/create-connect-account", async (req, res) => {
  try {
    const { email } = req.body;

    // Create Express account
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    res.json({ accountId: account.id });
  } catch (error) {
    console.error("Error creating Connect account:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create onboarding link
router.post("/create-onboarding-link", async (req, res) => {
  try {
    const { accountId } = req.body;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
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

// Process deck purchase
router.post("/process-deck-purchase", async (req, res) => {
  try {
    const { amount, accountId } = req.body;

    // Calculate shares (90% to seller, 10% platform fee)
    const sellerAmount = Math.round(amount * 0.9 * 100); // in cents

    // Create transfer to seller's Connect account
    const transfer = await stripe.transfers.create({
      amount: sellerAmount,
      currency: "usd",
      destination: accountId,
      description: `Deck sale`,
    });

    res.json({ success: true, transfer });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a pending Stripe account
router.post("/create-pending-account", async (req, res) => {
  try {
    const { email } = req.body;

    // Create an account token
    const accountToken = await stripe.tokens.create({
      account: {
        business_type: "individual",
        individual: {
          email,
        },
        tos_shown_and_accepted: true,
      },
    });

    // Create a pending account in Stripe using the account token
    const account = await stripe.accounts.create({
      type: "custom",
      account_token: accountToken.id,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    res.json({ accountId: account.id });
  } catch (error) {
    console.error("Error creating pending Stripe account:", error);
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
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "account.updated": {
          const account = event.data.object;

          // Handle the event in the client
          // ...existing code...
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
