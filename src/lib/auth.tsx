import type { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateLikedDecks: (deckId: string, isLiking: boolean) => Promise<void>;
  updatePurchasedDecks: (deckId: string) => Promise<void>;
  updateLocalProfile: (newProfile: Profile) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  const updateLocalProfile = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) return;

    const { data } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data?.user?.id) {
      await fetchProfile(data.user.id);
      navigate("/app/home");
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUser) {
        throw new Error("Username is already taken");
      }

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

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("Not authenticated");

    // If updating username, check if it's already taken
    if (updates.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", updates.username)
        .neq("id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUser) {
        throw new Error("Username is already taken");
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    // Refresh the profile data
    await fetchProfile(user.id);
  };

  const updateLikedDecks = useCallback(
    async (deckId: string, isLiking: boolean) => {
      if (!user || !profile) throw new Error("Not authenticated");

      try {
        let newLikedDeckIds: string[];

        if (isLiking) {
          // Add the deck to liked decks
          newLikedDeckIds = [...(profile.likeddeckids || []), deckId];
        } else {
          // Remove the deck from liked decks
          newLikedDeckIds = (profile.likeddeckids || []).filter(
            (id) => id !== deckId,
          );
        }

        const { error } = await supabase
          .from("profiles")
          .update({ likeddeckids: newLikedDeckIds })
          .eq("id", user.id);

        if (error) throw error;

        // Update local profile state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                likeddeckids: newLikedDeckIds,
              }
            : null,
        );
      } catch (error) {
        console.error("Error updating liked decks:", error);
        throw error;
      }
    },
    [user, profile],
  );

  const updatePurchasedDecks = useCallback(
    async (deckId: string) => {
      if (!user || !profile) throw new Error("Not authenticated");

      try {
        const purchaseDate = new Date().toISOString();
        const newPurchasedDeckIds = [
          ...(profile.purchaseddeckids || []),
          deckId,
        ];
        const newPurchaseInfo = [
          ...(profile.purchaseinfo || []),
          { deckId, purchaseDate },
        ];

        // Optimistically update local state
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                purchaseddeckids: newPurchasedDeckIds,
                purchaseinfo: newPurchaseInfo,
              }
            : null,
        );

        // Update backend
        const { error } = await supabase
          .from("profiles")
          .update({
            purchaseddeckids: newPurchasedDeckIds,
            purchaseinfo: newPurchaseInfo,
          })
          .eq("id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating purchased decks:", error);
        // Revert optimistic update on error
        await fetchProfile(user.id);
        throw error;
      }
    },
    [user, profile, fetchProfile],
  );

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
    updateProfile,
    updateLikedDecks,
    updatePurchasedDecks,
    updateLocalProfile,
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
