import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStripeConnect } from "@/lib/hooks/useStripeConnect";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { withdrawFunds } from "@/lib/api/seller";

export function SellerDashboard() {
  const { setupSellerAccount, isLoading } = useStripeConnect();
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data: seller } = await supabase
          .from("sellers")
          .select("*")
          .eq("id", user?.id)
          .single();

        setAccountStatus(
          seller || { stripe_connect_status: "pending", total_earnings: 0 }
        );
      } catch (error) {
        console.error("Error loading seller status:", error);
        setAccountStatus({
          stripe_connect_status: "pending",
          total_earnings: 0,
        });
      }
    };

    if (user) {
      loadStatus();
    }
  }, [user]);

  if (!accountStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  const isPending =
    !accountStatus.stripe_connect_id ||
    accountStatus.stripe_connect_status === "pending";

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2B4C7E]">
              Seller Account Status
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isPending
                ? "Complete your account setup to start receiving payments"
                : "Your account is ready to receive payments"}
            </p>
          </div>
          {isPending && (
            <Button
              onClick={setupSellerAccount}
              disabled={isLoading}
              className="bg-[#2B4C7E]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Complete Setup
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2B4C7E]">
              Available for Withdrawal
            </h2>
            <p className="text-2xl font-bold text-[#2B4C7E]">
              ${accountStatus.total_earnings.toFixed(2)}
            </p>
          </div>

          {!isPending && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full bg-[#2B4C7E]">Withdraw Funds</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Withdraw Funds</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the amount you want to withdraw. This will be
                    transferred to your connected bank account.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-6"
                      placeholder="Enter amount"
                      min="0"
                      max={accountStatus.total_earnings}
                      step="0.01"
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const amount = parseFloat(withdrawAmount);
                      if (
                        amount > 0 &&
                        amount <= accountStatus.total_earnings
                      ) {
                        withdrawFunds(amount);
                      }
                    }}
                    disabled={
                      isLoading ||
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > accountStatus.total_earnings
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Withdraw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {isPending && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Complete your account setup to withdraw funds
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
