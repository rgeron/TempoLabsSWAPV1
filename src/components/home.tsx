import React from "react";
import Sidebar from "./marketplace/Sidebar";
import TopNav from "./marketplace/TopNav";
import DeckGrid from "./marketplace/DeckGrid";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav
          username={profile?.username || user.email}
          avatarUrl={profile?.avatar_url}
        />
        <div className="flex-1 overflow-auto">
          <DeckGrid />
        </div>
      </div>
    </div>
  );
};

export default Home;
