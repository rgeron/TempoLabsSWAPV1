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

// Update purchased decks
export const updatePurchasedDecks = async (
  userId: string,
  deckId: string
): Promise<void> => {
  const purchaseDate = new Date().toISOString();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("purchaseddeckids, purchaseinfo")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const purchaseddeckids = [...(profile?.purchaseddeckids || []), deckId];
  const purchaseinfo = [
    ...(profile?.purchaseinfo || []),
    { deckId, purchaseDate }
  ];

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ purchaseddeckids, purchaseinfo })
    .eq("id", userId);

  if (updateError) throw updateError;
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
