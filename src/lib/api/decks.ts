import { supabase } from "../supabase";
import type { Database } from "@/types/supabase";

type Deck = Database["public"]["Tables"]["decks"]["Row"];
type NewDeck = Database["public"]["Tables"]["decks"]["Insert"];
type DeckWithProfile = Deck & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

export const createDeck = async (deck: NewDeck) => {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      ...deck,
      creatorid: deck.creatorid,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating deck:", error);
    throw error;
  }
  return data;
};

export const getAllDecks = async (): Promise<DeckWithProfile[]> => {
  const { data, error } = await supabase
    .from("decks")
    .select(
      `
      *,
      profiles:creatorid (username, avatar_url)
    `,
    )
    .order("created_at", { ascending: false })
    .returns<DeckWithProfile[]>();

  if (error) {
    console.error("Error getting all decks:", error);
    throw error;
  }
  return data || [];
};

export const getUserDecks = async (userId: string): Promise<Deck[]> => {
  if (!userId) {
    console.error("No user ID provided to getUserDecks");
    return [];
  }

  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("creatorid", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting user decks:", error);
    throw error;
  }

  return data || [];
};

export const deleteDeck = async (deckId: string) => {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) {
    console.error("Error deleting deck:", error);
    throw error;
  }
};

export const likeDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const likeddeckids = [...(profile?.likeddeckids || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) throw error;
};

export const unlikeDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const likeddeckids = (profile?.likeddeckids || []).filter(
    (id) => id !== deckId,
  );

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) throw error;
};

export const purchaseDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("purchaseddeckids")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const purchaseddeckids = [...(profile?.purchaseddeckids || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ purchaseddeckids })
    .eq("id", userId);

  if (error) throw error;
};
