import { supabase } from "../supabase";
import type { Database } from "@/types/supabase";
import type { FlashCard } from "@/types/marketplace";

type Deck = Database["public"]["Tables"]["decks"]["Row"];
type NewDeck = Database["public"]["Tables"]["decks"]["Insert"];
type DeckWithProfile = Deck & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

export const createDeck = async (deck: NewDeck, flashcardsFile: File) => {
  try {
    // 1. Upload the flashcards file to Supabase Storage
    const fileName = `${Date.now()}-${flashcardsFile.name}`;
    const { data: fileData, error: fileError } = await supabase.storage
      .from("flashcards")
      .upload(fileName, flashcardsFile);

    if (fileError) throw fileError;

    // 2. Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("flashcards").getPublicUrl(fileName);

    // 3. Create the deck with the file URL
    const { data, error } = await supabase
      .from("decks")
      .insert({
        ...deck,
        flashcardsurl: publicUrl,
        cardcount: await getFlashcardCount(flashcardsFile),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating deck:", error);
    throw error;
  }
};

export const getAllDecks = async (): Promise<DeckWithProfile[]> => {
  const { data, error } = await supabase
    .from("decks")
    .select(
      `
      *,
      profiles:creatorid (username, avatar_url)
    `,
    )
    .order("created_at", { ascending: false })
    .returns<DeckWithProfile[]>();

  if (error) {
    console.error("Error getting all decks:", error);
    throw error;
  }
  return data || [];
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

export const deleteDeck = async (deckId: string) => {
  // First get the deck to get the flashcards file URL
  const { data: deck, error: getDeckError } = await supabase
    .from("decks")
    .select("flashcardsurl")
    .eq("id", deckId)
    .single();

  if (getDeckError) throw getDeckError;

  if (deck?.flashcardsurl) {
    // Extract filename from URL
    const fileName = deck.flashcardsurl.split("/").pop();
    if (fileName) {
      // Delete the file from storage
      const { error: deleteFileError } = await supabase.storage
        .from("flashcards")
        .remove([fileName]);

      if (deleteFileError) throw deleteFileError;
    }
  }

  // Delete the deck record
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) throw error;
};

export const getFlashcards = async (
  flashcardsUrl: string,
): Promise<FlashCard[]> => {
  try {
    const response = await fetch(flashcardsUrl);
    if (!response.ok) throw new Error("Failed to fetch flashcards file");

    const content = await response.text();
    return parseFlashcardsFile(content);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
};

export const parseFlashcardsFile = (content: string): FlashCard[] => {
  const lines = content.split("\n");
  const flashcards: FlashCard[] = [];
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

const getFlashcardCount = async (file: File): Promise<number> => {
  const content = await file.text();
  return parseFlashcardsFile(content).length;
};

export const likeDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const likeddeckids = [...(profile?.likeddeckids || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) throw error;
};

export const unlikeDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("likeddeckids")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const likeddeckids = (profile?.likeddeckids || []).filter(
    (id) => id !== deckId,
  );

  const { error } = await supabase
    .from("profiles")
    .update({ likeddeckids })
    .eq("id", userId);

  if (error) throw error;
};

export const purchaseDeck = async (userId: string, deckId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("purchaseddeckids")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const purchaseddeckids = [...(profile?.purchaseddeckids || []), deckId];

  const { error } = await supabase
    .from("profiles")
    .update({ purchaseddeckids })
    .eq("id", userId);

  if (error) throw error;
};
