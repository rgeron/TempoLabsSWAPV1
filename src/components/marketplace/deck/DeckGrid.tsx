import React, { useEffect, useState } from "react";
import DeckCard from "./DeckCard";
import { Loader2 } from "lucide-react";
import { getAllDecks } from "@/lib/api/decks";
import type { DeckWithProfile } from "@/types/marketplace";

const DeckGrid = () => {
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const fetchedDecks = await getAllDecks();
        setDecks(fetchedDecks);
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-y-auto">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">All Decks</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckGrid;
