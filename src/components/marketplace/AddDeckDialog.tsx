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
import { supabase } from "@/lib/supabase";

interface AddDeckDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDeckDialog = ({ isOpen, onOpenChange }: AddDeckDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const difficulty = formData.get("difficulty") as string;
    const file = formData.get("deck-file") as File;

    if (!file) {
      setFileError("Please select a valid .txt file");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload file to Supabase Storage
      const filePath = `${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("flashcards-files")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (storageError) throw new Error(`File upload error: ${storageError.message}`);

      const { data: fileUrlData } = supabase.storage
        .from("flashcards-files")
        .getPublicUrl(filePath);

      if (!fileUrlData) throw new Error("Could not retrieve file URL");

      // 2. Insert deck metadata into the `decks` table
      const { error: dbError } = await supabase
        .from("decks")
        .insert({
          title,
          description,
          price,
          cardcount: 0, // Default value; can be updated later
          difficulty,
          imageurl: "", // Placeholder, update if needed
          creatorid: "", // Replace with the current user's ID
          flashcards_file_url: filePath, // Use the private file path
        });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      // Success
      alert("Deck added successfully!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding deck:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
