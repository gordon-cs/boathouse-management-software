import { supabase } from "@lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@db-types/supabase";

export type Repair = Tables<"repair">;

export async function getRepairs(): Promise<Repair[]> {
  const { data, error } = await supabase.from("repair").select();

  if (error) {
    throw error;
  }

  return data;
}

export async function createRepair(repair: TablesInsert<"repair">): Promise<Repair> {
  const { data, error } = await supabase
    .from("repair")
    .insert(repair)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRepair({
  repairId,
  updates,
}: {
  repairId: number;
  updates: TablesUpdate<"repair">;
}): Promise<Repair> {
  const { data, error } = await supabase
    .from("repair")
    .update(updates)
    .eq("repair_id", repairId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

