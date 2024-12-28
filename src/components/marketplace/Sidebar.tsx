import React from "react";
import {
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Heart,
  Store,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

const Sidebar = ({
  onCategorySelect = () => {},
  selectedCategory = "Languages",
}: SidebarProps) => {
  return (
    <div className="w-[280px] h-full border-r bg-white p-4 flex flex-col">
      {/* Consumer Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-primary">MY LEARNING</h2>
        </div>
        <div className="space-y-2 pl-7">
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <BookOpen className="h-4 w-4" />
            <span>Purchased Decks</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <Heart className="h-4 w-4" />
            <span>Liked Decks</span>
          </button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Seller Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Store className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-primary">MY STORE</h2>
        </div>
        <div className="space-y-2 pl-7">
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <ShoppingCart className="h-4 w-4" />
            <span>My Listed Decks</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
            <TrendingUp className="h-4 w-4" />
            <span>Sales Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
