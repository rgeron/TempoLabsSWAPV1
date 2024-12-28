import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen } from "lucide-react";

interface DeckCardProps {
  title?: string;
  description?: string;
  price?: number;
  rating?: number;
  cardCount?: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
}

const DeckCard = ({
  title = "Spanish Basics",
  description = "Learn essential Spanish vocabulary and phrases",
  price = 9.99,
  rating = 4.5,
  cardCount = 100,
  difficulty = "Beginner",
  imageUrl = "https://images.unsplash.com/photo-1505902987837-9e40ec37e607",
}: DeckCardProps) => {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800",
  };

  return (
    <Card className="w-72 h-80 overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className={`${difficultyColors[difficulty]} border-none`}>
              {difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{title}</h3>
        <p className="text-sm text-gray-500 h-12 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm">{rating}</span>
          </div>
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="ml-1 text-sm">{cardCount} cards</span>
          </div>
        </div>
        <div className="text-lg font-bold">${price.toFixed(2)}</div>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
