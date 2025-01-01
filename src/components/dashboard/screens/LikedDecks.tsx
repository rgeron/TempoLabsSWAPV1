import React, { useEffect, useState } from "react";
import DeckCard from "@/components/marketplace/DeckCard";
import { useAuth } from "@/lib/auth";
import { getAllDecks, unlikeDeck } from "@/lib/api/decks";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/types/supabase";

type Deck = Database["public"]["Tables"]["decks"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

const LikedDecks = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [likedDecks, setLikedDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikedDecks = async () => {
    if (!user || !profile?.likeddeckids) {
      setIsLoading(false);
      return;
    }

    try {
      const allDecks = await getAllDecks();
      const liked = allDecks.filter((deck) =>
        profile.likeddeckids.includes(deck.id)
      ) as Deck[];
      
      setLikedDecks(liked);
    } catch (error) {
      console.error("Error fetching liked decks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedDecks();
  }, [user, profile]);

  const handleUnlike = async (deckId: string) => {
    try {
      await unlikeDeck(user.id, deckId);
      setLikedDecks((prev) => prev.filter((deck) => deck.id !== deckId));
      toast({
        title: "Deck unliked",
        description: "The deck has been removed from your liked decks",
      });
    } catch (error) {
      console.error("Error unliking deck:", error);
      toast({
        title: "Error",
        description: "Failed to unlike the deck",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#2B4C7E]">Liked Decks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {likedDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            id={deck.id}
            title={deck.title}
            description={deck.description}
            price={deck.price}
            cardcount={deck.cardcount}
            difficulty={deck.difficulty}
            imageurl={deck.imageurl}
            creatorName={deck.profiles.username}
            creatorAvatar={deck.profiles.avatar_url || undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default LikedDecks;
