import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { FlashCard } from "@/types/marketplace";

interface FlashcardPreviewProps {
  flashcards: FlashCard[];
  isLoading: boolean;
  limit?: number; // how many to show if you want a partial preview
}

export function FlashcardPreview({
  flashcards,
  isLoading,
  limit = 5,
}: FlashcardPreviewProps) {
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
        </div>
      ) : (
        <div className="space-y-4">
          {flashcards.slice(0, limit).map((card, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-gray-50 space-y-2"
            >
              <div className="font-medium">Front: {card.front}</div>
              <div className="text-gray-600">Back: {card.back}</div>
              {card.tags && card.tags.length > 0 && (
                <div className="text-xs text-gray-500">
                  Tags: {card.tags.join(", ")}
                </div>
              )}
            </div>
          ))}

          {flashcards.length > limit && (
            <p className="text-sm text-gray-500 text-center pt-4">
              ... and {flashcards.length - limit} more cards
            </p>
          )}
        </div>
      )}
    </ScrollArea>
  );
}
