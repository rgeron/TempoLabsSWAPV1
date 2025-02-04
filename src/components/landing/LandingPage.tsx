import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthModal } from "../auth/AuthModal";
import { AboutDialog } from "./AboutDialog";
import CategoryGrid from "../marketplace/CategoryGrid";
import AllDecks from "../marketplace/AllDecks";
import DeckCard from "../marketplace/deck/DeckCard";
import { supabase } from "@/lib/supabase";
import type { DeckWithProfile } from "@/types/marketplace";
import { ThemeToggle } from "../ThemeToggle";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DeckWithProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app/home" replace />;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);

      // First get profiles matching the search query
      const { data: matchingProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${searchQuery}%`);

      if (profilesError) throw profilesError;

      // Get all decks that match the search criteria
      const { data: decksData, error: decksError } = await supabase
        .from("decks")
        .select("*")
        .or(
          `title.ilike.%${searchQuery}%,` +
            `description.ilike.%${searchQuery}%,` +
            `categories.cs.{${searchQuery}}` +
            (matchingProfiles?.length > 0
              ? `,creatorid.in.(${matchingProfiles.map((p) => p.id).join(",")})`
              : ""),
        )
        .order("created_at", { ascending: false });

      if (decksError) throw decksError;

      // Get all unique creator IDs from the matching decks
      const creatorIds = [...new Set(decksData.map((deck) => deck.creatorid))];

      // Get all creator profiles
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", creatorIds);

      if (allProfilesError) throw allProfilesError;

      // Combine deck data with creator profiles
      const decksWithProfiles = decksData.map((deck) => {
        const profile = allProfiles?.find((p) => p.id === deck.creatorid);
        return {
          ...deck,
          creatorName: profile?.username || "Unknown Creator",
          creatorAvatar: profile?.avatar_url,
          profiles: {
            username: profile?.username || "Unknown Creator",
            avatar_url: profile?.avatar_url,
          },
        };
      });

      setSearchResults(decksWithProfiles);
    } catch (error) {
      console.error("Error searching decks:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-20 border-b bg-card shadow">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">SwapDecks</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowAboutDialog(true)}
            >
              About Us
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="py-10 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-8">
          Find the Best Flashcard Decks
        </h1>
        <div className="max-w-2xl mx-auto relative">
          <form onSubmit={handleSearch}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="search"
              placeholder="Search for flashcard decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="mt-8 container mx-auto px-4">
            <div className="text-left mb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Search Results
              </h2>
              <p className="text-muted-foreground">
                {searchResults.length} decks found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((deck) => (
                <DeckCard key={deck.id} {...deck} />
              ))}
            </div>
          </div>
        ) : searchQuery && !isSearching ? (
          <div className="mt-8 text-center text-muted-foreground">
            <p>No decks found matching your search.</p>
          </div>
        ) : null}
      </section>

      {/* Only show Categories and All Decks if not searching */}
      {!searchQuery && (
        <>
          {/* Categories Section */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <CategoryGrid />
            </div>
          </section>

          {/* Decks Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">
                All Decks
              </h2>
              <AllDecks showTitle={false} />
            </div>
          </section>
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <AboutDialog
        isOpen={showAboutDialog}
        onClose={() => setShowAboutDialog(false)}
      />
    </div>
  );
};

export default LandingPage;
