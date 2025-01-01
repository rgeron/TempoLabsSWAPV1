import React, { useState } from "react";
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
import { useAuth } from "@/lib/auth";
import { SettingsModal } from "../auth/SettingsModal";

const TopNav = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { signOut, user, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get initials from username or email
  const getInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  return (
    <>
      <div className="h-20 w-full px-6 flex items-center justify-between bg-white shadow-sm">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2B4C7E] h-5 w-5" />
            <Input
              type="search"
              placeholder="Search flashcard decks..."
              className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 border-[#E6F3FF] focus:border-[#2B4C7E] focus:ring-2 focus:ring-[#2B4C7E]/20 bg-[#F8FAFF] placeholder-[#2B4C7E]/50"
            />
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-6 ml-4">
          {/* Notifications */}
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <Bell className="h-6 w-6 text-[#2B4C7E]" />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-[#FF6B6B] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">3</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center space-x-3 bg-[#F3F6FF] hover:bg-[#E6F3FF] transition-colors duration-200 rounded-full py-2 px-4 cursor-pointer">
                <Avatar className="h-10 w-10 border-2 border-[#2B4C7E]">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-[#2B4C7E] text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-[#2B4C7E]">
                    {profile?.username || user?.email}
                  </span>
                  <span className="text-xs text-[#2B4C7E]/70">
                    ${(250).toFixed(2)}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mt-2 bg-white border-[#E6F3FF]"
            >
              <DropdownMenuLabel className="text-[#2B4C7E]">
                {profile?.username || user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#E6F3FF]" />
              <DropdownMenuItem className="text-[#2B4C7E] focus:bg-[#E6F3FF] focus:text-[#2B4C7E]">
                <Wallet className="mr-2 h-4 w-4" />
                <span>Balance: ${(250).toFixed(2)}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[#2B4C7E] focus:bg-[#E6F3FF] focus:text-[#2B4C7E] cursor-pointer"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E6F3FF]" />
              <DropdownMenuItem
                className="text-[#FF6B6B] focus:bg-[#FFE4E9] focus:text-[#FF6B6B] cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default TopNav;
