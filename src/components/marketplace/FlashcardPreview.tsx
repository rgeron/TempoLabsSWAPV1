import React, { useState } from "react";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  // Show only the first `limit` flashcards (if provided).
  const cardsToShow = limit ? flashcards.slice(0, limit) : flashcards;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Flip the current card around the X-axis.
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Move to the previous card, resetting the flip state.
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Move to the next card, resetting the flip state.
  const handleNext = () => {
    if (currentIndex < cardsToShow.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  if (cardsToShow.length === 0) {
    return <p className="text-sm text-gray-500">No cards to preview.</p>;
  }

  const currentCard = cardsToShow[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Card display container */}
      <div className="relative w-[250px] h-[150px] perspective-1000">
        {/* AnimatePresence to animate the card in/out when changing index */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            className="absolute w-full h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Card flip motion */}
            <motion.div
              className="w-full h-full relative"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleFlip}
            >
              {/* FRONT side */}
              <div
                className="absolute w-full h-full flex items-center justify-center bg-white rounded-md shadow-md p-4"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-center max-h-full w-full overflow-y-auto">
                  <h4 className="font-semibold">Front</h4>
                  <p className="mt-1">{currentCard.front}</p>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Tags: {currentCard.tags.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* BACK side */}
              <div
                className="absolute w-full h-full flex items-center justify-center bg-white rounded-md shadow-md p-4"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                }}
              >
                <div className="text-center max-h-full w-full overflow-y-auto">
                  <h4 className="font-semibold">Back</h4>
                  <p className="mt-1">{currentCard.back}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-3 py-2 rounded-md bg-gray-200 disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === cardsToShow.length - 1}
          className="px-3 py-2 rounded-md bg-gray-200 disabled:opacity-50"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Card indicator + leftover info */}
      <p className="text-xs text-gray-500">
        Card {currentIndex + 1} of {cardsToShow.length}
      </p>
      {flashcards.length > limit && (
        <p className="text-xs text-gray-400">
          ... and {flashcards.length - limit} more cards not shown
        </p>
      )}
    </div>
  );
}
