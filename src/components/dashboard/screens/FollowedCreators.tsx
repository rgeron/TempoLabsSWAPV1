import { CreatorDialog } from "@/components/marketplace/dialog/CreatorDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Creator } from "@/types/marketplace";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const FollowedCreators = () => {
  const { profile } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreators = async () => {
      if (!profile?.followedcreators?.length) {
        setCreators([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .in("id", profile.followedcreators);

        if (error) throw error;

        const processedCreators = data.map((creator) => ({
          id: creator.id,
          username: creator.username,
          avatar_url: creator.avatar_url,
          bio: creator.bio,
          followersCount: creator.followers?.length ?? 0,
          decksCount: 0, // We'll fetch this separately if needed
          isFollowed: true,
        }));

        setCreators(processedCreators);
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#2B4C7E]">Followed Swapers</h1>

      {creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map((creator) => (
            <Button
              key={creator.id}
              variant="outline"
              className="p-4 h-auto flex items-center space-x-4 hover:bg-gray-50"
              onClick={() => setSelectedCreator(creator.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={creator.avatar_url || undefined} />
                <AvatarFallback>
                  {creator.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{creator.username}</h3>
                <p className="text-sm text-gray-500">
                  {creator.followersCount} followers
                </p>
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 space-y-2">
          <p className="text-lg text-gray-500">No followed creators yet</p>
          <p className="text-sm text-gray-400">
            Follow creators to see their content here
          </p>
        </div>
      )}

      {selectedCreator && (
        <CreatorDialog
          isOpen={true}
          onClose={() => setSelectedCreator(null)}
          creatorId={selectedCreator}
        />
      )}
    </div>
  );
};

export default FollowedCreators;
