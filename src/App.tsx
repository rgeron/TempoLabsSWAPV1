import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./components/landing/LandingPage";
import routes from "tempo-routes";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
