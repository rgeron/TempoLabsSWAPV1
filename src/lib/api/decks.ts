import { supabase } from "../supabase";
import type { Database } from "@/types/supabase";

type Deck = Database["public"]["Tables"]["decks"]["Row"];
type NewDeck = Database["public"]["Tables"]["decks"]["Insert"];

export const createDeck = async (deck: NewDeck) => {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      ...deck,
      creatorid: deck.creatorid, // ensure correct case
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating deck:", error);
    throw error;
  }
  return data;
};

export const getAllDecks = async () => {
  const { data, error } = await supabase
    .from("decks")
    .select(
      `
      *,
      profiles:creatorid (username, avatar_url)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting all decks:", error);
    throw error;
  }
  return data;
};

export const getUserDecks = async (userId: string) => {
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
    .select("likedDeckIds")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const likedDeckIds = [...(profile?.likedDeckIds || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ likedDeckIds })
    .eq("id", userId);

  if (error) throw error;
};

export const purchaseDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("purchasedDeckIds")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const purchasedDeckIds = [...(profile?.purchasedDeckIds || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ purchasedDeckIds })
    .eq("id", userId);

  if (error) throw error;
};

export const parseFlashcardsFile = (content: string) => {
  const lines = content.split("\n");
  const flashcards = [];
  let separator = "\t";

  for (const line of lines) {
    if (line.startsWith("#separator:")) {
      separator = line.replace("#separator:", "").trim();
      continue;
    }
    if (line.startsWith("#") || !line.trim()) continue;

    const [front, back, tags] = line.split(separator);
    if (front && back) {
      flashcards.push({
        front: front.trim(),
        back: back.trim(),
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      });
    }
  }

  return flashcards;
};
