import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import DeckCard from "./DeckCard";

interface ListedDeck {
  id: string;
  title: string;
  description: string;
  price: number;
  listDate: string;
  cardCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl: string;
}

const ListedDecks = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // This would typically come from your backend
  const listedDecks: ListedDeck[] = [
    {
      id: "1",
      title: "Chemistry Basics",
      description: "Fundamental chemistry concepts",
      price: 14.99,
      listDate: "2024-03-01",
      cardCount: 120,
      difficulty: "Beginner",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
    },
    // Add more sample decks as needed
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle the import logic here
    console.log("Importing deck...");
    setIsImportOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#2B4C7E]">My Listed Decks</h1>
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]">
              <Plus className="h-5 w-5 mr-2" />
              Import New Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import New Deck</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleImport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deck Title</Label>
                <Input id="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-file">Deck File (.txt)</Label>
                <Input
                  id="deck-file"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
              >
                Import Deck
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listedDecks.map((deck) => (
          <div key={deck.id} className="space-y-2">
            <DeckCard {...deck} />
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Listed on: {new Date(deck.listDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-semibold text-[#2B4C7E]">
                Price: ${deck.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListedDecks;
