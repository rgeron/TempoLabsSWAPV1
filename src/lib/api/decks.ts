import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { supabase } from "../supabase";
import { uploadFlashcardsFile } from "./flashcards";
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

export const purchaseDeck = async (
  userId: string,
  deckId: string,
  amount: number,
): Promise<void> => {
  try {
    // First get deck info to get creator ID
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("creatorid, purchase_history")
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    if (!deck) throw new Error("Deck not found");

    // Check if already purchased
    const isPurchased = deck.purchase_history?.some(
      (purchase) => purchase.buyerId === userId,
    );
    if (isPurchased) {
      throw new Error("You have already purchased this deck");
    }

    // Get the creator ID from the deck and transfer the balance
    const sellerId = deck.creatorid;
    if (!sellerId) throw new Error("Creator ID not found");

    await transferBalance(userId, sellerId, amount);

    // Record purchase in deck's history
    await recordPurchase(deckId, userId, amount);

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("purchaseddeckids, purchaseinfo")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // Update user's purchased decks list
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        purchaseddeckids: [...(profile?.purchaseddeckids || []), deckId],
        purchaseinfo: [
          ...(profile?.purchaseinfo || []),
          { deckId, purchaseDate: new Date().toISOString() },
        ],
      })
      .eq("id", userId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error in purchaseDeck:", error);
    throw error;
  }
};

export const downloadFlashcardsFile = async (
  deckId: string,
  creatorId: string,
): Promise<string> => {
  try {
    // First get the deck to get the file URL
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("flashcards_file_url")
      .eq("id", deckId)
      .eq("creatorid", creatorId)
      .single();

    if (deckError) throw deckError;
    if (!deck?.flashcards_file_url)
      throw new Error("Flashcards file not found");

    // Download the file content
    const response = await fetch(deck.flashcards_file_url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error("Error downloading flashcards file:", error);
    throw error;
  }
};
