require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");

// Create a Router instead of a full Express app
const router = express.Router();

// Ensure you have a Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key in environment variables");
}

// Initialize the Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

// Create a checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { deckId, userId, deckTitle, price } = req.body;

    if (!deckId || !userId || !deckTitle || !price) {
      throw new Error("Missing required parameters");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: deckTitle,
            },
            unit_amount: Math.round(price * 100), // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${process.env.CLIENT_URL}/app/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/app/purchase-cancelled`,
      metadata: {
        deckId,
        userId,
      },
    });

    if (!session?.url) {
      throw new Error("Failed to create checkout session URL");
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Webhook handler
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Important: raw body for Stripe signature verification
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

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        // Extract the deck and user IDs from session metadata
        const { deckId, userId } = session.metadata;

        // Example: update the purchase in your database
        // await purchaseDeck(userId, deckId);

        console.log(
          `Successfully processed purchase for deck ${deckId} by user ${userId}`
        );
      } catch (error) {
        console.error("Error processing purchase:", error);
        return res.status(500).send("Failed to process purchase");
      }
    }

    res.json({ received: true });
  }
);

// Export the router to be used in server.js
module.exports = router;
