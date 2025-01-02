import React, { useEffect, useState } from "react";
import DeckCard from "./DeckCard";
import { Loader2 } from "lucide-react";
import { getAllDecks } from "@/lib/api/decks";
import type { DeckWithProfile } from "@/types/marketplace";
import { useAuth } from "@/lib/auth";

interface AllDecksProps {
  showTitle?: boolean;
}

const AllDecks = ({ showTitle = true }: AllDecksProps) => {
  const [allDecks, setAllDecks] = useState<DeckWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const decks = await getAllDecks();
        // Ensure creatorid is properly set for each deck
        const decksWithCreatorId = decks.map((deck) => ({
          ...deck,
          creatorid: deck.creatorid, // Make sure this is explicitly included
        }));
        setAllDecks(decksWithCreatorId);
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="w-full">
      {showTitle && (
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">All Decks</h2>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
        </div>
      ) : allDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              {...deck}
              creatorid={deck.creatorid} // Explicitly pass creatorid
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg text-gray-500">No decks available</p>
          <p className="text-sm text-gray-400">
            Be the first to add a deck to the marketplace!
          </p>
        </div>
      )}
    </div>
  );
};

export default AllDecks;
