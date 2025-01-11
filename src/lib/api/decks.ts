import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { supabase } from "../supabase";
import { uploadFlashcardsFile } from "./flashcards";

export const createDeck = async (
  deck: Partial<Deck>,
  file: File
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
      newDeck.id
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

export const recordPurchase = async (
  deckId: string,
  buyerId: string,
  amount: number
): Promise<void> => {
  const purchaseRecord = {
    date: new Date().toISOString(),
    buyerId,
    amount,
  };

  const { error } = await supabase.rpc("record_deck_purchase", {
    p_deck_id: deckId,
    p_purchase_record: purchaseRecord,
  });

  if (error) throw error;
};

export const purchaseDeck = async (
  userId: string,
  deckId: string,
  amount: number
): Promise<void> => {
  try {
    const purchaseDate = new Date().toISOString();

    // Call the database function to handle the purchase
    const { error } = await supabase.rpc("process_deck_purchase", {
      p_buyer_id: userId,
      p_deck_id: deckId,
      p_amount: amount,
      p_purchase_date: purchaseDate,
    });

    if (error) {
      console.error("Error processing deck purchase:", error);
      throw new Error("Deck purchase failed. Please try again.");
    }
  } catch (error) {
    console.error("Error in purchaseDeck:", error);
    throw error;
  }
};

export const getPurchaseDate = async (
  userId: string,
  deckId: string
): Promise<string | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("purchaseinfo")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const purchaseInfo = data?.purchaseinfo as Array<{
    deckId: string;
    purchaseDate: string;
  }>;
  const purchase = purchaseInfo?.find((p) => p.deckId === deckId);
  return purchase?.purchaseDate || null;
};
