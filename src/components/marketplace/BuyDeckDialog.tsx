import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getFlashcards, purchaseDeck } from "@/lib/api/decks";
import { useAuth } from "@/lib/auth";
import type { BuyDeckDialogProps, FlashCard } from "@/types/marketplace";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FlashcardPreview } from "./FlashcardPreview";
import { OverviewTab } from "./OverviewTab";

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
  }, [isOpen, selectedTab, deck.id, deck.creatorid, toast]);

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

          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-4">
            <OverviewTab deck={deck} />
          </TabsContent>

          {/* Preview tab */}
          <TabsContent value="preview" className="space-y-4">
            <FlashcardPreview
              flashcards={flashcards}
              isLoading={isLoading}
              limit={5}
            />
          </TabsContent>
        </Tabs>

        {/* Footer actions */}
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
