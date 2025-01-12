import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { supabase } from "../supabase";
import { uploadFlashcardsFile } from "./flashcards";

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

export const purchaseDeck = async (
  userId: string,
  deckId: string,
  amount: number,
): Promise<void> => {
  try {
    // Get deck and creator info
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("creatorid, purchase_history")
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    if (!deck) throw new Error("Deck not found");

    // Get buyer's current balance
    const { data: buyer, error: buyerError } = await supabase
      .from("profiles")
      .select("balance, purchaseddeckids, purchaseinfo")
      .eq("id", userId)
      .single();

    if (buyerError) throw buyerError;
    if (!buyer) throw new Error("Buyer profile not found");

    // Check if already purchased
    if (buyer.purchaseddeckids?.includes(deckId)) {
      throw new Error("Deck already purchased");
    }

    // Check sufficient balance
    if ((buyer.balance || 0) < amount) {
      throw new Error(
        `Insufficient balance. Required: ${amount}, Available: ${buyer.balance}`,
      );
    }

    // Get seller's current balance
    const { data: seller, error: sellerError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", deck.creatorid)
      .single();

    if (sellerError) throw sellerError;
    if (!seller) throw new Error("Seller profile not found");

    // Update buyer's balance and purchased decks
    const { error: buyerUpdateError } = await supabase
      .from("profiles")
      .update({
        balance: (buyer.balance || 0) - amount,
        purchaseddeckids: [...(buyer.purchaseddeckids || []), deckId],
        purchaseinfo: [
          ...(buyer.purchaseinfo || []),
          {
            deckId,
            purchaseDate: new Date().toISOString(),
          },
        ],
      })
      .eq("id", userId);

    if (buyerUpdateError) throw buyerUpdateError;

    // Update seller's balance
    const { error: sellerUpdateError } = await supabase
      .from("profiles")
      .update({
        balance: (seller.balance || 0) + amount,
      })
      .eq("id", deck.creatorid);

    if (sellerUpdateError) throw sellerUpdateError;

    // Update deck's purchase history
    const newPurchaseHistory = [
      ...(deck.purchase_history || []),
      {
        buyerId: userId,
        purchaseDate: new Date().toISOString(),
        amount,
      },
    ];

    const { error: deckUpdateError } = await supabase
      .from("decks")
      .update({
        purchase_history: newPurchaseHistory,
      })
      .eq("id", deckId);

    if (deckUpdateError) throw deckUpdateError;
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

export const getFlashcards = async (deckId: string, creatorId: string) => {
  try {
    const fileContent = await downloadFlashcardsFile(deckId, creatorId);
    const lines = fileContent
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    return lines.map((line) => {
      const [front, back] = line.split("|").map((part) => part.trim());
      return { front, back };
    });
  } catch (error) {
    console.error("Error getting flashcards:", error);
    return [];
  }
};
