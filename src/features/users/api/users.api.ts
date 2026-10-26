import { supabase } from "@lib/supabaseClient";
import type { Tables } from "@db-types/supabase";

export type User = Tables<"user">;

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("user").select();

  if (error) {
    throw error;
  }

  return data;
}
