import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

const PurchaseSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Optional: Verify the purchase was recorded
    const verifyPurchase = async () => {
      try {
        // You could add an endpoint to verify the purchase if needed
        // await fetch(`/api/verify-purchase?session_id=${sessionId}`);
        setIsVerifying(false);
      } catch (error) {
        console.error("Error verifying purchase:", error);
        setIsVerifying(false);
      }
    };

    if (sessionId) {
      verifyPurchase();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {isVerifying ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#2B4C7E]" />
            <p className="text-lg text-gray-600">Verifying your purchase...</p>
          </div>
        ) : (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">
              Purchase Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your TEST flashcard deck is now available
              in your library.
            </p>
            <div className="pt-4 space-x-4">
              <Button
                asChild
                className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
              >
                <Link to="/app/purchased-decks">View My Decks</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/app/home">Return Home</Link>
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PurchaseSuccess;
