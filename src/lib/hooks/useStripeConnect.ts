import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { STRIPE_API_URL } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useStripeConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const setupSellerAccount = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // First create seller record
      const { error: sellerError } = await supabase
        .from("sellers")
        .insert([{ id: user.id }]);

      if (sellerError && sellerError.code !== "23505") {
        // Ignore if already exists
        throw sellerError;
      }

      // Create Connect account
      const response = await fetch(`${STRIPE_API_URL}/create-connect-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Connect account");
      }

      const { accountId } = await response.json();

      // Update seller record with Stripe account ID and set status to pending;
      // status will be updated dynamically via your callback/webhook.
      const { error: updateError } = await supabase
        .from("sellers")
        .update({
          stripe_connect_id: accountId,
          stripe_connect_status: "pending",
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Get onboarding link
      const onboardingResponse = await fetch(
        `${STRIPE_API_URL}/create-onboarding-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId }),
        }
      );

      if (!onboardingResponse.ok) {
        throw new Error("Failed to create onboarding link");
      }

      const { url } = await onboardingResponse.json();

      // Redirect to onboarding
      window.location.href = url;
    } catch (error) {
      console.error("Error setting up seller account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to set up seller account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupSellerAccount,
    isLoading,
  };
}
