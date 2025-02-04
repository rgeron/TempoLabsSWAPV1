import { AuthModal } from "@/components/auth/AuthModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { deleteDeck } from "@/lib/api/decks";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { DeckWithProfile } from "@/types/decks";
import { getCategoryStyle } from "@/types/catergories";
import { BookOpen, Heart, MoreHorizontal, Star } from "lucide-react";
import React, { MouseEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BuyDeckDialog } from "../dialog/BuyDeckDialog";
import { CreatorDeckDialog } from "../dialog/CreatorDeckDialog";
import { PurchasedDeckDialog } from "../dialog/PurchasedDeckDialog";
import DeckImage from "./DeckImage";

interface DeckCardProps extends DeckWithProfile {}

const difficultyColors = {
  Beginner:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const MAX_VISIBLE_TAGS = 3;

const DeckCard = ({
  id,
  title,
  description,
  price,
  cardcount,
  difficulty,
  cover_image_url: imageurl,
  creator,
  created_at,
  categories,
  average_rating,
  total_reviews,
}: DeckCardProps) => {
  const { username: creatorName, avatar_url: creatorAvatar, id: creatorid } = creator;
  const { user, profile, updateLikedDecks } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isCreator = user?.id === creatorid;
  const isPurchased = profile?.purchaseddeckids?.includes(id);
  const isLiked = profile?.likeddeckids?.includes(id);
  const canLike = !isCreator && !isPurchased;

  // Local state for optimistic updates
  const [isOptimisticallyLiked, setIsOptimisticallyLiked] = useState(isLiked);

  const handleCreatorClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (creatorid) {
      navigate(`/app/creator/${creatorid}`);
    }
  };

  const handleLikeClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to like this deck",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLiking(true);
        setIsOptimisticallyLiked(!isOptimisticallyLiked);
        await updateLikedDecks(id, !isOptimisticallyLiked);

        toast({
          title: isOptimisticallyLiked ? "Deck unliked" : "Deck liked",
          description: isOptimisticallyLiked
            ? "Deck removed from your liked decks"
            : "Deck added to your liked decks",
        });
      } catch (error) {
        console.error("Error liking/unliking deck:", error);
        setIsOptimisticallyLiked(!isOptimisticallyLiked);
        toast({
          title: "Error",
          description: "Failed to update deck like status",
          variant: "destructive",
        });
      } finally {
        setIsLiking(false);
      }
    },
    [user, id, isOptimisticallyLiked, toast, updateLikedDecks]
  );

  const renderCategories = () => {
    if (!categories || categories.length === 0) return null;

    const visibleTags = categories.slice(0, MAX_VISIBLE_TAGS);
    const remainingCount = categories.length - MAX_VISIBLE_TAGS;

    return (
      <div className="flex flex-wrap gap-1">
        {visibleTags.map((category) => {
          const style = getCategoryStyle(category);
          return (
            <div
              key={category}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                "bg-white/80 dark:bg-gray-700/50",
                "hover:bg-white dark:hover:bg-gray-700",
                "transition-colors duration-200"
              )}
            >
              <span>{style?.icon}</span>
              <span className="dark:text-gray-200">{category}</span>
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <MoreHorizontal className="h-3 w-3 mr-1" />
            {remainingCount} more
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card
        className="w-full max-w-[280px] h-[360px] overflow-hidden hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 cursor-pointer relative flex flex-col"
        onClick={() => setShowDialog(true)}
      >
        <CardHeader className="p-0">
          <div className="relative h-32 w-full">
            <DeckImage src={imageurl} alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute top-2 w-full px-2 flex justify-between items-center">
              <Badge
                className={cn(difficultyColors[difficulty], "border-none")}
              >
                {difficulty}
              </Badge>
              {canLike && (
                <button
                  onClick={handleLikeClick}
                  disabled={isLiking}
                  className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isOptimisticallyLiked
                        ? "fill-red-500 text-red-500"
                        : "fill-none text-gray-600 dark:text-gray-300 hover:text-red-500"
                    )}
                  />
                </button>
              )}
            </div>

            {creatorName && (
              <button
                onClick={handleCreatorClick}
                className="absolute bottom-2 left-2 flex items-center space-x-2 hover:opacity-80 transition-opacity"
                title={`View ${creatorName}'s profile`}
              >
                <Avatar className="h-6 w-6 border border-white/50">
                  <AvatarImage src={creatorAvatar} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {creatorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white font-medium">
                  {creatorName}
                </span>
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg truncate dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {description}
          </p>
          {renderCategories()}
        </CardContent>

        <CardFooter className="p-4 mt-auto border-t dark:border-gray-700">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-4">
              {average_rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm dark:text-gray-300">
                    {average_rating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="ml-1 text-sm dark:text-gray-300">
                  {cardcount} cards
                </span>
              </div>
            </div>
            <div className="text-lg font-bold text-[#2B4C7E] dark:text-blue-400">
              ${price.toFixed(2)}
            </div>
          </div>
        </CardFooter>
      </Card>

      {showDialog &&
        (isCreator ? (
          <CreatorDeckDialog
            isOpen={true}
            onClose={() => setShowDialog(false)}
            deck={{
              id,
              title,
              description,
              price,
              cardcount,
              difficulty,
              cover_image_url: imageurl,
              creatorid,
              created_at,
              creatorName,
              creatorAvatar,
              categories,
            }}
            onDelete={async () => {
              try {
                setIsDeleting(true);
                await deleteDeck(id);
                toast({
                  title: "Success",
                  description: "Deck deleted successfully",
                });
                setShowDialog(false);
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
            }}
            isDeleting={isDeleting}
          />
        ) : isPurchased ? (
          <PurchasedDeckDialog
            isOpen={true}
            onClose={() => setShowDialog(false)}
            deck={{
              id,
              title,
              description,
              price,
              cardcount,
              difficulty,
              cover_image_url: imageurl,
              creatorid,
              created_at,
              creatorName,
              creatorAvatar,
              categories,
            }}
            purchaseDate={created_at}
          />
        ) : (
          <BuyDeckDialog
            isOpen={true}
            onClose={() => setShowDialog(false)}
            deck={{
              id,
              title,
              description,
              price,
              cardcount,
              difficulty,
              cover_image_url: imageurl,
              creatorid,
              created_at,
              creatorName,
              creatorAvatar,
              categories,
            }}
          />
        ))}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default DeckCard;
