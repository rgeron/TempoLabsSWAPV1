import React, { useState } from "react";
import {
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Heart,
  Store,
  User,
  Menu,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${isCollapsed ? "w-[80px]" : "w-[280px]"} h-full bg-white flex flex-col transition-all duration-300`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-4">
        <div className="flex items-center">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-lg ml-2">SwapDecks</span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-2 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-2 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Consumer Section */}
        <div className="mb-6">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} mb-4 px-4`}
          >
            <User className="h-5 w-5 text-primary flex-shrink-0" />
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-primary">
                MY LEARNING
              </h2>
            )}
          </div>
          <div className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md`}
              title={isCollapsed ? "Purchased Decks" : ""}
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Purchased Decks</span>}
            </button>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md`}
              title={isCollapsed ? "Liked Decks" : ""}
            >
              <Heart className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Liked Decks</span>}
            </button>
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Seller Section */}
        <div className="mt-6">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} mb-4 px-4`}
          >
            <Store className="h-5 w-5 text-primary flex-shrink-0" />
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-primary">MY STORE</h2>
            )}
          </div>
          <div className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md`}
              title={isCollapsed ? "My Listed Decks" : ""}
            >
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>My Listed Decks</span>}
            </button>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md`}
              title={isCollapsed ? "Sales Analytics" : ""}
            >
              <TrendingUp className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Sales Analytics</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
