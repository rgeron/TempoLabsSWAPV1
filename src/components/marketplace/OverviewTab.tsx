import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BarChart, BookOpen, Calendar, DollarSign } from "lucide-react";
import { DeckWithProfile } from "@/types/decks";
import { CATEGORY_DEFINITIONS } from "@/types/catergories";

interface OverviewTabProps {
  deck: DeckWithProfile;
  purchaseDate?: string;
}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

export function OverviewTab({ deck, purchaseDate }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Description Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <p className="text-gray-600 leading-relaxed">{deck.description}</p>
      </Card>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cards</p>
              <p className="font-semibold text-lg">{deck.cardcount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-lg">${deck.price.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Difficulty</p>
              <Badge className={`${difficultyColors[deck.difficulty]} mt-1`}>
                {deck.difficulty}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {purchaseDate ? "Purchased" : "Created"}
              </p>
              <p className="font-semibold text-sm">
                {new Date(purchaseDate || deck.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categories Section */}
      {deck.categories && deck.categories.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {deck.categories.map((category) => {
              const definition = CATEGORY_DEFINITIONS.find((def) => def.name === category);
              if (!definition) return null;
              return (
                <div
                  key={category}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium ${definition.gradient} transition-colors duration-200 ${definition.hoverGradient}`}
                >
                  <span>{definition.icon}</span>
                  {category}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
