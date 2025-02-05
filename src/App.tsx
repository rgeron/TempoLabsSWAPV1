import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import CategoryDecks from "./components/dashboard/screens/CategoryDecks";
import CreatorProfile from "./components/dashboard/screens/CreatorProfile";
import FollowedCreators from "./components/dashboard/screens/FollowedCreators";
import Home from "./components/dashboard/screens/HomePage";
import LikedDecks from "./components/dashboard/screens/LikedDecks";
import ListedDecks from "./components/dashboard/screens/ListedDecks";
import PurchasedDecks from "./components/dashboard/screens/PurchasedDecks";
import SalesAnalytics from "./components/dashboard/screens/SalesAnalytics";
import SearchDeck from "./components/dashboard/screens/SearchDeck";
import { SellerDashboard } from "./components/dashboard/screens/SellerDashboard";
import LandingPage from "./components/landing/LandingPage";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme-provider";
import OnboardingComplete from "./pages/OnboardingComplete";
import OnboardingRefresh from "./pages/OnboardingRefresh";
import PurchaseCancelled from "./pages/PurchaseCancelled";
import PurchaseSuccess from "./pages/PurchaseSuccess";

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/category/:category" element={<CategoryDecks />} />
          <Route path="/onboarding/refresh" element={<OnboardingRefresh />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />

          {/* App Routes */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route path="home" element={<Home />} />
            <Route path="purchased-decks" element={<PurchasedDecks />} />
            <Route path="liked-decks" element={<LikedDecks />} />
            <Route path="listed-decks" element={<ListedDecks />} />
            <Route path="seller-dashboard" element={<SellerDashboard />} />
            <Route path="sales-analytics" element={<SalesAnalytics />} />
            <Route path="search" element={<SearchDeck />} />
            <Route path="followed-creators" element={<FollowedCreators />} />
            <Route path="category/:category" element={<CategoryDecks />} />
            <Route path="creator/:creatorId" element={<CreatorProfile />} />

            {/* Make these relative if they are under /app */}
            <Route path="purchase-success" element={<PurchaseSuccess />} />
            <Route path="purchase-cancelled" element={<PurchaseCancelled />} />

            <Route path="*" element={<Navigate to="home" />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
