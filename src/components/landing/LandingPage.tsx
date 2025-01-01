import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { Search } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthModal } from "../auth/AuthModal";
import CategoryGrid from "../marketplace/CategoryGrid";
import DeckGrid from "../marketplace/DeckGrid";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="h-20 border-b bg-white shadow">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SwapDecks</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              About Us
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          Find the Best Flashcard Decks
        </h1>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="search"
            placeholder="Search for flashcard decks..."
            className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 bg-white shadow"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <CategoryGrid />
        </div>
      </section>

      {/* Decks Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <DeckGrid />
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default LandingPage;
