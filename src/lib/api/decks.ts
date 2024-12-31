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

export const getFlashcardsFromContent = (content: string): FlashCard[] => {
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

export const createDeck = async (deck: NewDeck, flashcardsFile: File) => {
  try {
    // Read the file content
    const content = await flashcardsFile.text();
    const flashcards = getFlashcardsFromContent(content);

    // Create the deck with the file content
    const { data, error } = await supabase
      .from("decks")
      .insert({
        ...deck,
        flashcardcontent: content,
        cardcount: flashcards.length,
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
  const { error } = await supabase.from("decks").delete().eq("id", deckId);

  if (error) {
    console.error("Error deleting deck:", error);
    throw error;
  }
};

export const getFlashcards = async (deckId: string): Promise<FlashCard[]> => {
  try {
    const { data, error } = await supabase
      .from("decks")
      .select("flashcardcontent")
      .eq("id", deckId)
      .single();

    if (error) throw error;
    if (!data?.flashcardcontent) return [];

    return getFlashcardsFromContent(data.flashcardcontent);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
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
