import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DeckCardProps {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  rating?: number;
  cardCount?: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  requiresAuth?: boolean;
  creatorName?: string;
  creatorAvatar?: string;
}

const DeckCard = ({
  id,
  title = "Spanish Basics",
  description = "Learn essential Spanish vocabulary and phrases",
  price = 9.99,
  rating = 4.5,
  cardCount = 100,
  difficulty = "Beginner",
  imageUrl = "https://images.unsplash.com/photo-1505902987837-9e40ec37e607",
  requiresAuth = false,
  creatorName = "Anonymous",
  creatorAvatar,
}: DeckCardProps) => {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800",
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="w-72 h-80 overflow-hidden hover:shadow-lg transition-all duration-300 bg-white relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
      {requiresAuth && isHovered && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-4 transition-opacity duration-300">
          <Lock className="h-8 w-8 text-white" />
          <p className="text-white text-center px-4">
            Sign in to access this deck
          </p>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => console.log("Navigate to sign in")}
          >
            Sign In
          </Button>
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{title}</h3>
        <p className="text-sm text-gray-500 h-12 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col space-y-2">
        <div className="flex justify-between items-center w-full">
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
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Avatar className="h-6 w-6">
            <AvatarImage src={creatorAvatar} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>{creatorName}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DeckCard;
