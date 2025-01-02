import { supabase } from "../supabase";
import type { Database } from "@/types/supabase";
import type { Deck, DeckWithProfile } from "@/types/marketplace";
import { FlashCard } from "@/types/marketplace";

type NewDeck = Omit<
  Database["public"]["Tables"]["decks"]["Insert"],
  "id" | "created_at" | "updated_at"
>;

type PurchaseInfo = {
  deckId: string;
  purchaseDate: string;
};

export const uploadFlashcardsFile = async (file: File, userId: string) => {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading file:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("flashcards-files").getPublicUrl(filePath);

  return publicUrl;
};

export const getFlashcards = async (deckId: string): Promise<FlashCard[]> => {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId);

  if (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }

  return data as FlashCard[];
};

export const createDeck = async (deck: NewDeck, file: File): Promise<Deck> => {
  try {
    // First upload the file
    const flashcardsFileUrl = await uploadFlashcardsFile(file, deck.creatorid);

    // Then create the deck with the file URL
    const { data, error } = await supabase
      .from("decks")
      .insert({
        ...deck,
        flashcards_file_url: flashcardsFileUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating deck:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createDeck:", error);
    throw error;
  }
};

// Get user profile by ID
const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
};

// Define return type for getAllDecks
export const getAllDecks = async (): Promise<DeckWithProfile[]> => {
  try {
    // First, get all decks
    const { data: decks, error: decksError } = await supabase
      .from("decks")
      .select("*")
      .order("created_at", { ascending: false });

    if (decksError) throw decksError;

    // Then, fetch creator profiles for each deck
    const decksWithProfiles = await Promise.all(
      decks.map(async (deck) => {
        const profile = await getUserProfile(deck.creatorid);
        return {
          ...deck,
          creatorName: profile?.username || "Unknown Creator",
          creatorAvatar: profile?.avatar_url,
          profiles: profile
            ? {
                username: profile.username,
                avatar_url: profile.avatar_url,
              }
            : null,
        };
      }),
    );

    return decksWithProfiles;
  } catch (error) {
    console.error("Error in getAllDecks:", error);
    throw error;
  }
};

export const purchaseDeck = async (
  userId: string,
  deckId: string,
): Promise<void> => {
  const purchaseDate = new Date().toISOString();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("purchaseddeckids, purchaseinfo")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const purchaseddeckids = [...(profile?.purchaseddeckids || []), deckId];
  const purchaseinfo = [
    ...(profile?.purchaseinfo || []),
    { deckId, purchaseDate },
  ];

  const { error } = await supabase
    .from("profiles")
    .update({ purchaseddeckids, purchaseinfo })
    .eq("id", userId);

  if (error) throw error;
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

  const purchaseInfo = data?.purchaseinfo as PurchaseInfo[];
  const purchase = purchaseInfo?.find((p) => p.deckId === deckId);
  return purchase?.purchaseDate || null;
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

export const deleteDeck = async (deckId: string): Promise<void> => {
  // First get the deck to get the file URL
  const { data: deck, error: getDeckError } = await supabase
    .from("decks")
    .select("flashcards_file_url")
    .eq("id", deckId)
    .single();

  if (getDeckError) {
    console.error("Error getting deck:", getDeckError);
    throw getDeckError;
  }

  // If there's a file, delete it from storage
  if (deck?.flashcards_file_url) {
    const filePath = deck.flashcards_file_url.split("/").pop();
    const { error: deleteFileError } = await supabase.storage
      .from("flashcards-files")
      .remove([filePath]);

    if (deleteFileError) {
      console.error("Error deleting file:", deleteFileError);
      throw deleteFileError;
    }
  }

  // Then delete the deck
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) {
    console.error("Error deleting deck:", error);
    throw error;
  }
};

export const likeDeck = async (
  userId: string,
  deckId: string,
): Promise<void> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error getting profile:", profileError);
    throw profileError;
  }

  const likeddeckids = [...(profile?.likeddeckids || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) {
    console.error("Error updating liked decks:", error);
    throw error;
  }
};

export const unlikeDeck = async (
  userId: string,
  deckId: string,
): Promise<void> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error getting profile:", profileError);
    throw profileError;
  }

  const likeddeckids = (profile?.likeddeckids || []).filter(
    (id) => id !== deckId,
  );

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) {
    console.error("Error updating liked decks:", error);
    throw error;
  }
};
