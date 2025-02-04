import { useState, FormEvent } from "react";
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
import { Search, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { SettingsModal } from "../auth/SettingsModal";
import { ThemeToggle } from "../ThemeToggle";

const TopNav = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear the search after navigation
    }
  };

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
      <div className="h-20 w-full px-6 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2B4C7E] dark:text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search flashcard decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 border-[#E6F3FF] dark:border-gray-700 focus:border-[#2B4C7E] dark:focus:border-gray-600 focus:ring-2 focus:ring-[#2B4C7E]/20 dark:focus:ring-gray-600/20 bg-[#F8FAFF] dark:bg-gray-800 placeholder-[#2B4C7E]/50 dark:placeholder-gray-400"
            />
          </form>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <Bell className="h-6 w-6 text-[#2B4C7E] dark:text-gray-400" />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-[#FF6B6B] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">3</span>
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center space-x-3 bg-[#F3F6FF] dark:bg-gray-800 hover:bg-[#E6F3FF] dark:hover:bg-gray-700 transition-colors duration-200 rounded-full py-2 px-4 cursor-pointer">
                <Avatar className="h-10 w-10 border-2 border-[#2B4C7E] dark:border-gray-600">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-[#2B4C7E] dark:bg-gray-700 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-[#2B4C7E] dark:text-gray-200">
                    {profile?.username || user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mt-2 bg-white dark:bg-gray-900 border-[#E6F3FF] dark:border-gray-700"
            >
              <DropdownMenuLabel className="text-[#2B4C7E] dark:text-gray-200">
                {profile?.username || user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#E6F3FF] dark:bg-gray-700" />
              <DropdownMenuItem
                className="text-[#2B4C7E] dark:text-gray-200 focus:bg-[#E6F3FF] dark:focus:bg-gray-800 focus:text-[#2B4C7E] dark:focus:text-gray-200 cursor-pointer"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E6F3FF] dark:bg-gray-700" />
              <DropdownMenuItem
                className="text-[#FF6B6B] focus:bg-[#FFE4E9] dark:focus:bg-red-900/50 focus:text-[#FF6B6B] cursor-pointer"
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
