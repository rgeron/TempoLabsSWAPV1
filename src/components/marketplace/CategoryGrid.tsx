import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { LocalizedEducationCategories } from "./LocalizedEducationCategories";
import { CATEGORY_DEFINITIONS, DeckWithProfile } from "@/types/marketplace";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DeckCard from "./DeckCard";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Séparer les catégories d'éducation des autres
  const educationCategory = CATEGORY_DEFINITIONS.find(
    (cat) => cat.name === "Education",
  );
  const otherCategories = CATEGORY_DEFINITIONS.filter(
    (cat) => cat.name !== "Education",
  );

  const handleCategoryClick = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  useEffect(() => {
    const fetchDecks = async () => {
      if (selectedCategories.length === 0) {
        setDecks([]);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch decks that contain ALL selected categories
        const { data: decksData, error: decksError } = await supabase
          .from("decks")
          .select("*")
          .contains("categories", selectedCategories)
          .order("created_at", { ascending: false });

        if (decksError) throw decksError;

        // Get all unique creator IDs
        const creatorIds = [
          ...new Set(decksData.map((deck) => deck.creatorid)),
        ];

        // Fetch all creator profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", creatorIds);

        if (profilesError) throw profilesError;

        // Combine deck data with creator profiles
        const decksWithProfiles = decksData.map((deck) => {
          const profile = profiles?.find((p) => p.id === deck.creatorid);
          return {
            ...deck,
            creatorName: profile?.username || "Unknown Creator",
            creatorAvatar: profile?.avatar_url,
            profiles: {
              username: profile?.username || "Unknown Creator",
              avatar_url: profile?.avatar_url,
            },
          };
        });

        setDecks(decksWithProfiles);
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, [selectedCategories]);

  return (
    <div className="space-y-6">
      {/* Education Section - Horizontal */}
      {educationCategory && (
        <Card className={`p-6 ${educationCategory.gradient} border-0 w-full`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{educationCategory.icon}</span>
              <h3
                className={`text-xl font-bold bg-gradient-to-r ${educationCategory.color} bg-clip-text text-transparent`}
              >
                {educationCategory.name}
              </h3>
            </div>
            <LocalizedEducationCategories
              onSelect={handleCategoryClick}
              selectedCategories={selectedCategories}
              className="grid grid-cols-4 md:grid-cols-6 gap-2"
            />
          </div>
        </Card>
      )}

      {/* Other Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {otherCategories.map((category) => (
          <Card
            key={category.name}
            className={`flex flex-col shadow-md ${category.gradient} border-0`}
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
              <div className="grid grid-cols-2 gap-2">
                {category.subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleCategoryClick(subcategory)}
                    className={cn(
                      `relative text-left px-4 py-3 rounded-xl transition-all duration-200 shadow-sm
                      text-gray-700 hover:text-gray-900 font-medium group`,
                      selectedCategories.includes(subcategory)
                        ? `${category.gradient} shadow-md`
                        : `bg-white/80 ${category.hoverGradient} hover:shadow-md`,
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{subcategory}</span>
                      {selectedCategories.includes(subcategory) && (
                        <Check
                          className="h-4 w-4 text-emerald-600 ml-2
                            animate-in zoom-in duration-200"
                        />
                      )}
                    </div>
                    {/* Ripple effect overlay */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                      {selectedCategories.includes(subcategory) && (
                        <div className="absolute inset-0 bg-emerald-500/10 animate-in fade-in duration-200" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Results Section */}
      {selectedCategories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#2B4C7E]">
              Results for {selectedCategories.join(", ")}
            </h2>
            <button
              onClick={() => setSelectedCategories([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
            </div>
          ) : decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {decks.map((deck) => (
                <DeckCard key={deck.id} {...deck} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-2">
              <p className="text-lg text-gray-500">
                No decks found with all selected categories
              </p>
              <p className="text-sm text-gray-400">
                Try selecting different categories
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
