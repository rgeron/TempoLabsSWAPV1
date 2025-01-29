import { STRIPE_API_URL } from "../config";
import { supabase } from "../supabase";

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "username, avatar_url, balance, purchaseddeckids, likeddeckids, followedcreators"
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Simplified likeDeck function
export const likeDeck = async (
  userId: string,
  deckId: string
): Promise<void> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error getting profile:", profileError);
    throw profileError;
  }

  const likeddeckids = [...(profile?.likeddeckids || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) {
    console.error("Error updating liked decks:", error);
    throw error;
  }
};

// Simplified unlikeDeck function
export const unlikeDeck = async (
  userId: string,
  deckId: string
): Promise<void> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error getting profile:", profileError);
    throw profileError;
  }

  const likeddeckids = (profile?.likeddeckids || []).filter(
    (id) => id !== deckId
  );

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) {
    console.error("Error updating liked decks:", error);
    throw error;
  }
};

// Update followed creators
export const updateFollowedCreators = async (
  userId: string,
  creatorId: string,
  isFollowing: boolean
): Promise<void> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("followedcreators")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  let followedcreators: string[];
  if (isFollowing) {
    followedcreators = [...(profile?.followedcreators || []), creatorId];
  } else {
    followedcreators = (profile?.followedcreators || []).filter(
      (id) => id !== creatorId
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ followedcreators })
    .eq("id", userId);

  if (updateError) throw updateError;
};

// Add a new function to update the user's balance
export const updateUserBalance = async (
  userId: string,
  amount: number
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ balance: supabase.sql`balance + ${amount}` })
    .eq("id", userId);

  if (error) throw error;
};

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

// Create a pending Stripe account
export const createPendingStripeAccount = async (email: string) => {
  const response = await fetch(`${STRIPE_API_URL}/create-pending-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error("Failed to create pending Stripe account");
  return await response.json();
};
