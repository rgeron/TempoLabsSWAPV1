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

// Add a new function to transfer balance between users
export const transferBalance = async (
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<void> => {
  const { error: debitError } = await supabase
    .from("profiles")
    .update({ balance: supabase.sql`balance - ${amount}` })
    .eq("id", fromUserId);

  if (debitError) throw debitError;

  const { error: creditError } = await supabase
    .from("profiles")
    .update({ balance: supabase.sql`balance + ${amount}` })
    .eq("id", toUserId);

  if (creditError) throw creditError;
};

// Request a payout (withdrawal)
export const requestPayout = async (userId: string, amount: number) => {
  try {
    // Get Connect account ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("stripe_connect_id, stripe_connect_status, balance")
      .eq("id", userId)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error("User not found");

    if (userData.stripe_connect_status !== "active") {
      throw new Error("Account not fully onboarded");
    }

    if ((userData.balance || 0) < amount) {
      throw new Error("Insufficient balance");
    }

    const response = await fetch(`${STRIPE_API_URL}/create-payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        accountId: userData.stripe_connect_id,
      }),
    });

    if (!response.ok) throw new Error("Failed to create payout");
    const result = await response.json();

    // Update user's balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        balance: supabase.sql`balance - ${amount}`,
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return result;
  } catch (error) {
    console.error("Error requesting payout:", error);
    throw error;
  }
};
