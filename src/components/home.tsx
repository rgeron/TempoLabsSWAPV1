import React from "react";
import Sidebar from "./marketplace/Sidebar";
import TopNav from "./marketplace/TopNav";
import DeckGrid from "./marketplace/DeckGrid";

interface HomeProps {
  username?: string;
  avatarUrl?: string;
  notifications?: number;
  balance?: number;
  selectedCategory?: string;
  decks?: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    rating: number;
    cardCount: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    imageUrl: string;
  }>;
}

const Home = ({
  username,
  avatarUrl,
  notifications,
  balance,
  selectedCategory,
  decks,
}: HomeProps) => {
  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log("Searching for:", query);
  };

  const handleCategorySelect = (category: string) => {
    // Implement category selection
    console.log("Selected category:", category);
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
        selectedCategory={selectedCategory}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav
          username={username}
          avatarUrl={avatarUrl}
          notifications={notifications}
          balance={balance}
        />
        <div className="flex-1 overflow-auto">
          <DeckGrid decks={decks} />
        </div>
      </div>
    </div>
  );
};

export default Home;
