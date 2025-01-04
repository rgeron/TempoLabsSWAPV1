import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/marketplace/DeckCard";
import type { DeckWithProfile } from "@/types/marketplace";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
}

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const { user, profile, updateFollowedCreators } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState<Creator | null>(null);

  const isFollowed = profile?.followedcreators?.includes(creatorId);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!creatorId) return;

      try {
        setIsLoading(true);

        // Fetch creator profile
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", creatorId)
          .single();

        if (creatorError) throw creatorError;

        // Fetch creator's decks
        const { data: decksData, error: decksError } = await supabase
          .from("decks")
          .select("*")
          .eq("creatorid", creatorId)
          .order("created_at", { ascending: false });

        if (decksError) throw decksError;

        // Transform decks data to include creator info
        const decksWithCreator = decksData.map((deck) => ({
          ...deck,
          creatorName: creatorData.username,
          creatorAvatar: creatorData.avatar_url,
          profiles: {
            username: creatorData.username,
            avatar_url: creatorData.avatar_url,
          },
        }));

        setCreator(creatorData);
        setDecks(decksWithCreator);
      } catch (error) {
        console.error("Error fetching creator data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorData();
  }, [creatorId]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow creators",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      await updateFollowedCreators(creatorId, !isFollowed);

      toast({
        title: isFollowed ? "Unfollowed" : "Following",
        description: isFollowed
          ? `You are no longer following ${creator?.username}`
          : `You are now following ${creator?.username}`,
      });
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <p className="text-lg text-gray-500">Creator not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Creator Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={creator.avatar_url || undefined} />
            <AvatarFallback>
              {creator.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#2B4C7E]">
              {creator.username}
            </h1>
            <p className="text-gray-500">{decks.length} decks created</p>
          </div>
        </div>
        {user?.id !== creator.id && (
          <Button
            onClick={handleFollowToggle}
            disabled={isUpdating}
            variant={isFollowed ? "outline" : "default"}
            className={
              isFollowed ? "" : "bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
            }
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowed ? (
              "Unfollow"
            ) : (
              "Follow"
            )}
          </Button>
        )}
      </div>

      {/* Decks Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[#2B4C7E]">Created Decks</h2>
        {decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCard key={deck.id} {...deck} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-2 bg-white rounded-lg">
            <p className="text-lg text-gray-500">No decks created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorProfile;
