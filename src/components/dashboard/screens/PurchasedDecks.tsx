import DeckCard from "@/components/marketplace/deck/DeckCard";
import { getAllDecks } from "@/lib/api/decks";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/types/supabase";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Deck = Database["public"]["Tables"]["decks"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

const PurchasedDecks = () => {
  const { user, profile } = useAuth();
  const [purchasedDecks, setPurchasedDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedDecks = async () => {
      if (!user || !profile?.purchaseddeckids) {
        setIsLoading(false);
        return;
      }

      try {
        const allDecks = await getAllDecks();
        const purchased = allDecks
          .filter((deck) => profile.purchaseddeckids.includes(deck.id))
          .map((deck) => ({
            ...deck,
            average_rating: deck.average_rating || 0,
            total_reviews: deck.total_reviews || 0,
          })) as Deck[];
        setPurchasedDecks(purchased);
      } catch (error) {
        console.error("Error fetching purchased decks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchasedDecks();
  }, [user, profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#2B4C7E]">Purchased Decks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {purchasedDecks.map((deck) => (
          <div key={deck.id} className="space-y-2">
            <DeckCard
              {...deck}
              creatorName={deck.profiles.username}
              creatorAvatar={deck.profiles.avatar_url || undefined}
              average_rating={deck.average_rating}
              total_reviews={deck.total_reviews}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasedDecks;
