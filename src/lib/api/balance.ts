import { supabase } from "../supabase";

export const getUserBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data?.balance || 0;
};

export const updateUserBalance = async (
  userId: string,
  newBalance: number,
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", userId);

  if (error) throw error;
};

export const transferBalance = async (
  buyerId: string,
  sellerId: string,
  amount: number,
): Promise<void> => {
  try {
    // Get both profiles in a single query for efficiency
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, balance")
      .in("id", [buyerId, sellerId]);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length !== 2) {
      throw new Error("Could not find both buyer and seller profiles");
    }

    // Find buyer and seller profiles
    const buyerProfile = profiles.find((p) => p.id === buyerId);
    const sellerProfile = profiles.find((p) => p.id === sellerId);

    if (!buyerProfile || !sellerProfile) {
      throw new Error("Could not find both buyer and seller profiles");
    }

    // Check buyer's balance
    const buyerBalance = buyerProfile.balance || 0;
    if (buyerBalance < amount) {
      throw new Error(
        `Insufficient balance. Need $${amount - buyerBalance} more.`,
      );
    }

    // Calculate new balances
    const newBuyerBalance = buyerBalance - amount;
    const newSellerBalance = (sellerProfile.balance || 0) + amount;

    // Update buyer's balance
    const { error: buyerError } = await supabase
      .from("profiles")
      .update({ balance: newBuyerBalance })
      .eq("id", buyerId);

    if (buyerError) throw buyerError;

    // Update seller's balance
    const { error: sellerError } = await supabase
      .from("profiles")
      .update({ balance: newSellerBalance })
      .eq("id", sellerId);

    if (sellerError) {
      // If seller update fails, revert buyer's balance
      await supabase
        .from("profiles")
        .update({ balance: buyerBalance })
        .eq("id", buyerId);
      throw sellerError;
    }
  } catch (error) {
    console.error("Error in transferBalance:", error);
    throw error;
  }
};
