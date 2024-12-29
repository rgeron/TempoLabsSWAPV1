import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DeckGrid from "../marketplace/DeckGrid";
import { AuthModal } from "../auth/AuthModal";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-20 border-b bg-white">
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
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">
            Find the Best Flashcard Decks
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search for flashcard decks..."
              className="pl-12 pr-4 py-6 text-lg w-full rounded-full border-2 border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Decks for Your Programs
            </h2>
            <p className="text-lg text-gray-600">
              Discover thousands of carefully curated flashcard decks created by
              students and educators. Whether you're studying languages,
              sciences, or arts, find the perfect deck to enhance your learning
              journey.
            </p>
          </div>
          <DeckGrid hideRecommended />
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of students mastering their subjects with SwapDecks.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8"
            onClick={() => setShowAuthModal(true)}
          >
            Sign Up Now
          </Button>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default LandingPage;
