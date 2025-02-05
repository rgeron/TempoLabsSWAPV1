import { useToast } from "@/components/ui/use-toast";
import { postStripeRequest } from "@/lib/api/stripeUtils";
import { useAuth } from "@/lib/auth";
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

      // Create Connect account using the common helper
      const { accountId } = await postStripeRequest<{ accountId: string }>(
        "create-connect-account",
        { userId: user.id }
      );

      // Update seller record with Stripe account ID and set status to pending
      const { error: updateError } = await supabase
        .from("sellers")
        .update({
          stripe_connect_id: accountId,
          stripe_connect_status: "pending",
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Get onboarding link using the common helper
      const { url } = await postStripeRequest<{ url: string }>(
        "create-onboarding-link",
        { accountId }
      );

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

  // New: completeSellerSetup: reinitiates onboarding using existing account id
  const completeSellerSetup = async (accountId: string) => {
    try {
      setIsLoading(true);
      const { url } = await postStripeRequest<{ url: string }>(
        "create-onboarding-link",
        { accountId }
      );
      window.location.href = url;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete account setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New: verifyAccountStatus verifies the Stripe account status from the server.
  const verifyAccountStatus = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { status, account } = await postStripeRequest<{ status: string; account: any }>(
        "verify-stripe-account",
        { userId: user.id }
      );
      // Optionally, you can update any local state or perform further actions based on the new status.
      return { status, account };
    } catch (error) {
      console.error("Error verifying account status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to verify account status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupSellerAccount,
    completeSellerSetup,
    verifyAccountStatus, // new function exposed for use
    isLoading,
  };
}
