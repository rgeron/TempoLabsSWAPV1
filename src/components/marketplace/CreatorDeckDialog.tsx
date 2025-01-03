import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { FlashcardPreview } from "./FlashcardPreview";
import { OverviewTab } from "./OverviewTab";

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
      <DialogContent className="max-w-4xl min-h-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{deck.title}</DialogTitle>
          <DialogDescription className="text-base">
            Created by you • {deck.cardcount} cards
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
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent
              value="overview"
              className="mt-0 h-full"
              forceMount={selectedTab === "overview"}
            >
              <OverviewTab deck={deck} />
            </TabsContent>

            <TabsContent
              value="flashcards"
              className="mt-0 h-full"
              forceMount={selectedTab === "flashcards"}
            >
              <FlashcardPreview flashcards={flashcards} isLoading={isLoading} />
            </TabsContent>

            <TabsContent
              value="stats"
              className="mt-0 h-full"
              forceMount={selectedTab === "stats"}
            >
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
                      <p className="text-sm font-medium text-gray-500">
                        Revenue
                      </p>
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
                      <p className="text-sm font-medium text-gray-500">
                        Buyers
                      </p>
                      <h3 className="text-2xl font-bold text-[#2B4C7E]">
                        {stats.uniqueBuyers}
                      </h3>
                    </div>
                    <Users className="h-8 w-8 text-[#2B4C7E]" />
                  </div>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between space-x-4 pt-4 border-t">
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
