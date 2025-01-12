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
  apiVersion: "2023-10-16",
});

// Import the purchaseDeck function
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

// Create a checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, deckTitle, price } = req.body;

    if (!userId || !price) {
      throw new Error("Missing required parameters");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: deckTitle || "Balance Recharge",
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
        userId,
        isRecharge: "true",
        amount: price.toString(),
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
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        const { userId, isRecharge, amount } = session.metadata;
        const amountInDollars = parseFloat(amount);

        if (isRecharge === "true") {
          // Handle balance recharge
          const { error: balanceError } = await supabase
            .from("profiles")
            .update({ balance: supabase.sql`balance + ${amountInDollars}` })
            .eq("id", userId);

          if (balanceError) {
            console.error("Error updating balance:", balanceError);
            return res.status(500).send("Failed to update balance");
          }

          console.log(
            `Successfully recharged balance for user ${userId} with amount $${amountInDollars}`,
          );
        }

        res.json({ received: true });
      } catch (error) {
        console.error("Error processing webhook:", error);
        return res.status(500).send("Failed to process webhook");
      }
    }
  },
);

// Export the router to be used in server.js
module.exports = router;
