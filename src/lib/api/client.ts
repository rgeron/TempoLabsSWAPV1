import { supabase } from "../supabase";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const STRIPE_API_URL = `${CLIENT_URL}/api`;

// Create or retrieve a Stripe Connect account
export const createConnectAccount = async (userId: string) => {
  try {
    // Get user's email from Supabase auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);

    if (userError) throw userError;
    if (!user?.email) throw new Error("User email not found");

    const response = await fetch(`${STRIPE_API_URL}/create-connect-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });

    if (!response.ok) throw new Error("Failed to create Connect account");
    const { accountId } = await response.json();

    // Update Supabase with Connect account ID
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        stripe_connect_id: accountId,
        stripe_connect_status: "pending",
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return accountId;
  } catch (error) {
    console.error("Error creating Connect account:", error);
    throw error;
  }
};

// Get Stripe Connect onboarding link
export const getOnboardingLink = async (userId: string) => {
  try {
    // Get Connect account ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("stripe_connect_id")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const response = await fetch(`${STRIPE_API_URL}/create-onboarding-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: userData.stripe_connect_id }),
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
    // Get Connect account ID from Supabase
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select(
        "creatorid, profiles!decks_creatorid_fkey(stripe_connect_id, stripe_connect_status)"
      )
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    const seller = deckData.profiles;

    if (
      !seller?.stripe_connect_id ||
      seller.stripe_connect_status !== "active"
    ) {
      throw new Error("Seller's Stripe account is not properly set up");
    }

    const response = await fetch(`${STRIPE_API_URL}/process-deck-purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        accountId: seller.stripe_connect_id,
      }),
    });

    if (!response.ok) throw new Error("Failed to process purchase");
    const result = await response.json();

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
              purchaseDate: new Date().toISOString(),
              amount,
            },
          ]
        )}::jsonb`,
      })
      .eq("id", buyerId);

    if (buyerError) throw buyerError;

    // Update seller's earnings
    const { error: sellerError } = await supabase
      .from("profiles")
      .update({
        total_earnings: supabase.sql`coalesce(total_earnings, 0) + ${
          amount * 0.9
        }`,
        total_sales: supabase.sql`coalesce(total_sales, 0) + 1`,
      })
      .eq("id", deckData.creatorid);

    if (sellerError) throw sellerError;

    // Update deck's purchase history
    const { error: historyError } = await supabase
      .from("decks")
      .update({
        purchase_history: supabase.sql`coalesce(purchase_history, '[]'::jsonb) || ${JSON.stringify(
          [
            {
              buyerId,
              purchaseDate: new Date().toISOString(),
              amount,
            },
          ]
        )}::jsonb`,
      })
      .eq("id", deckId);

    if (historyError) throw historyError;

    return result;
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
    // Get Connect account ID from Supabase
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

    const response = await fetch(`${STRIPE_API_URL}/create-payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        accountId: userData.stripe_connect_id,
      }),
    });

    if (!response.ok) throw new Error("Failed to create payout");
    const result = await response.json();

    // Update user's balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        balance: supabase.sql`balance - ${amount}`,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return result;
  } catch (error) {
    console.error("Error requesting payout:", error);
    throw error;
  }
};

// Add a new function to get the user's Stripe account details
export const getStripeAccountDetails = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("stripe_connect_id, stripe_connect_status")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};
