import { supabase } from "../supabase";

export interface Review {
  id: string;
  deck_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

// Create a new review
export const createReview = async (
  deckId: string,
  userId: string,
  rating: number,
  comment: string,
): Promise<Review> => {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      deck_id: deckId,
      user_id: userId,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all reviews for a deck
export const getDeckReviews = async (deckId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      profiles:user_id (username, avatar_url)
    `,
    )
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Update a review
export const updateReview = async (
  reviewId: string,
  rating: number,
  comment: string,
): Promise<Review> => {
  const { data, error } = await supabase
    .from("reviews")
    .update({ rating, comment, updated_at: new Date().toISOString() })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) throw error;
};

// Check if user has already reviewed a deck
export const hasUserReviewedDeck = async (
  userId: string,
  deckId: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("deck_id", deckId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
};
