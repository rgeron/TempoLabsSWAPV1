import * as cors from "cors";
import * as express from "express";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import Stripe from "stripe";

admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * 1️⃣ Create a Stripe Connected Account for a Seller
 */
app.post("/create-stripe-account", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email" });
    }

    const userRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userRef.get();

    let stripeAccountId = userDoc.data()?.stripeAccountId;

    // If user doesn't have a Stripe account, create one
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US", // Change based on your needs
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;
      await userRef.update({ stripeAccountId });
    }

    // Create a direct Stripe onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: "https://yourdomain.com/reauth",
      return_url: "https://yourdomain.com/dashboard", // Redirect after completion
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe onboarding link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 2️⃣ Create a Stripe Checkout Session (Buyer pays for a deck)
 */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { buyerId, sellerId, deckId, price } = req.body;

    if (!buyerId || !sellerId || !deckId || !price) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // Fetch the seller's Stripe Account ID
    const sellerRef = admin.firestore().collection("users").doc(sellerId);
    const sellerDoc = await sellerRef.get();

    if (!sellerDoc.exists) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const stripeAccountId = sellerDoc.data()?.stripeAccountId;

    if (!stripeAccountId) {
      return res.status(400).json({ error: "Seller has no Stripe account" });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://yourdomain.com/cancel`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Deck #${deckId}` },
            unit_amount: price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(price * 0.1 * 100), // 10% platform fee
        transfer_data: {
          destination: stripeAccountId, // Send payment to seller
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 3️⃣ Handle Stripe Webhooks (Listen for successful payments)
 */
app.post("/stripe-webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig as string,
      functions.config().stripe.webhook_secret
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const deckId = session.metadata?.deckId;
    const buyerId = session.metadata?.buyerId;

    if (!deckId || !buyerId) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    await admin.firestore().collection("purchases").doc(session.id).set({
      deckId,
      buyerId,
      status: "completed",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Payment successful for deck:", deckId);
  }

  res.json({ received: true });
});

/**
 * 4️⃣ Expose the Express app as a Firebase Cloud Function
 */
exports.stripe = functions.https.onRequest(app);
