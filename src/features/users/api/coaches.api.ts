import { supabase } from "@lib/supabaseClient";

export async function isCoach(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("coaches")
    .select("coach_id")
    .eq("coach_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
}
