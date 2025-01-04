import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Heart,
  Store,
  User,
  Menu,
  Users,
  Home,
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
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${isCollapsed ? "w-[80px]" : "w-[280px]"} h-full bg-[#F3F6FF] flex flex-col transition-all duration-300`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-4 bg-white">
        <div className="flex items-center">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-[#2B4C7E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-lg ml-2 text-[#2B4C7E]">
                SwapDecks
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-2 p-1.5 hover:bg-[#E6F3FF] rounded-md transition-colors"
              >
                <Menu className="h-5 w-5 text-[#2B4C7E]" />
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-[#2B4C7E] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-2 p-1.5 hover:bg-[#E6F3FF] rounded-md transition-colors"
              >
                <Menu className="h-5 w-5 text-[#2B4C7E]" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Home Button */}
        <div className="mb-6 px-4">
          <button
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-[#2B4C7E] hover:bg-[#E6F3FF] rounded-md transition-colors`}
            onClick={() => navigate("/app/home", { replace: true })}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Home</span>}
          </button>
        </div>

        <Separator className="mx-4 bg-[#2B4C7E]/20 mb-6" />

        {/* Consumer Section */}
        <div className="mb-6">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} mb-4 px-4`}
          >
            <User className="h-5 w-5 text-[#2B4C7E] flex-shrink-0" />
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-[#2B4C7E]">
                MY LEARNING
              </h2>
            )}
          </div>
          <div className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-[#2B4C7E] hover:bg-[#E6F3FF] rounded-md transition-colors`}
              title={isCollapsed ? "Purchased Decks" : ""}
              onClick={() =>
                navigate("/app/purchased-decks", { replace: true })
              }
            >
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Purchased Decks</span>}
            </button>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-[#2B4C7E] hover:bg-[#E6F3FF] rounded-md transition-colors`}
              title={isCollapsed ? "Liked Decks" : ""}
              onClick={() => navigate("/app/liked-decks", { replace: true })}
            >
              <Heart className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Liked Decks</span>}
            </button>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-[#2B4C7E] hover:bg-[#E6F3FF] rounded-md transition-colors`}
              title={isCollapsed ? "Followed Swapers" : ""}
              onClick={() =>
                navigate("/app/followed-creators", { replace: true })
              }
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Followed Swapers</span>}
            </button>
          </div>
        </div>

        <Separator className="mx-4 bg-[#2B4C7E]/20" />

        {/* Seller Section */}
        <div className="mt-6">
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} mb-4 px-4`}
          >
            <Store className="h-5 w-5 text-[#2B4C7E] flex-shrink-0" />
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-[#2B4C7E]">MY STORE</h2>
            )}
          </div>
          <div className={`space-y-2 ${isCollapsed ? "px-2" : "px-4"}`}>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-[#2B4C7E] hover:bg-[#E6F3FF] rounded-md transition-colors`}
              title={isCollapsed ? "My Listed Decks" : ""}
              onClick={() => navigate("/app/listed-decks", { replace: true })}
            >
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>My Listed Decks</span>}
            </button>
            <button
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-2"} p-2 text-sm text-[#2B4C7E] hover:bg-[#E6F3FF] rounded-md transition-colors`}
              title={isCollapsed ? "Sales Analytics" : ""}
              onClick={() =>
                navigate("/app/sales-analytics", { replace: true })
              }
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
