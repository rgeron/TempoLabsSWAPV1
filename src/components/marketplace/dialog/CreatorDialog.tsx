import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Creator, DeckWithProfile } from "@/types/marketplace";
import { Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import DeckCard from "../deck/DeckCard";

interface CreatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
}

export function CreatorDialog({
  isOpen,
  onClose,
  creatorId,
}: CreatorDialogProps) {
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
          `
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

    if (isOpen) {
      fetchCreatorData();
    }
  }, [creatorId, isOpen, profile, toast]);

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

  if (isLoading || !creator) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl min-h-[500px] max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl min-h-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={creator.avatar_url || undefined} />
                <AvatarFallback>
                  {creator.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {creator.username}
                </DialogTitle>
                <DialogDescription className="flex items-center space-x-4 mt-1">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {creator.followersCount} followers
                  </span>
                  <span>•</span>
                  <span>{creator.decksCount} decks</span>
                </DialogDescription>
              </div>
            </div>
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
          </div>
          {creator.bio && <p className="mt-4 text-gray-600">{creator.bio}</p>}
        </DialogHeader>

        <Tabs
          defaultValue="decks"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full grid grid-cols-1">
            <TabsTrigger value="decks">Decks</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="decks" className="mt-0 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <DeckCard key={deck.id} {...deck} />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
