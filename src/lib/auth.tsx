import type { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateLikedDecks: (deckId: string, isLiking: boolean) => Promise<void>;
  updateFollowedCreators: (
    creatorId: string,
    isFollowing: boolean,
  ) => Promise<void>;
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
    // Ensure to select the isseller column
    const { data, error } = await supabase
      .from("profiles")
      .select("*, isseller")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const defaultUsername = `user_${userId.substring(0, 6)}`;
      // Default isseller to false upon creation.
      const { data: insertedData, error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: userId, username: defaultUsername, isseller: false })
        .select("*, isseller")
        .maybeSingle();
      if (upsertError) throw upsertError;
      setProfile(insertedData);
    } else {
      setProfile(data);
    }
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
  }, [fetchProfile]);

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

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app/home`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) {
        // Check if the error implies the user is already registered
        if (
          authError.message.toLowerCase().includes("already") ||
          authError.status === 409
        ) {
          throw new Error("User already exists, please sign in");
        }
        throw authError;
      }
      if (!authData.user) throw new Error("No user returned from sign up");
      
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: authData.user.id, username });
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

  const updateLikedDecks = async (deckId: string, isLiking: boolean) => {
    if (!user) throw new Error("Not authenticated");

    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("likeddeckids")
      .eq("id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const currentLikedDecks = currentProfile?.likeddeckids || [];
    const newLikedDecks = isLiking
      ? [...currentLikedDecks, deckId]
      : currentLikedDecks.filter((id) => id !== deckId);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ likeddeckids: newLikedDecks })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Refresh the profile
    await fetchProfile(user.id);
  };

  const updateFollowedCreators = async (
    creatorId: string,
    isFollowing: boolean,
  ) => {
    if (!user) throw new Error("Not authenticated");

    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("followedcreators")
      .eq("id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const currentFollowed = currentProfile?.followedcreators || [];
    const newFollowed = isFollowing
      ? [...currentFollowed, creatorId]
      : currentFollowed.filter((id) => id !== creatorId);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ followedcreators: newFollowed })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Refresh the profile
    await fetchProfile(user.id);
  };

  const updatePurchasedDecks = async (deckId: string) => {
    if (!user) throw new Error("Not authenticated");

    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("purchaseddeckids")
      .eq("id", user.id)
      .single();

    if (fetchError) throw fetchError;

    const currentPurchased = currentProfile?.purchaseddeckids || [];
    const newPurchased = [...currentPurchased, deckId];

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ purchaseddeckids: newPurchased })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Refresh the profile
    await fetchProfile(user.id);
  };

  const value = {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    signInWithGoogle,
    updateLikedDecks,
    updateFollowedCreators,
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
