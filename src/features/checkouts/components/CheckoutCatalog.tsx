import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import { useBoats } from "@features/boats/hooks/useBoats";
import { useUsers } from "@features/users/hooks/useUsers";

import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";
import type {
  AdditionalRower,
  Checkout,
} from "@features/checkouts/api/checkouts.api";

function getBoatName(boatId: number, boatNames: Map<number, string>) {
  return boatNames.get(boatId) ?? `Boat #${boatId}`;
}

function getRowerNames(
  checkout: Checkout,
  rowersByCheckout: Map<number, AdditionalRower[]>,
  userNames: Map<string, string>
) {
  return [
    userNames.get(checkout.user_id) ?? `User #${checkout.user_id}`,
    ...(rowersByCheckout.get(checkout.check_out_id) ?? []).map(
      (rower) =>
        userNames.get(rower.additional_rower_id) ??
        `User #${rower.additional_rower_id}`
    ),
  ].join(", ");
}

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

  const boatNames = new Map(
    (boatsList ?? []).map((boat) => [
      boat.boat_id,
      boat.name ?? `Boat #${boat.boat_id}`,
    ])
  );
  const userNames = new Map(
    (usersList ?? []).map((user) => [user.user_id, user.user_name])
  );
  const rowersByCheckout = new Map<number, AdditionalRower[]>();

  for (const rower of additionalRowersList ?? []) {
    const checkoutRowers = rowersByCheckout.get(rower.check_out_id) ?? [];
    checkoutRowers.push(rower);
    rowersByCheckout.set(rower.check_out_id, checkoutRowers);
  }

  const columns: DataTableColumn<Checkout>[] = [
    {
      id: "checkout",
      header: "Checkout",
      getValue: (checkout) => checkout.check_out_id,
      getSearchValue: (checkout) => `Checkout #${checkout.check_out_id}`,
      render: (checkout) => `Checkout #${checkout.check_out_id}`,
    },
    {
      id: "date",
      header: "Date",
      getValue: (checkout) => checkout.date,
    },
    {
      id: "boat",
      header: "Boat",
      getValue: (checkout) => getBoatName(checkout.boat_id, boatNames),
    },
    {
      id: "time-out",
      header: "Time out",
      getValue: (checkout) => checkout.time_out ?? "Not recorded",
    },
    {
      id: "time-in",
      header: "Time in",
      getValue: (checkout) => checkout.time_in ?? "Not recorded",
    },
    {
      id: "rowers",
      header: "Rowers",
      getValue: (checkout) =>
        getRowerNames(checkout, rowersByCheckout, userNames),
    },
  ];

  return (
    <DataTable
      columns={columns}
      emptyMessage="No checkouts found."
      getRowId={(checkout) => checkout.check_out_id}
      rows={checkoutsList ?? []}
      searchLabel="Search checkouts"
    />
  );
}

export default CheckoutCatalog;
