import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoats } from "@features/boats/hooks/useBoats";
import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";
import { useUsers } from "@features/users/hooks/useUsers";
import BoatCheckoutCard, { type BoatCheckoutRower } from "./BoatCheckoutCard";

export default function CheckoutCatalog() {
  const boats = useBoats();
  const users = useUsers();
  const checkouts = useCheckouts();
  const additionalRowers = useAdditionalRowers();
  const isPending =
    boats.isPending ||
    users.isPending ||
    checkouts.isPending ||
    additionalRowers.isPending;
  const error =
    boats.error ?? users.error ?? checkouts.error ?? additionalRowers.error;

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading current checkouts...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load current checkouts: {error.message}
      </p>
    );
  }

  const boatById = new Map((boats.data ?? []).map((boat) => [boat.boat_id, boat]));
  const userNameById = new Map(
    (users.data ?? []).map((user) => [user.user_id, user.user_name])
  );
  const rowersByCheckout = new Map<number, BoatCheckoutRower[]>();

  for (const checkout of checkouts.data ?? []) {
    if (checkout.time_in !== null) continue;

    rowersByCheckout.set(checkout.check_out_id, [
      {
        id: checkout.user_id,
        name: userNameById.get(checkout.user_id) ?? `User #${checkout.user_id}`,
      },
    ]);
  }

  for (const additionalRower of additionalRowers.data ?? []) {
    const rowers = rowersByCheckout.get(additionalRower.check_out_id);
    if (!rowers) continue;

    rowers.push({
      id: additionalRower.additional_rower_id,
      name:
        userNameById.get(additionalRower.additional_rower_id) ??
        `User #${additionalRower.additional_rower_id}`,
    });
  }

  const activeCheckouts = (checkouts.data ?? [])
    .filter((checkout) => checkout.time_in === null)
    .sort((a, b) => (b.time_out ?? "").localeCompare(a.time_out ?? ""));

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Active checkouts
        </h1>
        <p className="text-sm text-muted-foreground">
          View boats currently checked out and their rowers.
        </p>
      </header>

      <section
        aria-label="Currently checked-out boats"
        className="max-h-[min(68svh,56rem)] min-h-64 space-y-4 overflow-y-auto pr-2"
      >
        {activeCheckouts.length ? (
          activeCheckouts.map((checkout) => (
            <BoatCheckoutCard
              key={checkout.check_out_id}
              boat={boatById.get(checkout.boat_id)}
              boatId={checkout.boat_id}
              rowers={rowersByCheckout.get(checkout.check_out_id) ?? []}
            />
          ))
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
            <div className="space-y-2">
              <h2 className="font-medium">No boats are checked out</h2>
              <p className="text-sm text-muted-foreground">
                New checkouts will appear here.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-end border-t pt-5">
        <Button asChild>
          <Link to="/checkouts">
            <Plus className="mr-2 h-4 w-4" />
            Create new checkout
          </Link>
        </Button>
      </div>
    </div>
  );
}
