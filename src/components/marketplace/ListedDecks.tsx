import React, { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DeckCard from "./DeckCard";
import { useAuth } from "@/lib/auth";
import { createDeck, getUserDecks, deleteDeck } from "@/lib/api/decks";
import type { Database } from "@/types/supabase";
import DeleteDeckButton from "./DeleteDeckButton";
import AddDeckDialog from "./AddDeckDialog";
import { Button } from "@/components/ui/button";

type Deck = Database["public"]["Tables"]["decks"]["Row"];

const ListedDecks = () => {
  const [isAddDeckOpen, setIsAddDeckOpen] = useState(false);
  const [listedDecks, setListedDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserDecks();
    }
  }, [user]);

  const fetchUserDecks = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const decks = await getUserDecks(user.id);
      setListedDecks(decks || []);
    } catch (error) {
      console.error("Error fetching decks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your decks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const newDeck = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        difficulty: formData.get("difficulty") as
          | "Beginner"
          | "Intermediate"
          | "Advanced",
        cardCount: 0,
        imageUrl:
          "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
        creatorId: user!.id,
      };

      await createDeck(newDeck);
      await fetchUserDecks();

      toast({
        title: "Success",
        description: "Deck added to store successfully",
      });

      setIsAddDeckOpen(false);
    } catch (error) {
      console.error("Error creating deck:", error);
      toast({
        title: "Error",
        description: "Failed to add deck to store",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      setDeletingDeckId(deckId);
      await deleteDeck(deckId);
      await fetchUserDecks();
      toast({
        title: "Success",
        description: "Deck deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast({
        title: "Error",
        description: "Failed to delete deck",
        variant: "destructive",
      });
    } finally {
      setDeletingDeckId(null);
    }
  };

  // Render the empty state immediately if there are no decks
  if (!isLoading && listedDecks.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2B4C7E]">
            Your Decks on the Market
          </h1>
          <AddDeckDialog
            isOpen={isAddDeckOpen}
            onOpenChange={setIsAddDeckOpen}
            onSubmit={handleAddDeck}
            isSubmitting={isSubmitting}
          />
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg text-gray-500">No decks listed yet</p>
          <Button
            onClick={() => setIsAddDeckOpen(true)}
            className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Deck
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#2B4C7E]">
          Your Decks on the Market
        </h1>
        <AddDeckDialog
          isOpen={isAddDeckOpen}
          onOpenChange={setIsAddDeckOpen}
          onSubmit={handleAddDeck}
          isSubmitting={isSubmitting}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listedDecks.map((deck) => (
            <div key={deck.id} className="space-y-2">
              <div className="relative group">
                <DeckCard {...deck} />
                <DeleteDeckButton
                  onDelete={() => handleDeleteDeck(deck.id)}
                  isDeleting={deletingDeckId === deck.id}
                />
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">
                  Listed on: {new Date(deck.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold text-[#2B4C7E]">
                  Price: ${deck.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListedDecks;
