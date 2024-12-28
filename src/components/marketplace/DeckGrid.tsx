import React, { useState } from "react";
import DeckCard from "./DeckCard";
import { ChevronRight } from "lucide-react";

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

interface Category {
  name: string;
  icon: string;
  subcategories: string[];
}

const DeckGrid = ({ decks }: DeckGridProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      name: "Languages",
      icon: "🌎",
      subcategories: ["Spanish", "French", "German", "Japanese", "Chinese"],
    },
    {
      name: "Sciences",
      icon: "🔬",
      subcategories: ["Physics", "Chemistry", "Biology", "Mathematics"],
    },
    {
      name: "Arts",
      icon: "🎨",
      subcategories: ["Literature", "History", "Music", "Visual Arts"],
    },
  ];

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
    <div className="w-full min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Categories Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${expandedCategory === category.name ? "col-span-full" : ""}`}
            onClick={() =>
              setExpandedCategory(
                expandedCategory === category.name ? null : category.name,
              )
            }
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform duration-300 ${expandedCategory === category.name ? "rotate-90" : ""}`}
              />
            </div>
            {expandedCategory === category.name && (
              <div className="px-4 pb-4 pt-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decks Grid */}
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
