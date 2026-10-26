import { supabase } from "@lib/supabaseClient";
import type { Tables } from "@db-types/supabase";

export type Boat = Tables<"boat">;

export async function getBoats(): Promise<Boat[]> {
  const { data, error } = await supabase.from("boat").select();

  if (error) {
    throw error;
  }

  return data;
}
