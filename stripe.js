require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");

const router = express.Router();
router.use(express.json());

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

// Create a checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      throw new Error("Missing required parameters: userId and amount are required");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Balance Recharge",
            },
            unit_amount: Math.round(amount * 100), // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/app/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/app/purchase-cancelled`,
      metadata: {
        userId,
        amount: amount.toString(),
        type: "recharge",
      },
    });

    if (!session?.url) {
      throw new Error("Failed to create checkout session URL");
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
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

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        const { userId, amount, type } = session.metadata;
        const amountToAdd = parseFloat(amount);

        if (type === "recharge" && !isNaN(amountToAdd)) {
          // Get current balance
          const { data: userData, error: fetchError } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", userId)
            .single();

          if (fetchError) throw fetchError;

          const currentBalance = userData.balance || 0;
          const newBalance = currentBalance + amountToAdd;

          // Update balance
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ balance: newBalance })
            .eq("id", userId);

          if (updateError) throw updateError;

          console.log(
            `Successfully added $${amountToAdd} to user ${userId}'s balance`,
          );
        }

        res.json({ received: true });
      } catch (error) {
        console.error("Error processing payment:", error);
        return res.status(500).send("Failed to process payment");
      }
    } else {
      res.json({ received: true });
    }
  },
);

module.exports = router;
