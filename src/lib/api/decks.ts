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

export const uploadFlashcardsFile = async (
  file: File,
  userId: string,
  deckId: string,
) => {
  // Always save as .txt regardless of original extension
  const filePath = `${userId}/${deckId}.txt`;

  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .upload(filePath, file, {
      upsert: true, // Replace if exists
    });

  if (error) {
    console.error("Error uploading file:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("flashcards-files").getPublicUrl(filePath);

  return { publicUrl, filePath };
};

export const getFlashcards = async (
  deckId: string,
  creatorId: string,
): Promise<FlashCard[]> => {
  try {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    // Use consistent .txt extension
    const filePath = `${creatorId}/${deckId}.txt`;

    // Download the file content
    const { data, error } = await supabase.storage
      .from("flashcards-files")
      .download(filePath);

    if (error) {
      console.error("Error downloading file:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No file data received");
    }

    // Parse the text file content
    const text = await data.text();
    const lines = text.split("\n").filter((line) => line.trim());

    // Parse the flashcards
    const flashcards: FlashCard[] = [];
    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i] && lines[i + 1]) {
        flashcards.push({
          front: lines[i].trim(),
          back: lines[i + 1].trim(),
        });
      }
    }

    return flashcards;
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
};

export const createDeck = async (deck: NewDeck, file: File): Promise<Deck> => {
  try {
    // First create the deck to get its ID
    const { data: newDeck, error: deckError } = await supabase
      .from("decks")
      .insert({
        ...deck,
        flashcards_file_url: null, // Will update this after file upload
      })
      .select()
      .single();

    if (deckError) throw deckError;

    // Then upload the file using both creator ID and deck ID
    const { publicUrl, filePath } = await uploadFlashcardsFile(
      file,
      deck.creatorid,
      newDeck.id,
    );

    // Update the deck with both the file URL and path
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

// Rest of the file remains the same...

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
  // First get the deck to get the file URL and creator ID
  const { data: deck, error: getDeckError } = await supabase
    .from("decks")
    .select("flashcards_file_url, creatorid")
    .eq("id", deckId)
    .single();

  if (getDeckError) {
    console.error("Error getting deck:", getDeckError);
    throw getDeckError;
  }

  // If there's a file, delete it from storage
  if (deck?.creatorid) {
    const filePath = `${deck.creatorid}/${deckId}.txt`;
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
