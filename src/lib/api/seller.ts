import { STRIPE_API_URL } from "../config"; // Updated import
import { supabase } from "../supabase";
import { postStripeRequest } from "./stripeUtils";

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

    // Using the helper function
    const { accountId } = await postStripeRequest<{ accountId: string }>(
      "create-connect-account",
      { email: user.email }
    );

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

    // Using the helper function
    const { url } = await postStripeRequest<{ url: string }>(
      "create-onboarding-link",
      { accountId: userData.stripe_connect_id }
    );
    return url;
  } catch (error) {
    console.error("Error getting onboarding link:", error);
    throw error;
  }
};

// Create a pending Stripe account
export const createPendingAccount = async (email: string) => {
  try {
    return await postStripeRequest("create-pending-account", { email });
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
    const { url } = await postStripeRequest<{ url: string }>(
      "create-checkout-session",
      {
        userId,
        amount,
        isRecharge: true,
      }
    );
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

    const response = await postStripeRequest<{ /*stripe response*/ }>(
      "process-deck-purchase",
      {
        amount,
        accountId: seller.stripe_connect_id,
      }
    );

    // Update buyer's profile
    const { error: buyerError } = await supabase
      .from("profiles")
      .update({
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

    return response;
  } catch (error) {
    console.error("Error processing deck purchase:", error);
    throw error;
  }
};

// Add a new function to process fund withdrawals
export const withdrawFunds = async (amount: number) => {
	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError) throw userError;
	if (!user?.id) throw new Error("User not authenticated");
	const userId = user.id;

	try {
		return await postStripeRequest("withdraw-funds", { userId, amount });
	} catch (error) {
		console.error("Error withdrawing funds:", error);
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

// New: update seller status function to be triggered after Stripe onboarding callback
export const updateSellerStatus = async (userId: string, newStatus: string) => {
  const { error } = await supabase
    .from("sellers")
    .update({
      stripe_connect_status: newStatus,
    })
    .eq("id", userId);
  if (error) throw error;
  return true;
};
