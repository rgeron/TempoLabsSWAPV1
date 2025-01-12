import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  const handleRecharge = async () => {
    if (!user || !selectedAmount) {
      toast({
        title: "Error",
        description: "Please select an amount to recharge",
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
          deckTitle: `Balance recharge ($${selectedAmount})`,
          price: selectedAmount,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recharge Balance</DialogTitle>
          <DialogDescription>
            Select an amount to add to your balance
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {RECHARGE_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "outline"}
              className={selectedAmount === amount ? "bg-[#2B4C7E]" : ""}
              onClick={() => setSelectedAmount(amount)}
            >
              ${amount}
            </Button>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRecharge}
            disabled={!selectedAmount || isLoading}
            className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Recharge $${selectedAmount || 0}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
