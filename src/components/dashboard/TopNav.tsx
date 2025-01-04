import { useState, FormEvent, useCallback, useEffect } from "react";
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
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { SettingsModal } from "../auth/SettingsModal";
import {
  SearchFilters,
  type SearchFilters as SearchFiltersType,
} from "./SearchFilters";

const TopNav = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFiltersType>(() => ({
    liked: searchParams.get("liked") === "true",
    purchased: searchParams.get("purchased") === "true",
    minRating: searchParams.get("minRating")
      ? Number(searchParams.get("minRating"))
      : undefined,
    categories: searchParams.get("categories")
      ? searchParams.get("categories")?.split(",")
      : undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
  }));

  // Update search query from URL when location changes
  useEffect(() => {
    const queryParam = searchParams.get("q");
    setSearchQuery(queryParam || "");
  }, [searchParams]);

  const updateSearchParams = useCallback(
    (newFilters: SearchFiltersType, query?: string) => {
      const params = new URLSearchParams();

      // Preserve the search query if it exists
      if (query !== undefined) {
        if (query) params.set("q", query);
      } else if (searchParams.has("q")) {
        params.set("q", searchParams.get("q")!);
      }

      // Update filter params
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(","));
          } else {
            params.delete(key);
          }
        } else {
          params.set(key, String(value));
        }
      });

      return params;
    },
    [searchParams],
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = updateSearchParams(filters, searchQuery.trim());
    navigate(`/app/search?${params.toString()}`);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    const params = updateSearchParams(newFilters, searchQuery.trim());
    navigate(`/app/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setFilters({});
    // Preserve only the search query when clearing filters
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    navigate(`/app/search?${params.toString()}`);
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
      <div className="h-20 w-full px-6 flex items-center justify-between bg-white shadow-sm">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2B4C7E] h-5 w-5" />
            <Input
              type="search"
              placeholder="Search flashcard decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 border-[#E6F3FF] focus:border-[#2B4C7E] focus:ring-2 focus:ring-[#2B4C7E]/20 bg-[#F8FAFF] placeholder-[#2B4C7E]/50"
            />
          </form>
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Rest of the component remains the same */}
        {/* ... */}
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default TopNav;
