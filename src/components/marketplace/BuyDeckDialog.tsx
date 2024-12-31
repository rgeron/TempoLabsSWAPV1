import React, { useState } from "react";
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
import type { BuyDeckDialogProps, FlashCard } from "@/types/marketplace";

export const BuyDeckDialog = ({
  isOpen,
  onClose,
  deck,
}: BuyDeckDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Sample flashcards - in real app, these would come from your backend
  const sampleFlashcards: FlashCard[] = [
    { front: "Test1", back: "VersoTest1" },
    { front: "Test2", back: "VersoTest2" },
  ];

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
      // Add purchase logic here
      toast({
        title: "Purchase successful!",
        description: "The deck has been added to your collection",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{deck.title}</DialogTitle>
          <DialogDescription>
            Created by {deck.creatorName} • {deck.cardCount} cards
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
                  <li>Total Cards: {deck.cardCount}</li>
                  <li>Price: ${deck.price.toFixed(2)}</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {sampleFlashcards.map((card, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border bg-gray-50 space-y-2"
                  >
                    <div className="font-medium">Front: {card.front}</div>
                    <div className="text-gray-600">Back: {card.back}</div>
                  </div>
                ))}
              </div>
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
          >
            Purchase for ${deck.price.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
