import DeckCard from "@/components/marketplace/deck/DeckCard";
import { supabase } from "@/lib/supabase";
import type { DeckWithProfile } from "@/types/catergories";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const SearchDeck = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchDecks = async () => {
      try {
        setIsLoading(true);

        // First get profiles matching the search query
        const { data: matchingProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .ilike("username", `%${query}%`);

        if (profilesError) throw profilesError;

        // Get all decks that match the search criteria
        const { data: decksData, error: decksError } = await supabase
          .from("decks")
          .select("*")
          .or(
            `title.ilike.%${query}%,` +
              `description.ilike.%${query}%,` +
              `categories.cs.{${query}}` +
              (matchingProfiles?.length > 0
                ? `,creatorid.in.(${matchingProfiles
                    .map((p) => p.id)
                    .join(",")})`
                : "")
          )
          .order("created_at", { ascending: false });

        if (decksError) throw decksError;

        // Get all unique creator IDs from the matching decks
        const creatorIds = [
          ...new Set(decksData.map((deck) => deck.creatorid)),
        ];

        // Get all creator profiles (including those who might not have matched by username)
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", creatorIds);

        if (allProfilesError) throw allProfilesError;

        // Combine deck data with creator profiles
        const decksWithProfiles = decksData.map((deck) => {
          const profile = allProfiles?.find((p) => p.id === deck.creatorid);
          return {
            ...deck,
            creatorName: profile?.username || "Unknown Creator",
            creatorAvatar: profile?.avatar_url,
            profiles: {
              username: profile?.username || "Unknown Creator",
              avatar_url: profile?.avatar_url,
            },
          };
        });

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
