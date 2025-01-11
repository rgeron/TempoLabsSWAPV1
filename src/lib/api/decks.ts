import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { supabase } from "../supabase";
import { getUserBalance, transferBalance } from "./balance";
import { updatePurchasedDecks } from "./profile";

export const createDeck = async (
  deck: Partial<Deck>,
  file: File,
): Promise<Deck> => {
  try {
    const { data: newDeck, error: deckError } = await supabase
      .from("decks")
      .insert({
        ...deck,
        purchase_history: [], // Initialize empty purchase history
      })
      .select()
      .single();

    if (deckError) throw deckError;
    return newDeck;
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
  amount: number,
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
  amount: number,
): Promise<void> => {
  try {
    // Get deck info to get creator ID
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("creatorid, price")
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;

    // Check user's balance
    const balance = await getUserBalance(userId);
    if (balance < amount) {
      throw new Error(`Insufficient balance. Need ${amount - balance} more.`);
    }

    // Transfer balance from buyer to seller
    await transferBalance(userId, deck.creatorid, amount);

    // Record the purchase in deck's history
    await recordPurchase(deckId, userId, amount);

    // Update user's purchased decks list
    await updatePurchasedDecks(userId, deckId);
  } catch (error) {
    console.error("Error in purchaseDeck:", error);
    throw error;
  }
};

export const getPurchaseDate = async (
  userId: string,
  deckId: string,
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
