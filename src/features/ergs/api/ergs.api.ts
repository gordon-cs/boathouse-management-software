import { supabase } from "@lib/supabaseClient";
import type { Tables } from "@db-types/supabase";

export type Erg = Tables<"ergs">;

export async function getErgs(): Promise<Erg[]> {
  const { data, error } = await supabase.from("ergs").select();

  if (error) {
    throw error;
  }

  return data;
}
