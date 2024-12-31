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

// Fonction pour parser un fichier flashcard à partir d'un contenu texte
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

// Fonction pour créer un deck avec un fichier flashcards
export const createDeck = async (deck: NewDeck, flashcardsFile: File) => {
  try {
    // Upload du fichier dans le bucket privé
    const filePath = `decks/${deck.creatorid}/${flashcardsFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("flashcards-files")
      .upload(filePath, flashcardsFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Stocker le chemin du fichier dans la base de données
    const { data, error } = await supabase
      .from("decks")
      .insert({
        ...deck,
        flashcards_file_url: filePath,
        cardcount: 0, // Initialement 0, sera mis à jour après traitement
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

// Fonction pour récupérer une URL signée d'un fichier
export const getSignedUrl = async (filePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .createSignedUrl(filePath, 60 * 60); // URL valide pendant 1 heure

  if (error) {
    console.error("Error creating signed URL:", error);
    throw error;
  }

  return data.signedUrl;
};

// Récupérer tous les decks
export const getAllDecks = async (): Promise<DeckWithProfile[]> => {
  const { data, error } = await supabase
    .from("decks")
    .select(
      `
      *,
      profiles:creatorid (username, avatar_url)
    `
    )
    .order("created_at", { ascending: false })
    .returns<DeckWithProfile[]>();

  if (error) {
    console.error("Error getting all decks:", error);
    throw error;
  }
  return data || [];
};

// Récupérer les decks d'un utilisateur
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

// Supprimer un deck
export const deleteDeck = async (deckId: string) => {
  try {
    // Récupérer le chemin du fichier avant suppression
    const { data, error } = await supabase
      .from("decks")
      .select("flashcards_file_url")
      .eq("id", deckId)
      .single();

    if (error) throw error;

    // Supprimer le fichier du Storage
    if (data?.flashcards_file_url) {
      await supabase.storage
        .from("flashcards-files")
        .remove([data.flashcards_file_url]);
    }

    // Supprimer le deck
    const { error: deleteError } = await supabase
      .from("decks")
      .delete()
      .eq("id", deckId);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error("Error deleting deck:", error);
    throw error;
  }
};

// Récupérer les flashcards d'un deck
export const getFlashcards = async (deckId: string): Promise<FlashCard[]> => {
  try {
    // Récupérer le chemin du fichier
    const { data, error } = await supabase
      .from("decks")
      .select("flashcards_file_url")
      .eq("id", deckId)
      .single();

    if (error) throw error;
    if (!data?.flashcards_file_url) return [];

    // Obtenir une URL signée pour télécharger le fichier
    const signedUrl = await getSignedUrl(data.flashcards_file_url);

    // Télécharger le fichier et parser son contenu
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error("Failed to fetch flashcards file");

    const content = await response.text();
    return getFlashcardsFromContent(content);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
};
