import { supabase } from "@lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@db-types/supabase";

export type Boat = Tables<"boat">;

export async function getBoats(): Promise<Boat[]> {
  const { data, error } = await supabase.from("boat").select();

  if (error) {
    throw error;
  }

  return data;
}

export async function createBoat(boat: TablesInsert<"boat">): Promise<Boat> {
  const { data, error } = await supabase.from("boat").insert(boat).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBoat({
  boatId,
  updates,
}: {
  boatId: number;
  updates: TablesUpdate<"boat">;
}): Promise<Boat> {
  const { data, error } = await supabase
    .from("boat")
    .update(updates)
    .eq("boat_id", boatId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function retireBoat(boatId: number): Promise<Boat> {
  const { data, error } = await supabase
    .from("boat")
    .update({ is_retired: true })
    .eq("boat_id", boatId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
