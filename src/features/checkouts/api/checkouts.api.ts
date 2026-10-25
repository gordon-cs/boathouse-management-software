import { supabase } from "@lib/supabaseClient";
import type { Tables } from "@db-types/supabase";

export type Checkout = Tables<"check_out">;
export type AdditionalRower = Tables<"additional_rower">;

export async function getCheckouts(): Promise<Checkout[]> {
  const { data, error } = await supabase.from("check_out").select();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAdditionalRowers(): Promise<AdditionalRower[]> {
  const { data, error } = await supabase.from("additional_rower").select();

  if (error) {
    throw error;
  }

  return data;
}
