import { supabase } from "../supabase";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const STRIPE_API_URL = `${CLIENT_URL}/api`;

// Create or retrieve a Stripe Connect account
export const createConnectAccount = async (userId: string) => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-connect-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Failed to create Connect account");
    return await response.json();
  } catch (error) {
    console.error("Error creating Connect account:", error);
    throw error;
  }
};

// Get Stripe Connect onboarding link
export const getOnboardingLink = async (userId: string) => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-onboarding-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Failed to create onboarding link");
    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Error getting onboarding link:", error);
    throw error;
  }
};

// Create a pending Stripe account
export const createPendingAccount = async (email: string) => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-pending-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok)
      throw new Error("Failed to create pending Stripe account");
    return await response.json();
  } catch (error) {
    console.error("Error creating pending Stripe account:", error);
    throw error;
  }
};

// Create a checkout session for adding credits
export const createCreditCheckoutSession = async (
  userId: string,
  amount: number
) => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount,
        isRecharge: true,
      }),
    });

    if (!response.ok) throw new Error("Failed to create checkout session");
    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

// Process a deck purchase
export const processDeckPurchase = async (
  buyerId: string,
  deckId: string,
  amount: number
) => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/process-deck-purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId,
        deckId,
        amount,
      }),
    });

    if (!response.ok) throw new Error("Failed to process purchase");
    return await response.json();
  } catch (error) {
    console.error("Error processing deck purchase:", error);
    throw error;
  }
};

// Get account balance and status
export const getAccountStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "stripe_connect_id, stripe_connect_status, balance, total_earnings"
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting account status:", error);
    throw error;
  }
};

// Request a payout (withdrawal)
export const requestPayout = async (userId: string, amount: number) => {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount,
      }),
    });

    if (!response.ok) throw new Error("Failed to create payout");
    return await response.json();
  } catch (error) {
    console.error("Error requesting payout:", error);
    throw error;
  }
};
