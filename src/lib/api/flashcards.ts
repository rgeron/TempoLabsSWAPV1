import { FlashCard } from "@/types/marketplace";
import { supabase } from "../supabase";

/**
 * Uploads a flashcards file to Supabase storage.
 * @param file - The file to upload.
 * @param userId - The ID of the user uploading the file.
 * @param deckId - The ID of the deck to which the file belongs.
 * @returns The public URL and file path of the uploaded file.
 */
export const uploadFlashcardsFile = async (
  file: File,
  userId: string,
  deckId: string
): Promise<{ publicUrl: string; filePath: string }> => {
  // Always save as .txt regardless of original extension
  const filePath = `${userId}/${deckId}.txt`;

  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .upload(filePath, file, {
      upsert: true, // Replace if exists
      contentType: "text/plain",
    });

  if (error) {
    console.error("Error uploading file:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("flashcards-files")
    .getPublicUrl(filePath);

  if (!publicUrlData) {
    throw new Error("Failed to get public URL");
  }

  return { publicUrl: publicUrlData.publicUrl, filePath };
};

/**
 * Downloads a flashcards file from Supabase storage.
 * @param deckId - The ID of the deck.
 * @param creatorId - The ID of the creator.
 * @returns The file content as text.
 */
export const downloadFlashcardsFile = async (
  deckId: string,
  creatorId: string
): Promise<string> => {
  try {
    const filePath = `${creatorId}/${deckId}.txt`;
    console.log("Attempting to download from path:", filePath); // Debug log

    const { data, error } = await supabase.storage
      .from("flashcards-files")
      .download(filePath);

    if (error) {
      console.error("Error downloading flashcards file:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No file data received");
    }

    // Convert blob to text
    const text = await data.text();
    return text;
  } catch (error) {
    console.error("Error in downloadFlashcardsFile:", error);
    throw error;
  }
};

/**
 * Fetches and parses flashcards from a file stored in Supabase.
 * @param deckId - The ID of the deck.
 * @param creatorId - The ID of the creator.
 * @returns An array of FlashCard objects.
 */
export const getFlashcards = async (
  deckId: string,
  creatorId: string
): Promise<FlashCard[]> => {
  try {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    // Download the file content
    const text = await downloadFlashcardsFile(deckId, creatorId);
    const lines = text.split("\n").filter((line) => line.trim());

    // Extract metadata
    const metadata: Record<string, string | null> = {};
    const contentLines: string[] = [];
    lines.forEach((line) => {
      if (line.startsWith("#")) {
        const [key, value] = line.slice(1).split(":");
        metadata[key.trim()] = value ? value.trim() : null;
      } else {
        contentLines.push(line);
      }
    });

    // Check for required metadata
    const separator = metadata["separator"] === "tab" ? "\t" : ",";
    const tagsColumn = parseInt(metadata["tags column"] || "-1", 10);

    // Parse the flashcards
    const flashcards: FlashCard[] = [];
    for (const line of contentLines) {
      const columns = line.split(separator);
      if (columns.length >= 2) {
        const flashcard: FlashCard = {
          front: columns[0].trim(),
          back: columns[1].trim(),
        };

        // Add tags if the tags column is specified
        if (tagsColumn > 0 && tagsColumn <= columns.length) {
          flashcard.tags = columns[tagsColumn - 1]
            .split(",")
            .map((tag) => tag.trim());
        }

        flashcards.push(flashcard);
      }
    }

    console.log(`Successfully parsed ${flashcards.length} flashcards`);
    return flashcards;
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }
};

// Add a new function to delete a flashcards file
export const deleteFlashcardsFile = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from("flashcards-files")
    .remove([filePath]);

  if (error) throw error;
};
