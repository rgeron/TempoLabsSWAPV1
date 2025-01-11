import { FlashCard } from "@/types/marketplace";
import { supabase } from "../supabase";

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
      contentType: "text/plain",
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

export const downloadFlashcardsFile = async (
  deckId: string,
  creatorId: string,
) => {
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

export const getFlashcards = async (
  deckId: string,
  creatorId: string,
): Promise<FlashCard[]> => {
  try {
    if (!creatorId) {
      throw new Error("Creator ID is required");
    }

    // Download the file content
    const text = await downloadFlashcardsFile(deckId, creatorId);
    const lines = text.split("\n").filter((line) => line.trim());

    // Extract metadata
    const metadata = {};
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
    const tagsColumn = parseInt(metadata["tags column"], 10) || -1;

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
