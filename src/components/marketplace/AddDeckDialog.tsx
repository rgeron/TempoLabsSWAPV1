import React from "react";
import { Plus, Loader2, Upload } from "lucide-react";
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
            <Label htmlFor="flashcardsFile">Flashcards File (.txt)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="flashcardsFile"
                name="flashcardsFile"
                type="file"
                accept=".txt"
                required
                className="flex-1"
              />
              <Upload className="h-5 w-5 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">
              Upload a .txt file with your flashcards
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
            disabled={isSubmitting}
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
