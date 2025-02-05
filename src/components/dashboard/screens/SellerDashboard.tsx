import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useStripeConnect } from "@/lib/hooks/useStripeConnect";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function SellerDashboard() {
  const { setupSellerAccount, completeSellerSetup, verifyAccountStatus, isLoading } = useStripeConnect();
  const [user, setUser] = useState<any>(null);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [stripeInfo, setStripeInfo] = useState<any>(null);

  // On mount: load user and verify account status.
  useEffect(() => {
    const fetchUserAndVerify = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
        const dataStatus = await verifyAccountStatus();
        if (dataStatus) {
          setStripeInfo(dataStatus);
          setAccountStatus({
            stripe_connect_status: dataStatus.status
          });
        }
      }
    };
    fetchUserAndVerify();
  }, []);

  if (!accountStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2B4C7E]">Seller Account Status</h2>
            <p className="text-sm text-gray-500 mt-1">
              Status: {stripeInfo?.status || accountStatus.stripe_connect_status}
            </p>
          </div>
          {!stripeInfo ? (
            <Button onClick={() => setupSellerAccount()} disabled={isLoading} className="bg-[#2B4C7E]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Start Setup
            </Button>
          ) : stripeInfo.status === "Completed" ? (
            <span className="text-green-600 font-semibold">Setup is complete.</span>
          ) : (
            <Button onClick={() => completeSellerSetup()} disabled={isLoading} className="bg-[#2B4C7E]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Complete Setup
            </Button>
          )}
        </div>
      </Card>

      {stripeInfo && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-[#2B4C7E] mb-4">Stripe Account Details</h3>
          <p>Status: {stripeInfo.status}</p>
          <p>
            Onboarding Information Needed:{" "}
            {stripeInfo.onboarding_information_needed?.length
              ? stripeInfo.onboarding_information_needed.join(", ")
              : "None"}
          </p>
          <p>
            Onboarding Information Eventually Needed:{" "}
            {stripeInfo.onboarding_information_eventually_needed?.length
              ? stripeInfo.onboarding_information_eventually_needed.join(", ")
              : "None"}
          </p>
          <p>Capabilities: {JSON.stringify(stripeInfo.capabilities)}</p>
        </Card>
      )}
    </div>
  );
}
