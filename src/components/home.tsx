import React, { useEffect, useState } from "react";
import Sidebar from "./marketplace/Sidebar";
import TopNav from "./marketplace/TopNav";
import DeckGrid from "./marketplace/DeckGrid";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { getAllDecks } from "@/lib/api/decks";
import type { Database } from "@/types/supabase";

type Deck = Database["public"]["Tables"]["decks"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

interface HomeProps {
  children?: React.ReactNode;
}

const Home = ({ children }: HomeProps) => {
  const { user, profile } = useAuth();
  const [allDecks, setAllDecks] = useState<Deck[]>([]);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const decks = await getAllDecks();
        setAllDecks(decks);
      } catch (error) {
        console.error("Error fetching decks:", error);
      }
    };

    fetchDecks();
  }, []);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav
          username={profile?.username || user.email}
          avatarUrl={profile?.avatar_url}
        />
        <div className="flex-1 overflow-auto">
          {children || <DeckGrid />}
          {!children && (
            <div className="px-6 pb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                All Decks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    id={deck.id}
                    title={deck.title}
                    description={deck.description}
                    price={deck.price}
                    cardCount={deck.cardCount}
                    difficulty={deck.difficulty}
                    imageUrl={deck.imageUrl}
                    creatorName={deck.profiles.username}
                    creatorAvatar={deck.profiles.avatar_url || undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
