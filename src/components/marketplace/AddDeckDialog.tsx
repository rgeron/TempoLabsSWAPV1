import React, { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORY_DEFINITIONS, DeckCategory } from "@/types/marketplace";
import { Separator } from "@/components/ui/separator";

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
  const [selectedCategories, setSelectedCategories] = useState<DeckCategory[]>(
    [],
  );

  const handleCategoryChange = (category: DeckCategory, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Add selected categories to form data
    selectedCategories.forEach((category) => {
      formData.append("categories", category);
    });

    await onSubmit(event);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Deck to Store</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new flashcard deck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden">
          <div className="flex gap-6 h-full">
            {/* Left Column */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Deck Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Separator */}
            <Separator orientation="vertical" />

            {/* Right Column */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <div className="p-4 space-y-6">
                    {CATEGORY_DEFINITIONS.map((categoryGroup) => (
                      <div key={categoryGroup.name} className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                          <span>{categoryGroup.icon}</span>
                          {categoryGroup.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {categoryGroup.subcategories.map((category) => (
                            <div
                              key={category}
                              className={`flex items-center space-x-2 p-2 rounded-md ${categoryGroup.gradient} transition-colors duration-200 ${categoryGroup.hoverGradient}`}
                            >
                              <Checkbox
                                id={`category-${category}`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) =>
                                  handleCategoryChange(
                                    category,
                                    checked as boolean,
                                  )
                                }
                              />
                              <label
                                htmlFor={`category-${category}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                              >
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-[#2B4C7E] text-white hover:bg-[#1A365D] w-[200px]"
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeckDialog;
