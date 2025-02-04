import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FlashCard } from "@/types/catergories";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Repeat } from "lucide-react";
import { useState } from "react";

interface FlashcardPreviewProps {
  flashcards: FlashCard[];
  isLoading: boolean;
  limit?: number;
}

export function FlashcardPreview({
  flashcards,
  isLoading,
  limit = 5,
}: FlashcardPreviewProps) {
  const cardsToShow = limit ? flashcards.slice(0, limit) : flashcards;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const progress = ((currentIndex + 1) / cardsToShow.length) * 100;

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cardsToShow.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const renderHTML = (content: string) => {
    // Replace escaped quotes with proper quotes
    const sanitizedContent = content.replace(/""/g, '"');

    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  if (cardsToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <p className="text-lg text-gray-500 mb-2">No cards to preview</p>
        <p className="text-sm text-gray-400">
          This deck doesn't have any flashcards yet
        </p>
      </div>
    );
  }

  const currentCard = cardsToShow[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      {/* Progress bar */}
      <div className="w-full space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Card {currentIndex + 1} of {cardsToShow.length}
          </span>
          {flashcards.length > limit && (
            <span>{flashcards.length - limit} more cards not shown</span>
          )}
        </div>
      </div>

      {/* Card display */}
      <div className="relative w-full max-w-[500px] h-[300px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute w-full h-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full h-full relative cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateX: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
              onClick={handleFlip}
            >
              {/* Front */}
              <Card className="absolute w-full h-full flex flex-col items-center justify-center p-8 backface-hidden bg-white">
                <div className="text-center max-h-full w-full overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">
                    Question
                  </h4>
                  <div className="text-xl prose prose-blue max-w-none">
                    {renderHTML(currentCard.front)}
                  </div>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {currentCard.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Back */}
              <Card
                className="absolute w-full h-full flex flex-col items-center justify-center p-8 backface-hidden bg-white [transform:rotateX(180deg)]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-center max-h-full w-full overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">
                    Answer
                  </h4>
                  <div className="text-xl prose prose-blue max-w-none">
                    {renderHTML(currentCard.back)}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFlip}
          className="rounded-full"
        >
          <Repeat className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === cardsToShow.length - 1}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
