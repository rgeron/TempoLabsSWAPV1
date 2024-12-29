import React from "react";
import DeckCard from "./DeckCard";
import { ChevronRight, ChevronLeft } from "lucide-react";

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
  color: string;
  subcategories: string[];
}

const DeckGrid = ({ decks }: DeckGridProps) => {
  const categories: Category[] = [
    {
      name: "Languages",
      color: "bg-blue-50",
      subcategories: [
        "Spanish",
        "French",
        "German",
        "Japanese",
        "Chinese",
        "Italian",
        "Korean",
        "Russian",
      ],
    },
    {
      name: "Sciences",
      color: "bg-green-50",
      subcategories: [
        "Physics",
        "Chemistry",
        "Biology",
        "Mathematics",
        "Computer Science",
        "Astronomy",
        "Environmental Science",
      ],
    },
    {
      name: "Arts",
      color: "bg-pink-50",
      subcategories: [
        "Literature",
        "History",
        "Music",
        "Visual Arts",
        "Theater",
        "Film Studies",
        "Architecture",
      ],
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
    {
      id: "5",
      title: "French for Beginners",
      description: "Start your journey in French",
      price: 11.99,
      rating: 4.7,
      cardCount: 90,
      difficulty: "Beginner" as const,
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    },
  ];

  const displayDecks = decks || defaultDecks;

  const scrollContainer = (
    direction: "left" | "right",
    containerId: string,
  ) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 600;
      const targetScroll =
        container.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-y-auto">
      {/* Categories Section */}
      <div className="grid grid-cols-3 gap-4 p-6 h-[calc(60vh-64px)]">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`${category.color} rounded-lg p-6 overflow-y-auto`}
          >
            <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
            <div className="grid gap-2">
              {category.subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  className="text-left px-4 py-2 bg-white/60 hover:bg-white/80 rounded-md transition-colors duration-200 shadow-sm"
                  onClick={() =>
                    console.log(`Navigate to ${category.name} - ${subcategory}`)
                  }
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal Deck Sections */}
      <div className="px-6 space-y-8">
        {/* Recommended Section */}
        <div className="relative">
          <h2 className="text-2xl font-semibold mb-4">Recommended for you</h2>
          <div className="relative group">
            <button
              onClick={() => scrollContainer("left", "recommended-container")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div
              id="recommended-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayDecks.map((deck) => (
                <div key={deck.id} className="flex-none">
                  <DeckCard {...deck} />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollContainer("right", "recommended-container")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Best of the Month Section */}
        <div className="relative pb-6">
          <h2 className="text-2xl font-semibold mb-4">Best of the Month</h2>
          <div className="relative group">
            <button
              onClick={() => scrollContainer("left", "best-container")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-4"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div
              id="best-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[...displayDecks].reverse().map((deck) => (
                <div key={deck.id} className="flex-none">
                  <DeckCard {...deck} />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollContainer("right", "best-container")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-4"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckGrid;
