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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface RechargeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECHARGE_AMOUNTS = [10, 20, 50, 100, 200, 500];

export function RechargeDialog({ isOpen, onClose }: RechargeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const handleRecharge = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!user || !amount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount to recharge",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          deckTitle: `Balance recharge ($${amount}`,
          price: amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url; // Redirect to Stripe checkout
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating recharge session:", error);
      toast({
        title: "Error",
        description: "Failed to initiate recharge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmountChange = (value: string) => {
    // Clear selected preset amount
    setSelectedAmount(null);
    // Only allow numbers and one decimal point
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === "") {
      setCustomAmount(value);
    }
  };

  const handlePresetAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(""); // Clear custom amount
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recharge Balance</DialogTitle>
          <DialogDescription>
            Select an amount or enter a custom value to add to your balance
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {RECHARGE_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              className={selectedAmount === amount ? "bg-[#2B4C7E]" : ""}
              onClick={() => handlePresetAmountClick(amount)}
            >
              ${amount}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-500">Or enter a custom amount:</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              type="text"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="pl-6"
              placeholder="Enter amount"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRecharge}
            disabled={
              isLoading ||
              (!selectedAmount &&
                (!customAmount || parseFloat(customAmount) <= 0))
            }
            className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Recharge $${selectedAmount || customAmount || 0}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
