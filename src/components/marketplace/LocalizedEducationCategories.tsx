import { useLocalizedEducationCategories } from "@/lib/hooks/useLocalizedEducationCategories";
import { Loader2 } from "lucide-react";

interface LocalizedEducationCategoriesProps {
  onSelect?: (category: string) => void;
  className?: string;
}

export function LocalizedEducationCategories({
  onSelect,
  className = "",
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
      {categories.map((category) => (
        <button
          key={category.key}
          onClick={() => onSelect?.(category.key)}
          className="text-left px-4 py-3 bg-white/80 rounded-xl transition-all duration-200 shadow-sm
            hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 hover:shadow-md
            text-gray-700 hover:text-gray-900 font-medium"
        >
          <span className="block text-sm">{category.localizedLabel}</span>
          {category.localizedLabel !== category.label && (
            <span className="text-xs text-gray-500">{category.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}
