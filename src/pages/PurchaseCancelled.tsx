import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const PurchaseCancelled = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">Purchase Cancelled</h1>
        <p className="text-gray-600">
          Your purchase was cancelled and you have not been charged. If you have
          any questions, please contact our support team.
        </p>
        <div className="pt-4 space-x-4">
          <Button
            asChild
            className="bg-[#2B4C7E] text-white hover:bg-[#1A365D]"
          >
            <Link to="/app/home">Return Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseCancelled;
