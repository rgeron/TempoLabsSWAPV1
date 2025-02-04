import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { createDeck, getAllDeckContents } from "@/lib/api/decks";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { CATEGORY_DEFINITIONS, DeckCategory } from "@/types/catergories";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PlagiarismDisputeDialog } from "./PlagiarismDisputeDialog";

interface AddDeckDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
}

const countFlashcardsInFile = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        // Split by newlines and filter out empty lines and comments
        const lines = text.split("\n").filter((line) => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith("#");
        });
        resolve(lines.length);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const jaccardSimilarity = (text1: string, text2: string): number => {
  const set1 = new Set(text1.toLowerCase().split(/\s+/));
  const set2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...set1].filter((word) => set2.has(word))).size;
  const union = new Set([...set1, ...set2]).size;

  return intersection / union;
};

const detectPlagiarism = async (uploadedText: string): Promise<boolean> => {
  const existingDecks = await getAllDeckContents();

  for (const deckContent of existingDecks) {
    const similarity = jaccardSimilarity(uploadedText, deckContent);
    console.log(`Similarity: ${similarity * 100}%`);
    if (similarity > 0.5) return true;
  }
  return false;
};

const AddDeckDialog = ({
  isOpen,
  onOpenChange,
  isSubmitting,
}: AddDeckDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<DeckCategory[]>(
    []
  );
  const [selectedFileName, setSelectedFileName] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [flashcardsFile, setFlashcardsFile] = useState<File | null>(null);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeDeckTitle, setDisputeDeckTitle] = useState("");

  // Reset states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCoverImage(null);
      setCoverPreview(null);
      setSelectedFileName("");
      setSelectedCategories([]);
      setFlashcardsFile(null);
      setShowDisputeDialog(false);
      setDisputeDeckTitle("");
    }
  }, [isOpen]);

  const handleCategoryChange = (category: DeckCategory, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setFlashcardsFile(file);
    }
  };

  const handleCoverImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setCoverImage(file);

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(previewUrl);
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !flashcardsFile) return;

    try {
      setIsUploadingCover(true);
      const form = event.currentTarget;
      const title = form.title.value;

      // Vérification du plagiat
      const fileContent = await flashcardsFile.text();
      const isPlagiarized = await detectPlagiarism(fileContent);

      if (isPlagiarized) {
        setDisputeDeckTitle(title);
        toast({
          title: "Plagiarism detected",
          description:
            "This deck is too similar to an existing one. Please modify your content.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDisputeDialog(true)}
              className="bg-white hover:bg-gray-100"
            >
              Contest
            </Button>
          ),
        });
        setIsUploadingCover(false);
        return;
      }

      // Count flashcards in the file
      const cardcount = await countFlashcardsInFile(flashcardsFile);

      // Upload cover image if selected
      let coverImageUrl = null;
      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}_cover.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("deck-covers")
          .upload(fileName, coverImage, {
            contentType: coverImage.type,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("deck-covers").getPublicUrl(fileName);

        coverImageUrl = publicUrl;
      }

      // Create deck data object
      const deckData = {
        title,
        description: form.description.value,
        price: parseFloat(form.price.value),
        difficulty: form.difficulty.value as
          | "Beginner"
          | "Intermediate"
          | "Advanced",
        categories: selectedCategories,
        creatorid: user.id,
        cover_image_url: coverImageUrl,
        cardcount,
      };

      // Create the deck and upload flashcards file
      await createDeck(deckData, flashcardsFile);

      // Close the dialog
      onOpenChange(false);

      toast({
        title: "Success",
        description: "Deck created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create deck",
        variant: "destructive",
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Add New Deck to Store</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col overflow-hidden px-6"
          >
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex gap-6">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
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
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor="cover-upload"
                          className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-white text-black hover:bg-gray-100 h-10 py-2 px-4 border border-input flex-1"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {coverImage
                            ? "Change Cover Image"
                            : "Upload Cover Image"}
                        </Label>
                        <Input
                          id="cover-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverImageChange}
                          disabled={isUploadingCover}
                        />
                      </div>
                      {coverPreview && (
                        <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-input">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70"
                            onClick={handleRemoveCover}
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Upload a cover image (max 5MB). Supported formats: JPEG,
                        PNG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <Separator orientation="vertical" className="h-auto" />

                {/* Right Column */}
                <div className="flex-1 space-y-6">
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
                                    name="categories"
                                    value={category}
                                    checked={selectedCategories.includes(
                                      category
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleCategoryChange(
                                        category,
                                        checked as boolean
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
                    <Label htmlFor="flashcardsFile">
                      Flashcards File (.txt)
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-white text-black hover:bg-gray-100 h-10 py-2 px-4 border border-input flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedFileName || "Choose File"}
                      </Label>
                      <Input
                        id="file-upload"
                        name="flashcardsFile"
                        type="file"
                        accept=".txt"
                        required
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload a .txt file with your flashcards
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-4 py-4 mt-6 border-t bg-background">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingCover}
                className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
              >
                {isSubmitting || isUploadingCover ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingCover ? "Uploading..." : "Adding Deck..."}
                  </>
                ) : (
                  "Add Deck"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <PlagiarismDisputeDialog
        isOpen={showDisputeDialog}
        onClose={() => setShowDisputeDialog(false)}
        userId={user?.id || ""}
        deckTitle={disputeDeckTitle}
      />
    </>
  );
};

export default AddDeckDialog;
