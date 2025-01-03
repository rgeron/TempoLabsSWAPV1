import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Heart, Tag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { BuyDeckDialog } from "./BuyDeckDialog";
import { PurchasedDeckDialog } from "./PurchasedDeckDialog";
import { CreatorDeckDialog } from "./CreatorDeckDialog";
import { deleteDeck } from "@/lib/api/decks";
import { useToast } from "@/components/ui/use-toast";
import type { DeckWithProfile, DeckCategory } from "@/types/marketplace";
import { getCategoryStyle, CATEGORY_DEFINITIONS } from "@/types/marketplace";
import { cn } from "@/lib/utils";

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
  categories,
  profiles,
}: DeckCardProps) => {
  const { user, profile, updateLikedDecks } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [processedCategories, setProcessedCategories] = useState<
    DeckCategory[]
  >([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const isCreator = user?.id === creatorid;
  const isPurchased = profile?.purchaseddeckids?.includes(id);
  const isLiked = profile?.likeddeckids?.includes(id);
  const canLike = !isCreator && !isPurchased;

  // Local state for optimistic updates
  const [isOptimisticallyLiked, setIsOptimisticallyLiked] = useState(isLiked);

  // Process categories when they change
  useEffect(() => {
    try {
      // Ensure categories is an array and filter out invalid categories
      const validCategories = Array.isArray(categories)
        ? categories.filter((category): category is DeckCategory => {
            return CATEGORY_DEFINITIONS.some((def) =>
              def.subcategories.includes(category),
            );
          })
        : [];

      setProcessedCategories(validCategories);
      setCategoriesError(null);
    } catch (error) {
      console.error("Error processing categories:", error);
      setCategoriesError("Error loading categories");
      setProcessedCategories([]);
    }
  }, [categories]);

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
          variant: "default",
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
    [user, id, isOptimisticallyLiked, toast, updateLikedDecks],
  );

  const handleDelete = async () => {
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
  };

  const renderCategories = () => {
    if (categoriesError) {
      return (
        <div className="text-sm text-red-500 mt-2 flex items-center gap-1">
          <Tag className="h-4 w-4" />
          <span>Error loading categories</span>
        </div>
      );
    }

    if (!processedCategories.length) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {processedCategories.map((category) => {
          const parentCategory = CATEGORY_DEFINITIONS.find((cat) =>
            cat.subcategories.includes(category),
          );

          if (!parentCategory) return null;

          return (
            <div
              key={category}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1",
                "rounded-full text-xs font-medium",
                "transition-all duration-200",
                "border border-transparent",
                parentCategory.gradient,
                parentCategory.hoverGradient,
                "hover:shadow-md",
              )}
            >
              <span className="text-base leading-none">
                {parentCategory.icon}
              </span>
              <span>{category}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDialog = () => {
    if (!showDialog) return null;

    const dialogProps = {
      isOpen: showDialog,
      onClose: () => setShowDialog(false),
      deck: {
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
        categories: processedCategories,
        profiles,
      },
    };

    if (isCreator) {
      return (
        <CreatorDeckDialog
          {...dialogProps}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      );
    }

    if (isPurchased) {
      return <PurchasedDeckDialog {...dialogProps} purchaseDate={created_at} />;
    }

    return <BuyDeckDialog {...dialogProps} />;
  };

  return (
    <>
      <Card
        className="w-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-white cursor-pointer relative group"
        onClick={() => setShowDialog(true)}
      >
        <CardHeader className="p-0">
          <div className="relative h-40 w-full">
            <img
              src={imageurl}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Top row: Difficulty and Like button */}
            <div className="absolute top-2 w-full px-2 flex justify-between items-center">
              <Badge className={`${difficultyColors[difficulty]} border-none`}>
                {difficulty}
              </Badge>
              {canLike && (
                <button
                  onClick={handleLikeClick}
                  disabled={isLiking}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isOptimisticallyLiked
                        ? "fill-red-500 text-red-500"
                        : "fill-none text-gray-600 hover:text-red-500",
                    )}
                  />
                </button>
              )}
            </div>

            {/* Bottom row: Creator profile */}
            {creatorName && (
              <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                <Avatar className="h-6 w-6 border border-white/50">
                  <AvatarImage src={creatorAvatar} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {creatorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-white font-medium">
                  {creatorName}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg truncate">{title}</h3>
            <p className="text-sm text-gray-500 h-12 line-clamp-2">
              {description}
            </p>
            {renderCategories()}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
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
        </CardFooter>
      </Card>
      {renderDialog()}
    </>
  );
};

export default DeckCard;
