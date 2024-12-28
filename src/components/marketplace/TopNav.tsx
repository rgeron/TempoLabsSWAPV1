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
    <div className="h-16 w-full border-b border-gray-200 px-4 flex items-center justify-between bg-white">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search flashcard decks..."
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-600 cursor-pointer" />
          {notifications > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">{notifications}</span>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
