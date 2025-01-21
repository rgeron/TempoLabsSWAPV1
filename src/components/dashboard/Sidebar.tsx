import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  BanknoteIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

interface SidebarItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem = ({
  item,
  isCollapsed,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? item.label : ""}
      className={cn(
        "w-full flex items-center p-2 text-sm rounded-md transition-colors duration-200",
        isCollapsed ? "justify-center" : "space-x-2",
        isActive
          ? "bg-[#2B4C7E] text-white dark:bg-blue-600"
          : "text-[#2B4C7E] hover:bg-[#E6F3FF] dark:text-gray-200 dark:hover:bg-gray-800",
      )}
    >
      <div className="h-5 w-5 flex-shrink-0">{item.icon}</div>
      {!isCollapsed && <span>{item.label}</span>}
    </button>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const learningItems: NavItem[] = [
    { path: "/app/home", label: "Home", icon: <Home /> },
    {
      path: "/app/purchased-decks",
      label: "Purchased Decks",
      icon: <BookOpen />,
    },
    { path: "/app/liked-decks", label: "Liked Decks", icon: <Heart /> },
    {
      path: "/app/followed-creators",
      label: "Followed Swapers",
      icon: <Users />,
    },
  ];

  const storeItems: NavItem[] = [
    {
      path: "/app/listed-decks",
      label: "My Listed Decks",
      icon: <ShoppingCart />,
    },
    {
      path: "/app/sales-analytics",
      label: "Sales Analytics",
      icon: <TrendingUp />,
    },
    {
      path: "/app/seller-dashboard",
      label: "Seller Dashboard",
      icon: <BanknoteIcon />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path, { replace: true });
  };

  return (
    <div
      className={cn(
        "h-full bg-[#F3F6FF] dark:bg-gray-900 flex flex-col transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]",
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-4 bg-white dark:bg-gray-900">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-[#2B4C7E] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg ml-2 text-[#2B4C7E] dark:text-white">
              SwapDecks
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto p-1.5 hover:bg-[#E6F3FF] dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <Menu className="h-5 w-5 text-[#2B4C7E] dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Learning Section */}
        <div className="space-y-6">
          <div className="px-4 space-y-2">
            {learningItems.slice(0, 1).map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                isCollapsed={isCollapsed}
                isActive={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
              />
            ))}
          </div>

          <Separator className="mx-4 bg-[#2B4C7E]/20 dark:bg-gray-700" />

          {/* My Learning Section */}
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-center px-4",
                isCollapsed ? "justify-center" : "space-x-2",
              )}
            >
              <User className="h-5 w-5 text-[#2B4C7E] dark:text-gray-200 flex-shrink-0" />
              {!isCollapsed && (
                <h2 className="text-sm font-semibold text-[#2B4C7E] dark:text-gray-200">
                  MY LEARNING
                </h2>
              )}
            </div>
            <div className="px-4 space-y-2">
              {learningItems.slice(1).map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={isActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </div>
          </div>

          <Separator className="mx-4 bg-[#2B4C7E]/20 dark:bg-gray-700" />

          {/* Store Section */}
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-center px-4",
                isCollapsed ? "justify-center" : "space-x-2",
              )}
            >
              <Store className="h-5 w-5 text-[#2B4C7E] dark:text-gray-200 flex-shrink-0" />
              {!isCollapsed && (
                <h2 className="text-sm font-semibold text-[#2B4C7E] dark:text-gray-200">
                  MY STORE
                </h2>
              )}
            </div>
            <div className="px-4 space-y-2">
              {storeItems.map((item) => (
                <SidebarItem
                  key={item.path}
                  item={item}
                  isCollapsed={isCollapsed}
                  isActive={isActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
