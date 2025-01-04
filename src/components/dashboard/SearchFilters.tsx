import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { DeckCategory, CATEGORY_DEFINITIONS } from "@/types/marketplace";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  liked?: boolean;
  purchased?: boolean;
  minRating?: number;
  categories?: DeckCategory[];
  minPrice?: number;
  maxPrice?: number;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: SearchFiltersProps) {
  const handleCategoryToggle = (category: DeckCategory) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.liked) count++;
    if (filters.purchased) count++;
    if (filters.minRating) count++;
    if (filters.categories?.length) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    return count;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-2 lg:px-3 gap-2",
            getActiveFiltersCount() > 0 && "border-blue-500",
            className,
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden lg:inline">Filters</span>
          {getActiveFiltersCount() > 0 && (
            <Badge
              variant="secondary"
              className="h-5 w-5 p-0 flex items-center justify-center"
            >
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>

        <div className="space-y-4">
          {/* Liked & Purchased Toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="liked">Liked Decks</Label>
              <Switch
                id="liked"
                checked={filters.liked}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, liked: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="purchased">Purchased Decks</Label>
              <Switch
                id="purchased"
                checked={filters.purchased}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, purchased: checked })
                }
              />
            </div>
          </div>

          {/* Rating Slider */}
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[filters.minRating || 0]}
                onValueChange={([value]) =>
                  onFiltersChange({ ...filters, minRating: value })
                }
                max={5}
                step={0.5}
                className="flex-1"
              />
              <span className="w-12 text-sm text-right">
                {filters.minRating || 0}
              </span>
            </div>
          </div>

          {/* Price Range Sliders */}
          <div className="space-y-2">
            <Label>Price Range ($)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Slider
                  value={[filters.minPrice || 0]}
                  onValueChange={([value]) =>
                    onFiltersChange({ ...filters, minPrice: value })
                  }
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-sm text-right">
                  ${filters.minPrice || 0}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[filters.maxPrice || 100]}
                  onValueChange={([value]) =>
                    onFiltersChange({ ...filters, maxPrice: value })
                  }
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="w-12 text-sm text-right">
                  ${filters.maxPrice || 100}
                </span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {CATEGORY_DEFINITIONS.map((categoryGroup) =>
                categoryGroup.subcategories.map((category) => {
                  const isSelected = filters.categories?.includes(category);
                  return (
                    <Button
                      key={category}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs justify-start"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <span className="mr-2">{categoryGroup.icon}</span>
                      {category}
                    </Button>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
