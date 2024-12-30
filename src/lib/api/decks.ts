import { supabase } from "../supabase";
import type { Database } from "@/types/supabase";

type Deck = Database["public"]["Tables"]["decks"]["Row"];
type NewDeck = Database["public"]["Tables"]["decks"]["Insert"];

export const createDeck = async (deck: NewDeck) => {
  const { data, error } = await supabase
    .from("decks")
    .insert(deck)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllDecks = async () => {
  const { data, error } = await supabase
    .from("decks")
    .select(
      `
      *,
      profiles:creatorId (username, avatar_url)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserDecks = async (userId: string) => {
  const { data, error } = await supabase
    .from("decks")
    .select()
    .eq("creatorId", userId);

  if (error) throw error;
  return data;
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
