import { useBoats } from "@features/boats/hooks/useBoats";
import { useUsers } from "@features/users/hooks/useUsers";

import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";

function CheckoutCatalog() {
  const boats = useBoats();

  const users = useUsers();

  const checkouts = useCheckouts();

  const additionalRowers = useAdditionalRowers();

  const isPending =
    boats.isPending ||
    users.isPending ||
    checkouts.isPending ||
    additionalRowers.isPending;

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading boathouse data...
      </p>
    );
  }

  const error =
    boats.error ?? users.error ?? checkouts.error ?? additionalRowers.error;

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load boathouse data: {error.message}
      </p>
    );
  }

  const boatsList = boats.data;
  const usersList = users.data;
  const checkoutsList = checkouts.data;
  const additionalRowersList = additionalRowers.data;

  if (!checkoutsList?.length) {
    return <p className="text-sm text-muted-foreground">No checkouts found.</p>;
  }

  return (
    <ul className="space-y-3">
      {checkoutsList.map((checkout) => (
        <li
          className="rounded-lg border bg-background p-4"
          key={checkout.check_out_id}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 text-base font-medium text-foreground">
              Checkout #{checkout.check_out_id}
            </h2>
            <span className="text-sm text-muted-foreground">
              {checkout.date}
            </span>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Boat</dt>
              <dd className="font-medium">
                {boatsList?.find((boat) => boat.boat_id === checkout.boat_id)
                  ?.name ?? `Boat #${checkout.boat_id}`}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Time out</dt>
              <dd className="font-medium">{checkout.time_out ?? "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Time in</dt>
              <dd className="font-medium">{checkout.time_in ?? "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rowers</dt>
              <dd className="font-medium">
                {[
                  usersList?.find((user) => user.user_id === checkout.user_id)
                    ?.user_name ?? `User #${checkout.user_id}`,
                  ...(additionalRowersList ?? [])
                    .filter(
                      (rower) => rower.check_out_id === checkout.check_out_id
                    )
                    .map(
                      (rower) =>
                        usersList?.find(
                          (user) => user.user_id === rower.user_id
                        )?.user_name ?? `User #${rower.user_id}`
                    ),
                ].join(", ")}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export default CheckoutCatalog;
