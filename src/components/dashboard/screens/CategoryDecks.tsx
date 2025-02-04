import DeckCard from "@/components/marketplace/deck/DeckCard";
import { supabase } from "@/lib/supabase";
import type { DeckWithProfile } from "@/types/catergories";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryDecks = () => {
  const { category } = useParams();
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setIsLoading(true);

        // Fetch decks with the specified category
        const { data: decksData, error: decksError } = await supabase
          .from("decks")
          .select("*")
          .contains("categories", [category])
          .order("created_at", { ascending: false });

        if (decksError) throw decksError;

        // Get all unique creator IDs
        const creatorIds = [
          ...new Set(decksData.map((deck) => deck.creatorid)),
        ];

        // Fetch all creator profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", creatorIds);

        if (profilesError) throw profilesError;

        // Combine deck data with creator profiles
        const decksWithProfiles = decksData.map((deck) => {
          const profile = profiles?.find((p) => p.id === deck.creatorid);
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
        console.error("Error fetching category decks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchDecks();
    }
  }, [category]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2B4C7E]">{category} Decks</h1>
        <p className="text-gray-500">{decks.length} decks found</p>
      </div>

      {decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {decks.map((deck) => (
            <DeckCard key={deck.id} {...deck} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 space-y-2">
          <p className="text-lg text-gray-500">
            No decks found in this category
          </p>
          <p className="text-sm text-gray-400">
            Be the first to add a deck to this category!
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryDecks;
