import { supabase } from "@lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@db-types/supabase";

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

export async function createCheckout(
  checkout: TablesInsert<"check_out">,
): Promise<Checkout> {
  const { data, error } = await supabase
    .from("check_out")
    .insert(checkout)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCheckout({
  checkOutId,
  updates,
}: {
  checkOutId: number;
  updates: TablesUpdate<"check_out">;
}): Promise<Checkout> {
  const { data, error } = await supabase
    .from("check_out")
    .update(updates)
    .eq("check_out_id", checkOutId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createAdditionalRower(
  additionalRower: TablesInsert<"additional_rower">,
): Promise<AdditionalRower> {
  const { data, error } = await supabase
    .from("additional_rower")
    .insert(additionalRower)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAdditionalRower({
  checkOutId,
  additionalRowerId,
  updates,
}: {
  checkOutId: number;
  additionalRowerId: string;
  updates: TablesUpdate<"additional_rower">;
}): Promise<AdditionalRower> {
  const { data, error } = await supabase
    .from("additional_rower")
    .update(updates)
    .eq("check_out_id", checkOutId)
    .eq("additional_rower_id", additionalRowerId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteAdditionalRower({
  checkOutId,
  additionalRowerId,
}: {
  checkOutId: number;
  additionalRowerId: string;
}): Promise<void> {
  const { error } = await supabase
    .from("additional_rower")
    .delete()
    .eq("check_out_id", checkOutId)
    .eq("additional_rower_id", additionalRowerId);

  if (error) {
    throw error;
  }
}
