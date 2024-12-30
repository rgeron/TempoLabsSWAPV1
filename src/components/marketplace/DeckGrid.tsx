import React from "react";
import DeckCard from "./DeckCard";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

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
  hideRecommended?: boolean;
}

interface Category {
  name: string;
  color: string;
  gradient: string;
  hoverGradient: string;
  icon: string;
  subcategories: string[];
}

const DeckGrid = ({ decks, hideRecommended = false }: DeckGridProps) => {
  const categories: Category[] = [
    {
      name: "Languages",
      color: "from-violet-500 to-purple-500",
      gradient: "bg-gradient-to-br from-violet-50 to-purple-50",
      hoverGradient:
        "hover:bg-gradient-to-br hover:from-violet-100 hover:to-purple-100",
      icon: "🌎",
      subcategories: [
        "Spanish",
        "French",
        "German",
        "Japanese",
        "Chinese",
        "Italian",
        "Korean",
        "Russian",
        "Portuguese",
        "Arabic",
        "Hindi",
        "Vietnamese",
      ],
    },
    {
      name: "Sciences",
      color: "from-cyan-500 to-blue-500",
      gradient: "bg-gradient-to-br from-cyan-50 to-blue-50",
      hoverGradient:
        "hover:bg-gradient-to-br hover:from-cyan-100 hover:to-blue-100",
      icon: "🔬",
      subcategories: [
        "Physics",
        "Chemistry",
        "Biology",
        "Mathematics",
        "Computer Science",
        "Astronomy",
        "Environmental Science",
        "Geology",
        "Statistics",
        "Engineering",
        "Medicine",
        "Psychology",
      ],
    },
    {
      name: "Arts",
      color: "from-rose-500 to-pink-500",
      gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
      hoverGradient:
        "hover:bg-gradient-to-br hover:from-rose-100 hover:to-pink-100",
      icon: "🎨",
      subcategories: [
        "Literature",
        "History",
        "Music",
        "Visual Arts",
        "Theater",
        "Film Studies",
        "Architecture",
        "Photography",
        "Dance",
        "Creative Writing",
        "Art History",
        "Design",
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
    // ... rest of the defaultDecks array
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
    <div className="w-full min-h-screen bg-slate-50 overflow-y-auto">
      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-auto lg:h-[calc(60vh-80px)]">
        {categories.map((category) => (
          <Card
            key={category.name}
            className={`overflow-hidden flex flex-col shadow-md ${category.gradient} border-0`}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">{category.icon}</span>
                <h3
                  className={`text-xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                >
                  {category.name}
                </h3>
              </div>
              <ScrollArea className="h-[calc(60vh-180px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-4">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      className={`text-left px-4 py-3 bg-white/80 rounded-xl transition-all duration-200 shadow-sm
                        ${category.hoverGradient} hover:shadow-md
                        text-gray-700 hover:text-gray-900 font-medium`}
                      onClick={() =>
                        console.log(
                          `Navigate to ${category.name} - ${subcategory}`,
                        )
                      }
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        ))}
      </div>

      {/* Horizontal Deck Sections */}
      <div className="px-6 space-y-8">
        {!hideRecommended && (
          <div className="relative">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Recommended for you
            </h2>
            <div className="relative group">
              <button
                onClick={() => scrollContainer("left", "recommended-container")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-4"
              >
                <ChevronLeft className="h-6 w-6 text-blue-600" />
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
                onClick={() =>
                  scrollContainer("right", "recommended-container")
                }
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-4"
              >
                <ChevronRight className="h-6 w-6 text-blue-600" />
              </button>
            </div>
          </div>
        )}

        {/* Best of the Month Section */}
        <div className="relative pb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Best of the Month
          </h2>
          <div className="relative group">
            <button
              onClick={() => scrollContainer("left", "best-container")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-4"
            >
              <ChevronLeft className="h-6 w-6 text-blue-600" />
            </button>
            <div
              id="best-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[...displayDecks].reverse().map((deck) => (
                <div key={deck.id} className="flex-none">
                  <DeckCard {...deck} requiresAuth />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollContainer("right", "best-container")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-4"
            >
              <ChevronRight className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckGrid;
