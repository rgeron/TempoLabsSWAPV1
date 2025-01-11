import { supabase } from "../supabase";

// Fetch user balance
export const getUserBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user balance:", error);
    throw error;
  }

  return data.balance;
};

// Update user balance (used for recharges or admin adjustments)
export const updateUserBalance = async (
  userId: string,
  newBalance: number
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};
