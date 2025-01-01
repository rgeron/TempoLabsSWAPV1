import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import LandingPage from "./components/landing/LandingPage";
import Home from "./components/dashboard/screens/HomePage";
import LikedDecks from "./components/dashboard/screens/LikedDecks";
import ListedDecks from "./components/dashboard/screens/ListedDecks";
import PurchasedDecks from "./components/dashboard/screens/PurchasedDecks";
import SalesAnalytics from "./components/dashboard/screens/SalesAnalytics";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/auth";

// Wrapper for private/authenticated routes
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  return user ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated Routes */}
        <Route
          path="/app/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<Home />} />
          <Route path="purchased-decks" element={<PurchasedDecks />} />
          <Route path="liked-decks" element={<LikedDecks />} />
          <Route path="listed-decks" element={<ListedDecks />} />
          <Route path="sales-analytics" element={<SalesAnalytics />} />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="home" />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
