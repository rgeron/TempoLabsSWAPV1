import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./components/landing/LandingPage";
import PurchasedDecks from "./components/marketplace/PurchasedDecks";
import LikedDecks from "./components/marketplace/LikedDecks";
import ListedDecks from "./components/marketplace/ListedDecks";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/purchased-decks"
          element={
            <Home>
              <PurchasedDecks />
            </Home>
          }
        />
        <Route
          path="/liked-decks"
          element={
            <Home>
              <LikedDecks />
            </Home>
          }
        />
        <Route
          path="/listed-decks"
          element={
            <Home>
              <ListedDecks />
            </Home>
          }
        />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
