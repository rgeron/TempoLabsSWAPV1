import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { DeckWithProfile } from "@/types/marketplace";
import DeckCard from "@/components/marketplace/DeckCard";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const SearchDeck = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const liked = searchParams.get("liked") === "true";
  const purchased = searchParams.get("purchased") === "true";
  const minRating = searchParams.get("minRating");
  const categories = searchParams.get("categories")?.split(",");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const searchDecks = async () => {
      try {
        setIsLoading(true);

        // Start with a basic query
        let queryBuilder = supabase.from("decks").select(`
            id,
            title,
            description,
            price,
            cardcount,
            difficulty,
            imageurl,
            creatorid,
            categories,
            created_at,
            profiles!decks_creatorid_fkey (username, avatar_url)
          `);

        // Build filter conditions array
        const conditions = [];

        // Text search
        if (query) {
          conditions.push(
            `title.ilike.%${query}%`,
            `description.ilike.%${query}%`,
          );
          queryBuilder = queryBuilder.or(conditions.join(","));
        }

        // Category filter
        if (categories?.length) {
          queryBuilder = queryBuilder.contains("categories", categories);
        }

        // Price range
        if (minPrice !== null) {
          queryBuilder = queryBuilder.gte("price", Number(minPrice));
        }
        if (maxPrice !== null) {
          queryBuilder = queryBuilder.lte("price", Number(maxPrice));
        }

        // Rating filter
        if (minRating !== null) {
          queryBuilder = queryBuilder.gte("rating", Number(minRating));
        }

        // Execute query
        const { data: decksData, error: decksError } = await queryBuilder.order(
          "created_at",
          { ascending: false },
        );

        if (decksError) {
          console.error("Query error:", decksError);
          throw decksError;
        }

        // Transform the data
        let processedDecks = (decksData || []).map((deck) => ({
          ...deck,
          creatorName: deck.profiles?.username || "Unknown Creator",
          creatorAvatar: deck.profiles?.avatar_url,
          profiles: deck.profiles || null,
          categories: Array.isArray(deck.categories) ? deck.categories : [],
        }));

        // Apply client-side filters
        if (liked && profile?.likeddeckids?.length) {
          processedDecks = processedDecks.filter((deck) =>
            profile.likeddeckids.includes(deck.id),
          );
        }

        if (purchased && profile?.purchaseddeckids?.length) {
          processedDecks = processedDecks.filter((deck) =>
            profile.purchaseddeckids.includes(deck.id),
          );
        }

        setDecks(processedDecks);
      } catch (error) {
        console.error("Error fetching decks:", error);
        setDecks([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Always execute search to show all decks or filtered results
    searchDecks();
  }, [
    query,
    liked,
    purchased,
    minRating,
    categories,
    minPrice,
    maxPrice,
    profile,
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2B4C7E]">
          {query ? `Search Results for "${query}"` : "All Decks"}
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
            Try adjusting your filters or search with different keywords
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchDeck;
