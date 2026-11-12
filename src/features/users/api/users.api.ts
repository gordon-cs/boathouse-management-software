import { supabase } from "@lib/supabaseClient";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@db-types/supabase";

type UserRecord = Tables<"user">;
export type User = UserRecord & { is_coach: boolean };

export function getUserDisplayName(user: UserRecord): string {
  const firstName = user.preferred_name?.trim() || user.user_first_name;
  const fullName = [firstName, user.user_last_name].filter(Boolean).join(" ");

  return fullName || `User #${user.user_id}`;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
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
  const [{ data: users, error: usersError }, { data: coaches, error: coachesError }] =
    await Promise.all([
      supabase.from("user").select(),
      supabase.from("coaches").select("coach_id"),
    ]);

  if (usersError) {
    throw usersError;
  }

  if (coachesError) {
    throw coachesError;
  }

  const coachIds = new Set(coaches.map(({ coach_id }) => coach_id));
  return users.map((user) => ({
    ...user,
    is_coach: coachIds.has(user.user_id),
  }));
}

export async function createUser(user: TablesInsert<"user">): Promise<UserRecord> {
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
}): Promise<UserRecord> {
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
