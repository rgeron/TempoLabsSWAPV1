import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
}

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        setCreator(creatorData);
      } catch (error) {
        console.error("Error fetching creator data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorData();
  }, [creatorId]);

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
      <div className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-sm">
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
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
