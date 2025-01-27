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
