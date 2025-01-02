import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getFlashcards } from "@/lib/api/decks";
import type { DeckWithProfile, FlashCard } from "@/types/marketplace";

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

  useEffect(() => {
    const loadFlashcards = async () => {
      if (selectedTab === "flashcards") {
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
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
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
                  <li>
                    Purchase Date:{" "}
                    {new Date(purchaseDate || "").toLocaleDateString()}
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4">
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
                </div>
              ) : (
                <div className="space-y-4">
                  {flashcards.map((card, index) => (
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
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
