
import { supabase } from "@/lib/supabaseClient";
import { getUserDisplayName } from "@features/users/api/users.api";

type AdditionalRower = {
  check_out_id: number;
  additional_rower_id: string;
};

type CheckoutRower = {
  id: string;
  name: string;
};

export async function getActiveBoatCheckouts() {
  // 1. Retrieve boats, active checkouts, and users
  const [boatsResult, checkoutsResult, usersResult] = await Promise.all([
    supabase.from("boat").select("*"),

    supabase
      .from("check_out")
      .select("*")
      .is("time_in", null)
      .order("time_out", { ascending: false }),

    supabase.from("user").select("*"),
  ]);

  if (boatsResult.error) throw boatsResult.error;
  if (checkoutsResult.error) throw checkoutsResult.error;
  if (usersResult.error) throw usersResult.error;

  const boats = boatsResult.data ?? [];
  const checkouts = checkoutsResult.data ?? [];
  const users = usersResult.data ?? [];

  // 2. Match active checkouts to boats
  const boatById = new Map(
    boats.map((boat) => [boat.boat_id, boat])
  );

  const activeBoatCheckouts = checkouts.filter((checkout) =>
    boatById.has(checkout.object_id)
  );

  // 3. Retrieve additional rowers for active checkouts
  const checkoutIds = activeBoatCheckouts.map(
    (checkout) => checkout.check_out_id
  );

  let additionalRowers: AdditionalRower[] = [];

  if (checkoutIds.length > 0) {
    const { data, error } = await supabase
      .from("additional_rower")
      .select("check_out_id, additional_rower_id")
      .in("check_out_id", checkoutIds);

    if (error) throw error;

    additionalRowers = data ?? [];
  }

  // 4. Create a map of user IDs to names
  const userNameById = new Map(
    users.map((user) => [user.user_id, getUserDisplayName(user)])
  );

  // 5. Group additional rowers by checkout
  const rowersByCheckout = new Map<number, CheckoutRower[]>();

  for (const rower of additionalRowers) {
    const rowers = rowersByCheckout.get(rower.check_out_id) ?? [];

    rowers.push({
      id: rower.additional_rower_id,
      name:
        userNameById.get(rower.additional_rower_id) ??
        `User #${rower.additional_rower_id}`,
    });

    rowersByCheckout.set(rower.check_out_id, rowers);
  }

  // 6. Return organized checkout data
  return activeBoatCheckouts.map((checkout) => {
    const boat = boatById.get(checkout.object_id);

    const mainRower: CheckoutRower = {
      id: checkout.user_id,
      name:
        userNameById.get(checkout.user_id) ??
        `User #${checkout.user_id}`,
    };

    return {
      ...checkout,
      boat,
      boatId: checkout.object_id,
      rowers: [
        mainRower,
        ...(rowersByCheckout.get(checkout.check_out_id) ?? []),
      ],
    };
  });
}