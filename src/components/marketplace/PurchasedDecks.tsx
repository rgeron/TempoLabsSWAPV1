import React from "react";
import DeckCard from "./DeckCard";

interface PurchasedDeck {
  id: string;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
  cardCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl: string;
}

const PurchasedDecks = () => {
  // This would typically come from your backend
  const purchasedDecks: PurchasedDeck[] = [
    {
      id: "1",
      title: "Spanish Basics",
      description: "Learn essential Spanish vocabulary and phrases",
      price: 9.99,
      purchaseDate: "2024-03-15",
      cardCount: 100,
      difficulty: "Beginner",
      imageUrl: "https://images.unsplash.com/photo-1505902987837-9e40ec37e607",
    },
    // Add more sample decks as needed
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#2B4C7E]">Purchased Decks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {purchasedDecks.map((deck) => (
          <div key={deck.id} className="space-y-2">
            <DeckCard {...deck} />
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Purchased on: {new Date(deck.purchaseDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-semibold text-[#2B4C7E]">
                Price paid: ${deck.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasedDecks;
