import React, { useEffect, useState } from "react";
import DeckCard from "./DeckCard";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { getAllDecks } from "@/lib/api/decks";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type DeckWithProfile = Database["public"]["Tables"]["decks"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

interface DeckGridProps {
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

const DeckGrid = ({ hideRecommended = false }: DeckGridProps) => {
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);


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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

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
                {decks.map((deck) => (
                  <div key={deck.id} className="flex-none">
                    <DeckCard
                      id={deck.id}
                      title={deck.title}
                      description={deck.description}
                      price={deck.price}
                      cardCount={deck.cardcount}
                      difficulty={deck.difficulty}
                      imageUrl={deck.imageurl}
                      creatorName={deck.profiles.username}
                      creatorAvatar={deck.profiles.avatar_url || undefined}
                    />
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
              {[...decks].reverse().map((deck) => (
                <div key={deck.id} className="flex-none">
                  <DeckCard
                    id={deck.id}
                    title={deck.title}
                    description={deck.description}
                    price={deck.price}
                    cardCount={deck.cardcount}
                    difficulty={deck.difficulty}
                    imageUrl={deck.imageurl}
                    creatorName={deck.profiles.username}
                    creatorAvatar={deck.profiles.avatar_url || undefined}
                  />
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
