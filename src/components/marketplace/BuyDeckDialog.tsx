import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { getFlashcards, purchaseDeck } from "@/lib/api/decks";
import type { BuyDeckDialogProps, FlashCard } from "@/types/marketplace";
import { Loader2 } from "lucide-react";

export const BuyDeckDialog = ({
  isOpen,
  onClose,
  deck,
}: BuyDeckDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setIsLoading(true);
        const cards = await getFlashcards(deck.id, deck.creatorid);
        setFlashcards(cards);
      } catch (error) {
        console.error("Error loading flashcards:", error);
        toast({
          title: "Error",
          description: "Failed to load flashcards preview",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && selectedTab === "preview") {
      loadFlashcards();
    }
  }, [isOpen, selectedTab, deck.id, deck.creatorid]);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this deck",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPurchasing(true);
      await purchaseDeck(user.id, deck.id);

      toast({
        title: "Purchase successful!",
        description: "The deck has been added to your collection",
      });
      onClose();
      // Force reload to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description:
          error.message || "There was an error processing your purchase",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{deck.title}</DialogTitle>
          <DialogDescription>
            Created by {deck.creatorName} • {deck.cardcount} cards
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          className="w-full"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preview">Preview Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-600">{deck.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Difficulty: {deck.difficulty}</li>
                  <li>Total Cards: {deck.cardcount}</li>
                  <li>Price: ${deck.price.toFixed(2)}</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {flashcards.slice(0, 5).map((card, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-gray-50 space-y-2"
                    >
                      <div className="font-medium">Front: {card.front}</div>
                      <div className="text-gray-600">Back: {card.back}</div>
                      {card.tags && card.tags.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Tags: {card.tags.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                  {flashcards.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-4">
                      ... and {flashcards.length - 5} more cards
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Purchase for $${deck.price.toFixed(2)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
