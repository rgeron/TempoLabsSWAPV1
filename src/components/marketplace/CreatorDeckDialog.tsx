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
import { Card } from "@/components/ui/card";
import { Loader2, Users, DollarSign, TrendingUp, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getFlashcards } from "@/lib/api/decks";
import type { DeckWithProfile, FlashCard } from "@/types/marketplace";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CreatorDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckWithProfile;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export function CreatorDeckDialog({
  isOpen,
  onClose,
  deck,
  onDelete,
  isDeleting,
}: CreatorDeckDialogProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Sample statistics - replace with real data from your backend
  const stats = {
    totalSales: 150,
    revenue: 1485,
    uniqueBuyers: 142,
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      onClose(); // Close the dialog after successful deletion
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{deck.title}</DialogTitle>
          <DialogDescription>
            Created by you • {deck.cardcount} cards
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="overview"
          className="w-full"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
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
                  <li>
                    Created: {new Date(deck.created_at).toLocaleDateString()}
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

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Sales
                    </p>
                    <h3 className="text-2xl font-bold text-[#2B4C7E]">
                      {stats.totalSales}
                    </h3>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#2B4C7E]" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <h3 className="text-2xl font-bold text-[#2B4C7E]">
                      ${stats.revenue}
                    </h3>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#2B4C7E]" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Buyers</p>
                    <h3 className="text-2xl font-bold text-[#2B4C7E]">
                      {stats.uniqueBuyers}
                    </h3>
                  </div>
                  <Users className="h-8 w-8 text-[#2B4C7E]" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between space-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Deck"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your deck and remove it from the marketplace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
