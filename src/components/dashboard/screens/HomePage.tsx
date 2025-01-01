import DeckCard from "@/components/marketplace/DeckCard";
import { getAllDecks } from "@/lib/api/decks";
import type { Database } from "@/types/supabase";
import { useEffect, useState } from "react";

type DeckWithProfile = Database["public"]["Tables"]["decks"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

const Home = () => {
  const [allDecks, setAllDecks] = useState<DeckWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const decks = await getAllDecks();
        setAllDecks(decks as DeckWithProfile[]);
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="flex-1 overflow-auto px-6 pb-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">All Decks</h2>
      {loading ? (
        <p className="text-gray-600">Loading decks...</p>
      ) : allDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allDecks.map((deck) => (
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
      ) : (
        <p className="text-gray-600">No decks found.</p>
      )}
    </div>
  );
};

export default Home;
