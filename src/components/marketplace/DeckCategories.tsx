import React from "react";
import { Tag } from "lucide-react";
import { DeckCategory } from "@/types/marketplace";
import { getCategoryStyle, CATEGORY_DEFINITIONS } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface DeckCategoriesProps {
  categories?: DeckCategory[] | null;
  className?: string;
}

export const DeckCategories = ({
  categories,
  className,
}: DeckCategoriesProps) => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  // Filter out invalid categories and ensure they exist in CATEGORY_DEFINITIONS
  const validCategories = categories.filter(
    (category): category is DeckCategory => {
      return CATEGORY_DEFINITIONS.some((def) =>
        def.subcategories.includes(category),
      );
    },
  );

  if (validCategories.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {validCategories.map((category) => {
        const parentCategory = CATEGORY_DEFINITIONS.find((cat) =>
          cat.subcategories.includes(category),
        );

        if (!parentCategory) return null;

        return (
          <div
            key={category}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1",
              "rounded-full text-xs font-medium",
              "transition-all duration-200",
              "border border-transparent",
              parentCategory.gradient,
              parentCategory.hoverGradient,
              "hover:shadow-md",
            )}
          >
            <span className="text-base leading-none">
              {parentCategory.icon}
            </span>
            <span>{category}</span>
          </div>
        );
      })}
    </div>
  );
};
