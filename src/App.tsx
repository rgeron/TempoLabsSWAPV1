import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import LandingPage from "./components/landing/LandingPage";
import Home from "./components/dashboard/screens/HomePage";
import LikedDecks from "./components/dashboard/screens/LikedDecks";
import ListedDecks from "./components/dashboard/screens/ListedDecks";
import PurchasedDecks from "./components/dashboard/screens/PurchasedDecks";
import SalesAnalytics from "./components/dashboard/screens/SalesAnalytics";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/auth";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* App Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="purchased-decks" element={<PurchasedDecks />} />
          <Route path="liked-decks" element={<LikedDecks />} />
          <Route path="listed-decks" element={<ListedDecks />} />
          <Route path="sales-analytics" element={<SalesAnalytics />} />
          <Route path="*" element={<Navigate to="home" />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
