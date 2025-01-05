import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Image } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate 30 different avatar options
const avatarOptions = Array.from(
  { length: 30 },
  (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
);

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile, user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    profile?.avatar_url || null,
  );

  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const newUsername = formData.get("username") as string;

      if (!user) throw new Error("Not authenticated");
      if (!newUsername) throw new Error("Username is required");

      await updateProfile({
        username: newUsername,
        avatar_url: selectedAvatar || profile?.avatar_url,
      });

      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });

      onClose();
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while updating settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const AvatarDialog = () => (
    <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose an Avatar</DialogTitle>
          <DialogDescription>
            Select a new avatar from our collection.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-4 gap-4">
            {avatarOptions.map((avatarUrl, index) => (
              <button
                key={index}
                type="button"
                className={`relative rounded-lg overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-[#2B4C7E] transition-all ${selectedAvatar === avatarUrl ? "ring-2 ring-[#2B4C7E] ring-offset-2" : ""}`}
                onClick={() => {
                  setSelectedAvatar(avatarUrl);
                  setShowAvatarDialog(false);
                }}
              >
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                </Avatar>
                {selectedAvatar === avatarUrl && (
                  <div className="absolute inset-0 bg-[#2B4C7E]/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences.
            </DialogDescription>
          </DialogHeader>

          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={selectedAvatar || profile?.avatar_url || undefined}
              />
              <AvatarFallback>
                {profile?.username?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAvatarDialog(true)}
              className="flex items-center space-x-2"
            >
              <Image className="h-4 w-4" />
              <span>Change Avatar</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={profile?.username || ""}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                />
                <p className="text-sm text-gray-500">
                  Username must be between 3 and 20 characters and can only
                  contain letters, numbers, underscores, and hyphens.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AvatarDialog />
    </>
  );
}
