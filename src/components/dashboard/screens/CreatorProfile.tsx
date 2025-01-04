import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Creator, DeckWithProfile } from "@/types/marketplace";
import DeckCard from "@/components/marketplace/DeckCard";
import { useToast } from "@/components/ui/use-toast";

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [decks, setDecks] = useState<DeckWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, profile, updateFollowedCreators } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!creatorId) return;

      try {
        setIsLoading(true);

        // Fetch creator profile
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", creatorId)
          .single();

        if (creatorError) throw creatorError;

        // Fetch creator's decks
        const { data: decksData, error: decksError } = await supabase
          .from("decks")
          .select(
            `
            *,
            profiles!decks_creatorid_fkey (username, avatar_url)
          `,
          )
          .eq("creatorid", creatorId)
          .order("created_at", { ascending: false });

        if (decksError) throw decksError;

        // Check if the creator is followed
        const isFollowed =
          profile?.followedcreators?.includes(creatorId) ?? false;

        // Transform the data
        const creatorInfo: Creator = {
          id: creatorData.id,
          username: creatorData.username,
          avatar_url: creatorData.avatar_url,
          bio: creatorData.bio,
          followersCount: creatorData.followers?.length ?? 0,
          decksCount: decksData.length,
          isFollowed,
        };

        const processedDecks = decksData.map((deck) => ({
          ...deck,
          creatorName: deck.profiles?.username || "Unknown Creator",
          creatorAvatar: deck.profiles?.avatar_url,
          profiles: deck.profiles,
        }));

        setCreator(creatorInfo);
        setDecks(processedDecks);
        setIsFollowing(isFollowed);
      } catch (error) {
        console.error("Error fetching creator data:", error);
        toast({
          title: "Error",
          description: "Failed to load creator information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorData();
  }, [creatorId, profile, toast]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow creators",
        variant: "destructive",
      });
      return;
    }

    if (!creatorId) return;

    try {
      setIsUpdating(true);
      await updateFollowedCreators(creatorId, !isFollowing);
      setIsFollowing(!isFollowing);

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing
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
          <div>
            <h1 className="text-3xl font-bold text-[#2B4C7E]">
              {creator.username}
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {creator.followersCount} followers
              </span>
              <span>•</span>
              <span>{creator.decksCount} decks</span>
            </div>
            {creator.bio && (
              <p className="mt-4 text-gray-600 max-w-2xl">{creator.bio}</p>
            )}
          </div>
        </div>
        {user?.id !== creator.id && (
          <Button
            onClick={handleFollowToggle}
            disabled={isUpdating}
            variant={isFollowing ? "outline" : "default"}
            className={
              isFollowing ? "" : "bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
            }
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {decks.map((deck) => (
            <DeckCard key={deck.id} {...deck} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
