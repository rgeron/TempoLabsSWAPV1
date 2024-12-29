import React from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Bell, Settings, LogOut, Wallet } from "lucide-react";

interface TopNavProps {
  username?: string;
  avatarUrl?: string;
  notifications?: number;
  balance?: number;
}

const TopNav = ({
  username = "John Doe",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  notifications = 3,
  balance = 250.0,
}: TopNavProps) => {
  return (
    <div className="h-20 w-full border-b border-gray-200 px-6 flex items-center justify-between bg-white shadow-sm">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search flashcard decks..."
            className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-6 ml-4">
        {/* Notifications */}
        <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
          <Bell className="h-6 w-6 text-gray-600" />
          {notifications > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {notifications}
              </span>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-full py-2 px-4 cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{username}</span>
                <span className="text-xs text-gray-500">
                  ${balance.toFixed(2)}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>{username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Balance: ${balance.toFixed(2)}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNav;
