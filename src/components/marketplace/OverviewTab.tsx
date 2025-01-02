// OverviewTab.tsx

import React from "react";
import type { DeckWithProfile } from "@/types/marketplace";

interface OverviewTabProps {
  deck: DeckWithProfile;
  purchaseDate?: string;
}

export function OverviewTab({ deck, purchaseDate }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-sm text-gray-600">{deck.description}</p>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Details</h4>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>Difficulty: {deck.difficulty}</li>
          <li>Total Cards: {deck.cardcount}</li>
          {/* Display purchase date if provided */}
          {purchaseDate && (
            <li>Purchased on: {new Date(purchaseDate).toLocaleDateString()}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
