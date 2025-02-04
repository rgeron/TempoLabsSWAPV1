import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Vérifie si ce fichier existe
import { ReviewDialog } from "./ReviewDialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { downloadFlashcardsFile, getFlashcards } from "@/lib/api/flashcards";
import { createReview, getDeckReviews, type Review } from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth";
import type { DeckWithProfile, FlashCard } from "@/types/marketplace";
import { format } from "date-fns";
import { Download, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { FlashcardPreview } from "../FlashcardPreview";
import { OverviewTab } from "../OverviewTab";

interface PurchasedDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckWithProfile;
  purchaseDate?: string;
}

export function PurchasedDeckDialog({
  isOpen,
  onClose,
  deck,
  purchaseDate,
}: PurchasedDeckDialogProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadReviews = async () => {
      if (selectedTab === "reviews") {
        try {
          setIsLoadingReviews(true);
          const fetchedReviews = await getDeckReviews(deck.id);
          setReviews(fetchedReviews);
        } catch (error) {
          console.error("Error loading reviews:", error);
          toast({
            title: "Error",
            description: "Failed to load reviews",
            variant: "destructive",
          });
        } finally {
          setIsLoadingReviews(false);
        }
      }
    };

    loadReviews();
  }, [selectedTab, deck.id, toast]);

  useEffect(() => {
    const loadFlashcards = async () => {
      if (selectedTab === "flashcards" && deck.creatorid) {
        try {
          setIsLoading(true);
          const cards = await getFlashcards(deck.id, deck.creatorid);
          setFlashcards(cards);
        } catch (error) {
          console.error("Error loading flashcards:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFlashcards();
  }, [selectedTab, deck.id, deck.creatorid]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Download the raw file content
      const fileContent = await downloadFlashcardsFile(deck.id, deck.creatorid);

      // Create and download the file
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deck.title
        .toLowerCase()
        .replace(/\s+/g, "-")}-flashcards.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download complete",
        description: "Your flashcards file has been downloaded",
      });
    } catch (error) {
      console.error("Error downloading flashcards:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your flashcards",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{deck.title}</DialogTitle>
          <DialogDescription className="text-base">
            Created by {deck.creatorName} • {deck.cardcount} cards
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          className="flex-1 flex flex-col overflow-hidden"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent
              value="overview"
              className="mt-0 h-full"
              forceMount={selectedTab === "overview"}
            >
              <OverviewTab deck={deck} purchaseDate={purchaseDate} />
            </TabsContent>

            <TabsContent
              value="flashcards"
              className="mt-0 h-full"
              forceMount={selectedTab === "flashcards"}
            >
              <FlashcardPreview flashcards={flashcards} isLoading={isLoading} />
            </TabsContent>

            <TabsContent
              value="reviews"
              className="mt-0 h-full"
              forceMount={selectedTab === "reviews"}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Reviews</h3>
                    <span className="text-sm text-gray-500">
                      ({reviews.length})
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowReviewDialog(true)}
                    className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
                  >
                    Write a Review
                  </Button>
                </div>
                {isLoadingReviews ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="space-y-2 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={review.profiles?.avatar_url || undefined}
                              />
                              <AvatarFallback>
                                {review.profiles?.username
                                  ?.slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {review.profiles?.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(
                                  new Date(review.created_at),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            {user?.id === review.user_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await deleteReview(review.id);
                                    const updatedReviews = await getDeckReviews(
                                      deck.id
                                    );
                                    setReviews(updatedReviews);
                                    toast({
                                      title: "Review deleted",
                                      description:
                                        "Your review has been deleted successfully",
                                    });
                                  } catch (error) {
                                    console.error(
                                      "Error deleting review:",
                                      error
                                    );
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete review",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4 text-gray-500">
                    <p>No reviews yet</p>
                    <p className="text-sm">Be the first to review this deck!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Flashcards
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      <ReviewDialog
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        deckTitle={deck.title}
        onSubmit={async (rating, comment) => {
          if (!user) return;
          try {
            await createReview(deck.id, user.id, rating, comment);
            const updatedReviews = await getDeckReviews(deck.id);
            setReviews(updatedReviews);
            toast({
              title: "Review submitted",
              description: "Thank you for your feedback!",
            });
          } catch (error) {
            console.error("Error submitting review:", error);
            toast({
              title: "Error",
              description: "Failed to submit review",
              variant: "destructive",
            });
          }
        }}
      />
    </Dialog>
  );
}
