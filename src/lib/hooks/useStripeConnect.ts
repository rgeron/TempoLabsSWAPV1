import { useAuth } from "@/lib/auth";
import { useState } from "react";

import { requestPayout } from "../api/balance";
import {
  getAccountStatus,
  getOnboardingLink,
} from "../api/profile";

import { useToast } from "@/components/ui/use-toast";

export function useStripeConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const setupSellerAccount = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get onboarding link
      const url = await getOnboardingLink(user.id);

      // Redirect to onboarding
      window.location.href = url;
    } catch (error) {
      console.error("Error setting up seller account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to set up seller account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccountStatus = async () => {
    if (!user) return null;

    try {
      return await getAccountStatus(user.id);
    } catch (error) {
      console.error("Error checking account status:", error);
      return null;
    }
  };

  const withdrawFunds = async (amount: number) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const status = await checkAccountStatus();

      if (status?.stripe_connect_status !== "active") {
        throw new Error(
          "Please complete account setup before withdrawing funds"
        );
      }

      await requestPayout(user.id, amount);

      toast({
        title: "Success",
        description: "Withdrawal request processed successfully",
      });
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setupSellerAccount,
    checkAccountStatus,
    withdrawFunds,
    isLoading,
  };
}
