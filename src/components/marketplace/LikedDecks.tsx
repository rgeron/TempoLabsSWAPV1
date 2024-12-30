import React from "react";
import DeckCard from "./DeckCard";

interface LikedDeck {
  id: string;
  title: string;
  description: string;
  price: number;
  likedDate: string;
  cardCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl: string;
}

const LikedDecks = () => {
  // This would typically come from your backend
  const likedDecks: LikedDeck[] = [
    {
      id: "1",
      title: "Advanced Physics",
      description: "Master quantum mechanics and relativity",
      price: 19.99,
      likedDate: "2024-03-10",
      cardCount: 150,
      difficulty: "Advanced",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    },
    // Add more sample decks as needed
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#2B4C7E]">Liked Decks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {likedDecks.map((deck) => (
          <div key={deck.id} className="space-y-2">
            <DeckCard {...deck} />
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Liked on: {new Date(deck.likedDate).toLocaleDateString()}
              </p>
              <button className="mt-2 w-full bg-[#2B4C7E] text-white py-2 rounded-md hover:bg-[#1A365D] transition-colors">
                Purchase for ${deck.price}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedDecks;
