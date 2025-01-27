import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { supabase } from "../supabase";
import { getFlashcards, uploadFlashcardsFile } from "./flashcards";

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
            cards.map((card) => `${card.front} ${card.back}`).join(" ")
          )
          .catch(() => "")
      )
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
  amount: number
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

export const updateDeckPurchaseHistory = async (
  deckId: string,
  buyerId: string,
  amount: number
): Promise<void> => {
  const purchaseDate = new Date().toISOString();
  const { error } = await supabase
    .from("decks")
    .update({
      purchase_history: supabase.sql`coalesce(purchase_history, '[]'::jsonb) || ${JSON.stringify(
        [{ buyerId, purchaseDate, amount }]
      )}::jsonb`,
    })
    .eq("id", deckId);

  if (error) throw error;
};

// Process a deck purchase
export const processDeckPurchase = async (
  buyerId: string,
  deckId: string,
  amount: number
) => {
  try {
    // Get Connect account ID from Supabase
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select(
        "creatorid, profiles!decks_creatorid_fkey(stripe_connect_id, stripe_connect_status)"
      )
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    const seller = deckData.profiles;

    if (
      !seller?.stripe_connect_id ||
      seller.stripe_connect_status !== "active"
    ) {
      throw new Error("Seller's Stripe account is not properly set up");
    }

    const response = await fetch(`${STRIPE_API_URL}/process-deck-purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        accountId: seller.stripe_connect_id,
      }),
    });

    if (!response.ok) throw new Error("Failed to process purchase");
    const result = await response.json();

    // Update buyer's profile
    const { error: buyerError } = await supabase
      .from("profiles")
      .update({
        balance: supabase.sql`balance - ${amount}`,
        purchaseddeckids: supabase.sql`array_append(purchaseddeckids, ${deckId})`,
        purchaseinfo: supabase.sql`coalesce(purchaseinfo, '[]'::jsonb) || ${JSON.stringify(
          [
            {
              deckId,
              purchaseDate: new Date().toISOString(),
              amount,
            },
          ]
        )}::jsonb`,
      })
      .eq("id", buyerId);

    if (buyerError) throw buyerError;

    // Update seller's earnings
    const { error: sellerError } = await supabase
      .from("profiles")
      .update({
        total_earnings: supabase.sql`coalesce(total_earnings, 0) + ${
          amount * 0.9
        }`,
        total_sales: supabase.sql`coalesce(total_sales, 0) + 1`,
      })
      .eq("id", deckData.creatorid);

    if (sellerError) throw sellerError;

    // Update deck's purchase history
    const { error: historyError } = await supabase
      .from("decks")
      .update({
        purchase_history: supabase.sql`coalesce(purchase_history, '[]'::jsonb) || ${JSON.stringify(
          [
            {
              buyerId,
              purchaseDate: new Date().toISOString(),
              amount,
            },
          ]
        )}::jsonb`,
      })
      .eq("id", deckId);

    if (historyError) throw historyError;

    return result;
  } catch (error) {
    console.error("Error processing deck purchase:", error);
    throw error;
  }
};
