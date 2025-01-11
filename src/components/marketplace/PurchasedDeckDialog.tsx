import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadFlashcardsFile, getFlashcards } from "@/lib/api/flashcards";
import type { DeckWithProfile, FlashCard } from "@/types/marketplace";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FlashcardPreview } from "./FlashcardPreview";
import { OverviewTab } from "./OverviewTab";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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
      a.download = `${deck.title.toLowerCase().replace(/\s+/g, "-")}-flashcards.txt`;
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
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
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
    </Dialog>
  );
}
