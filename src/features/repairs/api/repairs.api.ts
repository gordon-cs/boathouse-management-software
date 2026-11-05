import { supabase } from "@lib/supabaseClient";
import type { Tables } from "@db-types/supabase";

export type Repair = Tables<"repair">;

export async function getRepairs(): Promise<Repair[]> {
  const { data, error } = await supabase.from("repair").select();

  if (error) {
    throw error;
  }

  return data;
}
