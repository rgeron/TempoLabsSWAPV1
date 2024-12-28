import React from "react";
import {
  Search,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SidebarProps {
  onCategorySelect?: (category: string) => void;
  onSearch?: (query: string) => void;
  selectedCategory?: string;
}

const Sidebar = ({
  onCategorySelect = () => {},
  onSearch = () => {},
  selectedCategory = "Languages",
}: SidebarProps) => {
  const categories = {
    Languages: ["Spanish", "French", "German", "Japanese", "Chinese"],
    Sciences: ["Physics", "Chemistry", "Biology", "Mathematics"],
    Arts: ["Literature", "History", "Music", "Visual Arts"],
  };

  return (
    <div className="w-[280px] h-full border-r bg-white p-4 flex flex-col">
      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search decks..."
            className="pl-8"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">CATEGORIES</h2>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(categories).map(([category, subcategories]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-sm hover:no-underline">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-2 pl-4">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      className={`text-sm text-left py-1 hover:text-primary ${selectedCategory === subcategory ? "text-primary font-medium" : "text-gray-600"}`}
                      onClick={() => onCategorySelect(subcategory)}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* My Decks Section */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">MY DECKS</h2>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <BookOpen className="h-4 w-4" />
            <span>Purchased Decks</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <ShoppingCart className="h-4 w-4" />
            <span>On Sale</span>
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">ANALYTICS</h2>
        <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
          <TrendingUp className="h-4 w-4" />
          <span>Sales Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
