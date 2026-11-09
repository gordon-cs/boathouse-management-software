import { supabase } from "@lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@db-types/supabase";

export type User = Tables<"user">;

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("user")
    .select()
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("user").select();

  if (error) {
    throw error;
  }

  return data;
}

export async function createUser(user: TablesInsert<"user">): Promise<User> {
  const { data, error } = await supabase.from("user").insert(user).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUser({
  userId,
  updates,
}: {
  userId: string;
  updates: TablesUpdate<"user">;
}): Promise<User> {
  const { data, error } = await supabase
    .from("user")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deactivateUser(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("user")
    .update({ is_active: false })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
