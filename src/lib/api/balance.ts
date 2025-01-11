import { supabase } from "../supabase";

export const getUserBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data.balance;
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
  fromUserId: string,
  toUserId: string,
  amount: number,
): Promise<void> => {
  // Use a database function to ensure atomic transaction
  const { error } = await supabase.rpc("transfer_balance", {
    from_user_id: fromUserId,
    to_user_id: toUserId,
    transfer_amount: amount,
  });

  if (error) throw error;
};
