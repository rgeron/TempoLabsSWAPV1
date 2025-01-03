import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { DeckWithProfile } from "@/types/marketplace";
import DeckCard from "@/components/marketplace/DeckCard";
import { Loader2 } from "lucide-react";

const SearchDeck = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchDecks = async () => {
      try {
        setIsLoading(true);

        const { data: decksData, error } = await supabase
          .from("decks")
          .select(
            `
            *,
            profiles:creatorid (username, avatar_url)
          `,
          )
          .or(
            `title.ilike.%${query}%,
             description.ilike.%${query}%`,
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match DeckWithProfile type
        const decksWithProfiles = decksData.map((deck: any) => ({
          ...deck,
          creatorName: deck.profiles?.username || "Unknown Creator",
          creatorAvatar: deck.profiles?.avatar_url,
        }));

        setDecks(decksWithProfiles);
      } catch (error) {
        console.error("Error searching decks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      searchDecks();
    } else {
      setDecks([]);
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2B4C7E]">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-500">{decks.length} results found</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
        </div>
      ) : decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {decks.map((deck) => (
            <DeckCard key={deck.id} {...deck} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 space-y-2">
          <p className="text-lg text-gray-500">No decks found</p>
          <p className="text-sm text-gray-400">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchDeck;
