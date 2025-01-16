import { useLocalizedEducationCategories } from "@/lib/hooks/useLocalizedEducationCategories";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocalizedEducationCategoriesProps {
  onSelect?: (category: string) => void;
  className?: string;
  selectedCategories?: string[];
}

export function LocalizedEducationCategories({
  onSelect,
  className = "",
  selectedCategories = [],
}: LocalizedEducationCategoriesProps) {
  const { categories, isLoading, error } = useLocalizedEducationCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">Error loading education categories</div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {categories.map((category) => {
        const fullCategoryKey = `Education/${category.key}`;
        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onSelect?.(fullCategoryKey)}
            className={cn(
              `relative text-left px-4 py-3 rounded-xl transition-all duration-200 shadow-sm
              text-gray-700 hover:text-gray-900 font-medium group`,
              selectedCategories.includes(fullCategoryKey)
                ? `bg-gradient-to-br from-emerald-100 to-teal-100 shadow-md`
                : `bg-white/80 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 hover:shadow-md`,
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm">{category.localizedLabel}</span>
                {category.localizedLabel !== category.label && (
                  <span className="text-xs text-gray-500">
                    {category.label}
                  </span>
                )}
              </div>
              {selectedCategories.includes(fullCategoryKey) && (
                <Check
                  className="h-4 w-4 text-emerald-600 ml-2
                    animate-in zoom-in duration-200"
                />
              )}
            </div>
            {/* Ripple effect overlay */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
              {selectedCategories.includes(fullCategoryKey) && (
                <div className="absolute inset-0 bg-emerald-500/10 animate-in fade-in duration-200" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
