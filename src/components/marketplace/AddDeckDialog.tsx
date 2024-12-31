import React, { useState } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddDeckDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
}

const AddDeckDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddDeckDialogProps) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);

    if (!file) {
      setFileError("Please select a file");
      return;
    }

    if (!file.name.endsWith(".txt")) {
      setFileError("Please upload a .txt file");
      event.target.value = "";
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size should be less than 5MB");
      event.target.value = "";
      return;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]">
          <Plus className="h-5 w-5 mr-2" />
          Add Deck to Store
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Deck to Store</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Deck Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <select
              id="difficulty"
              name="difficulty"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deck-file">Flashcards File (.txt)</Label>
            <Input
              id="deck-file"
              name="deck-file"
              type="file"
              accept=".txt"
              required
              onChange={handleFileChange}
            />
            {fileError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-gray-500">
              File format: front[tab]back[tab]tags(optional)
              <br />
              Example: What is the capital of
              France?[tab]Paris[tab]geography,europe
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
            disabled={isSubmitting || !!fileError}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Deck...
              </>
            ) : (
              "Add Deck"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeckDialog;
