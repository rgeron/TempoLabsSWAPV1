import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { BuyDeckDialog } from "./BuyDeckDialog";
import { PurchasedDeckDialog } from "./PurchasedDeckDialog";
import { CreatorDeckDialog } from "./CreatorDeckDialog";
import { deleteDeck } from "@/lib/api/decks";
import { useToast } from "@/components/ui/use-toast";
import type { DeckWithProfile } from "@/types/marketplace";

interface DeckCardProps extends DeckWithProfile {}

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800",
  Intermediate: "bg-yellow-100 text-yellow-800",
  Advanced: "bg-red-100 text-red-800",
};

const DeckCard = ({
  id,
  title,
  description,
  price,
  cardcount,
  difficulty,
  imageurl,
  creatorName,
  creatorAvatar,
  creatorid,
  created_at,
  profiles,
}: DeckCardProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreator = user?.id === creatorid;
  const isPurchased = profile?.purchaseddeckids?.includes(id);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDeck(id);
      toast({
        title: "Success",
        description: "Deck deleted successfully",
      });
      setShowDialog(false);
      // You might want to trigger a refresh of the deck list here
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast({
        title: "Error",
        description: "Failed to delete deck",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDialog = () => {
    if (!showDialog) return null;

    if (isCreator) {
      return (
        <CreatorDeckDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          deck={{
            id,
            title,
            description,
            price,
            cardcount,
            difficulty,
            imageurl,
            creatorid,
            created_at,
            creatorName,
            creatorAvatar,
            profiles,
          }}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      );
    }

    if (isPurchased) {
      return (
        <PurchasedDeckDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          deck={{
            id,
            title,
            description,
            price,
            cardcount,
            difficulty,
            imageurl,
            creatorid,
            created_at,
            creatorName,
            creatorAvatar,
            profiles,
          }}
          purchaseDate={created_at} // Replace with actual purchase date when available
        />
      );
    }

    return (
      <BuyDeckDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        deck={{
          id,
          title,
          description,
          price,
          cardcount,
          difficulty,
          imageurl,
          creatorid,
          created_at,
          creatorName,
          creatorAvatar,
          profiles,
        }}
      />
    );
  };

  return (
    <>
      <Card
        className="w-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-white cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            <img
              src={imageurl}
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
          <p className="text-sm text-gray-500 h-12 line-clamp-2">
            {description}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col space-y-2">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm">4.5</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm">{cardcount} cards</span>
              </div>
            </div>
            <div className="text-lg font-bold text-[#2B4C7E]">
              ${price.toFixed(2)}
            </div>
          </div>

          {creatorName && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Avatar className="h-6 w-6">
                <AvatarImage src={creatorAvatar} />
                <AvatarFallback>
                  {creatorName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{creatorName}</span>
            </div>
          )}
        </CardFooter>
      </Card>
      {renderDialog()}
    </>
  );
};

export default DeckCard;
