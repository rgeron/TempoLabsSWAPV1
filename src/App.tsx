import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import LandingPage from "./components/landing/LandingPage";
import Home from "./components/dashboard/screens/HomePage";
import LikedDecks from "./components/dashboard/screens/LikedDecks";
import ListedDecks from "./components/dashboard/screens/ListedDecks";
import PurchasedDecks from "./components/dashboard/screens/PurchasedDecks";
import SalesAnalytics from "./components/dashboard/screens/SalesAnalytics";
import SearchDeck from "./components/dashboard/screens/SearchDeck";
import FollowedCreators from "./components/dashboard/screens/FollowedCreators";
import CreatorProfile from "./components/dashboard/screens/CreatorProfile";
import CategoryDecks from "./components/dashboard/screens/CategoryDecks";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import PurchaseCancelled from "./pages/PurchaseCancelled";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/auth";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/category/:category" element={<CategoryDecks />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/purchase-cancelled" element={<PurchaseCancelled />} />

        {/* App Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="purchased-decks" element={<PurchasedDecks />} />
          <Route path="liked-decks" element={<LikedDecks />} />
          <Route path="listed-decks" element={<ListedDecks />} />
          <Route path="sales-analytics" element={<SalesAnalytics />} />
          <Route path="search" element={<SearchDeck />} />
          <Route path="followed-creators" element={<FollowedCreators />} />
          <Route path="category/:category" element={<CategoryDecks />} />
          <Route path="creator/:creatorId" element={<CreatorProfile />} />
          <Route path="*" element={<Navigate to="home" />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
