import React, { useEffect, useState } from "react";
import DeckCard from "./DeckCard";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { getAllDecks } from "@/lib/api/decks";
import type { DeckWithProfile } from "@/types/marketplace";
import CategoryGrid from "./CategoryGrid";

interface DeckGridProps {
  hideRecommended?: boolean;
}

const DeckGrid = ({ hideRecommended = false }: DeckGridProps) => {
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const fetchedDecks = await getAllDecks();
      console.log("Fetched decks:", fetchedDecks); // Debug log
      setDecks(fetchedDecks);
    } catch (error) {
      console.error("Error fetching decks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollContainer = (
    direction: "left" | "right",
    containerId: string,
  ) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 600;
      const targetScroll =
        container.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  const renderDeckSection = (
    title: string,
    containerId: string,
    decksToShow: DeckWithProfile[],
  ) => (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scrollContainer("left", containerId)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-4"
        >
          <ChevronLeft className="h-6 w-6 text-blue-600" />
        </button>
        <div
          id={containerId}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {decksToShow.map((deck) => (
            <div key={deck.id} className="flex-none w-[300px]">
              <DeckCard
                id={deck.id}
                title={deck.title}
                description={deck.description}
                price={deck.price}
                cardcount={deck.cardcount}
                difficulty={deck.difficulty}
                imageurl={deck.imageurl}
                creatorName={deck.profiles?.username}
                creatorAvatar={deck.profiles?.avatar_url || undefined}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scrollContainer("right", containerId)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-4"
        >
          <ChevronRight className="h-6 w-6 text-blue-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-y-auto">
      <CategoryGrid />

      <div className="px-6 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
          </div>
        ) : (
          <>
            {!hideRecommended &&
              renderDeckSection(
                "Recommended for you",
                "recommended-container",
                decks,
              )}
            {renderDeckSection(
              "Best of the Month",
              "best-container",
              [...decks].reverse(),
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeckGrid;
