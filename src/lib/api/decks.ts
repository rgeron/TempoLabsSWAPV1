import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { supabase } from "../supabase";
import { uploadFlashcardsFile, downloadFlashcardsFile } from "./flashcards";
import { getFlashcards } from "./flashcards";
import { transferBalance } from "./balance";

export const createDeck = async (
  deck: Partial<Deck>,
  file: File,
): Promise<Deck> => {
  try {
    // First create the deck to get its ID
    const { data: newDeck, error: deckError } = await supabase
      .from("decks")
      .insert({
        ...deck,
      })
      .select()
      .single();

    if (deckError) throw deckError;

    // Now upload the flashcards file using the new deck's ID
    const { publicUrl } = await uploadFlashcardsFile(
      file,
      deck.creatorid,
      newDeck.id,
    );

    // Update the deck with the file URL
    const { data: updatedDeck, error: updateError } = await supabase
      .from("decks")
      .update({
        flashcards_file_url: publicUrl,
      })
      .eq("id", newDeck.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedDeck;
  } catch (error) {
    console.error("Error in createDeck:", error);
    throw error;
  }
};

export const getAllDeckContents = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("decks")
      .select("id, creatorid");

    if (error) throw error;

    // Get the content of each deck by reading their flashcards
    const contents = await Promise.all(
      data.map((deck) =>
        getFlashcards(deck.id, deck.creatorid)
          .then((cards) =>
            cards.map((card) => `${card.front} ${card.back}`).join(" "),
          )
          .catch(() => ""),
      ),
    );

    return contents.filter((content) => content !== "");
  } catch (error) {
    console.error("Error fetching deck contents:", error);
    return [];
  }
};

export const getAllDecks = async (): Promise<DeckWithProfile[]> => {
  try {
    const { data: decks, error: decksError } = await supabase
      .from("decks")
      .select("*, profiles(username, avatar_url)")
      .order("created_at", { ascending: false });

    if (decksError) throw decksError;

    return decks.map((deck) => ({
      ...deck,
      creatorName: deck.profiles?.username || "Unknown Creator",
      creatorAvatar: deck.profiles?.avatar_url,
    }));
  } catch (error) {
    console.error("Error in getAllDecks:", error);
    throw error;
  }
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

  if (error) throw error;
  return data || [];
};

export const deleteDeck = async (deckId: string): Promise<void> => {
  const { error } = await supabase.from("decks").delete().eq("id", deckId);
  if (error) throw error;
};

const recordPurchase = async (
  deckId: string,
  buyerId: string,
  amount: number,
): Promise<void> => {
  // First get current purchase history
  const { data: deck, error: fetchError } = await supabase
    .from("decks")
    .select("purchase_history")
    .eq("id", deckId)
    .single();

  if (fetchError) throw fetchError;

  // Create new purchase record
  const newPurchase = {
    buyerId,
    purchaseDate: new Date().toISOString(),
    amount,
  };

  // Update with new purchase history
  const { error: updateError } = await supabase
    .from("decks")
    .update({
      purchase_history: [...(deck?.purchase_history || []), newPurchase],
    })
    .eq("id", deckId);

  if (updateError) throw updateError;
};
