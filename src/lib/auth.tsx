import type { User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { createPendingStripeAccount } from "./api/profile";
import { db, auth } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

type Profile = {
  id: string;
  username: string;
  email: string;
  country?: string;
  education_level_id?: number;
  likeddeckids?: string[];
  followedcreators?: string[];
  purchaseddeckids?: string[];
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateLikedDecks: (deckId: string, isLiking: boolean) => Promise<void>;
  updateFollowedCreators: (
    creatorId: string,
    isFollowing: boolean
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
    if (!userId) return;

    const profileDoc = await getDoc(doc(db, "profiles", userId));
    if (profileDoc.exists()) {
      setProfile(profileDoc.data() as Profile);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchProfile(user.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/app/home");
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    navigate("/");
  };

  const signUp = async (email: string, password: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profileData: Profile = {
      id: user.uid,
      username,
      email,
    };

    await setDoc(doc(db, "profiles", user.uid), profileData);
    await createPendingStripeAccount(email);

    setUser(user);
    setProfile(profileData);
    navigate("/app/home");
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    navigate("/app/home");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("Not authenticated");

    await updateDoc(doc(db, "profiles", user.uid), updates);
    await fetchProfile(user.uid);
  };

  const updateLikedDecks = async (deckId: string, isLiking: boolean) => {
    if (!user) throw new Error("Not authenticated");

    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    const currentProfile = profileDoc.data() as Profile;
    const currentLikedDecks = currentProfile.likeddeckids || [];
    const newLikedDecks = isLiking
      ? [...currentLikedDecks, deckId]
      : currentLikedDecks.filter((id) => id !== deckId);

    await updateDoc(doc(db, "profiles", user.uid), { likeddeckids: newLikedDecks });
    await fetchProfile(user.uid);
  };

  const updateFollowedCreators = async (
    creatorId: string,
    isFollowing: boolean
  ) => {
    if (!user) throw new Error("Not authenticated");

    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    const currentProfile = profileDoc.data() as Profile;
    const currentFollowed = currentProfile.followedcreators || [];
    const newFollowed = isFollowing
      ? [...currentFollowed, creatorId]
      : currentFollowed.filter((id) => id !== creatorId);

    await updateDoc(doc(db, "profiles", user.uid), { followedcreators: newFollowed });
    await fetchProfile(user.uid);
  };

  const updatePurchasedDecks = async (deckId: string) => {
    if (!user) throw new Error("Not authenticated");

    const profileDoc = await getDoc(doc(db, "profiles", user.uid));
    const currentProfile = profileDoc.data() as Profile;
    const currentPurchased = currentProfile.purchaseddeckids || [];
    const newPurchased = [...currentPurchased, deckId];

    await updateDoc(doc(db, "profiles", user.uid), { purchaseddeckids: newPurchased });
    await fetchProfile(user.uid);
  };

  const value = {
    user,
    profile,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
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
