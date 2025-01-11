import { FlashCard } from "@/types/marketplace";
import { supabase } from "../supabase";

export const uploadFlashcardsFile = async (
  file: File,
  userId: string,
  deckId: string,
) => {
  const filePath = `${userId}/${deckId}.txt`;

  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("flashcards-files").getPublicUrl(filePath);

  return { publicUrl, filePath };
};

export const downloadFlashcardsFile = async (
  deckId: string,
  creatorId: string,
): Promise<string> => {
  const filePath = `${creatorId}/${deckId}.txt`;

  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .download(filePath);

  if (error) throw error;
  if (!data) throw new Error("No file data received");

  return await data.text();
};

export const getFlashcards = async (
  deckId: string,
  creatorId: string,
): Promise<FlashCard[]> => {
  try {
    const text = await downloadFlashcardsFile(deckId, creatorId);
    const lines = text.split("\n").filter((line) => line.trim());

    // Extract metadata
    const metadata: Record<string, string> = {};
    const contentLines: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith("#")) {
        const [key, value] = line.slice(1).split(":");
        metadata[key.trim()] = value ? value.trim() : null;
      } else {
        contentLines.push(line);
      }
    });

    // Parse the flashcards
    const separator = metadata["separator"] === "tab" ? "\t" : ",";
    const tagsColumn = parseInt(metadata["tags column"], 10) || -1;

    return contentLines.map((line) => {
      const columns = line.split(separator);
      const flashcard: FlashCard = {
        front: columns[0].trim(),
        back: columns[1].trim(),
      };

      if (tagsColumn > 0 && tagsColumn <= columns.length) {
        flashcard.tags = columns[tagsColumn - 1]
          .split(",")
          .map((tag) => tag.trim());
      }

      return flashcard;
    });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
};
