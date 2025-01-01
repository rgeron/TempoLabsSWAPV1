import type { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data?.user) {
      await fetchProfile(data.user.id);
      navigate("/app/home");
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from sign up");

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select()
        .eq("id", authData.user.id)
        .single();

      if (existingProfile) {
        setUser(authData.user);
        setProfile(existingProfile);
        navigate("/app/home");
        return;
      }

      // If no profile exists, create one
      const { error: profileError } = await supabase.rpc("create_new_profile", {
        user_id: authData.user.id,
        user_username: username,
      });

      if (profileError) throw profileError;

      setUser(authData.user);
      await fetchProfile(authData.user.id);
      navigate("/app/home");
    } catch (error) {
      console.error("Error in signUp:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate("/");
  };

  const value = {
    user,
    profile,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
