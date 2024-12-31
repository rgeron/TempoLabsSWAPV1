import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BuyDeckDialog } from "./BuyDeckDialog";

interface DeckCardProps {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  rating?: number;
  cardCount?: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  creatorName?: string;
  creatorAvatar?: string;
  hideActions?: boolean;
  isLiked?: boolean;
  onUnlike?: () => void;
}


  const [showBuyDialog, setShowBuyDialog] = useState(false);

  return (
    <TooltipProvider>
      <Card className="w-72 overflow-hidden hover:shadow-lg transition-all duration-300 bg-white relative group">
        <CardHeader className="p-0">
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
              <Badge
                className={`${difficultyColors[difficulty]} border shadow-sm backdrop-blur-sm bg-opacity-90`}
              >
                {difficulty}
              </Badge>
              {!hideActions && (
                <button
                  onClick={onUnlike}
                  className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-200 shadow-sm"
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                  />
                </button>
              )}
            </div>
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-2 bg-white/90 px-2 py-1 rounded-full shadow-sm">
                    <Avatar className="h-5 w-5 border border-white">
                      <AvatarImage src={creatorAvatar} />
                      <AvatarFallback className="bg-[#2B4C7E] text-[10px] text-white">
                        {creatorName?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-gray-800 truncate max-w-[100px]">
                      {creatorName}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Created by {creatorName}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate group-hover:text-[#2B4C7E] transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-gray-500 h-12 line-clamp-2">
            {description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col space-y-3">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-4">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{rating}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{rating} out of 5 stars</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-[#2B4C7E]" />
                    <span className="ml-1 text-sm font-medium text-gray-600">
                      {cardCount}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{cardCount} flashcards</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-lg font-bold text-[#2B4C7E]">
              ${price.toFixed(2)}
            </div>
          </div>
          {!hideActions && (
            <Button
              className="w-full bg-[#2B4C7E] text-white hover:bg-[#1A365D] transition-colors duration-200"
              size="sm"
              onClick={() => setShowBuyDialog(true)}
            >
              Buy Now
            </Button>
          )}
        </CardFooter>

        <BuyDeckDialog
          isOpen={showBuyDialog}
          onClose={() => setShowBuyDialog(false)}
          deck={{
            id,
            title,
            description,
            price,
            cardCount,
            difficulty,
            creatorName,
          }}
        />
      </Card>
    </TooltipProvider>
  );
};

export default DeckCard;
