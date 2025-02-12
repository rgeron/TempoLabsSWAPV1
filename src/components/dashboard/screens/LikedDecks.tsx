import DeckCard from "@/components/marketplace/DeckCard";
import { useToast } from "@/components/ui/use-toast";
import { getAllDecks } from "@/lib/api/decks";
import { useAuth } from "@/lib/auth";
import type { DeckWithProfile } from "@/types/marketplace";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const LikedDecks = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [likedDecks, setLikedDecks] = useState<DeckWithProfile[]>([]);
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
      );
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
            {...deck}
            creatorName={deck.profiles.username}
            creatorAvatar={deck.profiles.avatar_url}
            profiles={deck.profiles}
          />
        ))}
      </div>
    </div>
  );
};

export default LikedDecks;
