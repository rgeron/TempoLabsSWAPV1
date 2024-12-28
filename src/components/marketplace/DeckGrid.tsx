import React from "react";
import DeckCard from "./DeckCard";

interface DeckGridProps {
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

const DeckGrid = ({ decks }: DeckGridProps) => {
  const defaultDecks = [
    {
      id: "1",
      title: "Spanish Basics",
      description: "Learn essential Spanish vocabulary and phrases",
      price: 9.99,
      rating: 4.5,
      cardCount: 100,
      difficulty: "Beginner" as const,
      imageUrl: "https://images.unsplash.com/photo-1505902987837-9e40ec37e607",
    },
    {
      id: "2",
      title: "Advanced Physics",
      description: "Master quantum mechanics and relativity",
      price: 19.99,
      rating: 4.8,
      cardCount: 150,
      difficulty: "Advanced" as const,
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    },
    {
      id: "3",
      title: "Art History",
      description: "Explore the Renaissance to Modern Art",
      price: 14.99,
      rating: 4.3,
      cardCount: 120,
      difficulty: "Intermediate" as const,
      imageUrl: "https://images.unsplash.com/photo-1499426600726-a950358acf16",
    },
    {
      id: "4",
      title: "Biology 101",
      description: "Fundamental concepts in biology",
      price: 12.99,
      rating: 4.6,
      cardCount: 80,
      difficulty: "Beginner" as const,
      imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8",
    },
  ];

  const displayDecks = decks || defaultDecks;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {displayDecks.map((deck) => (
          <DeckCard
            key={deck.id}
            title={deck.title}
            description={deck.description}
            price={deck.price}
            rating={deck.rating}
            cardCount={deck.cardCount}
            difficulty={deck.difficulty}
            imageUrl={deck.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default DeckGrid;
