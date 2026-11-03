import { Link, useParams } from "react-router-dom";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import RecordBrowserLayout from "@/components/ui/RecordBrowserLayout";
import RecordNotes from "@/components/ui/RecordNotes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBoats } from "@features/boats/hooks/useBoats";
import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";
import type { Checkout } from "@features/checkouts/api/checkouts.api";
import { useUsers } from "@features/users/hooks/useUsers";
import { useRepairs } from "@features/repairs/hooks/useRepairs";

function Checkouts() {
  const { checkoutId } = useParams();
  const checkouts = useCheckouts();
  const boats = useBoats();
  const users = useUsers();
  const additionalRowers = useAdditionalRowers();
  const repairs = useRepairs();

  const isPending =
    checkouts.isPending ||
    boats.isPending ||
    users.isPending ||
    additionalRowers.isPending ||
    repairs.isPending;

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading checkouts...</p>;
  }

  const error =
    checkouts.error ??
    boats.error ??
    users.error ??
    additionalRowers.error ??
    repairs.error;

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load checkouts: {error.message}
      </p>
    );
  }

  const checkoutList = checkouts.data ?? [];
  const selectedCheckout =
    checkoutList.find(
      (checkout) => checkout.check_out_id === Number(checkoutId)
    ) ?? (checkoutId ? undefined : checkoutList[0]);
  const boatNames = new Map(
    (boats.data ?? []).map((boat) => [
      boat.boat_id,
      boat.name ?? `Boat #${boat.boat_id}`,
    ])
  );
  const userNames = new Map(
    (users.data ?? []).map((user) => [user.user_id, user.user_name])
  );
  const rowersByCheckout = new Map<number, string[]>();
  for (const rower of additionalRowers.data ?? []) {
    const rowerIds = rowersByCheckout.get(rower.check_out_id) ?? [];
    rowerIds.push(rower.additional_rower_id);
    rowersByCheckout.set(rower.check_out_id, rowerIds);
  }
  const columns: DataTableColumn<Checkout>[] = [
    {
      id: "checkout",
      header: "Checkout",
      getValue: (checkout) => checkout.check_out_id,
      getSearchValue: (checkout) =>
        `Checkout #${checkout.check_out_id} ${checkout.date}`,
      render: (checkout) => (
        <Link
          aria-current={
            selectedCheckout?.check_out_id === checkout.check_out_id
              ? "page"
              : undefined
          }
          className="font-medium text-primary underline-offset-4 hover:underline"
          to={`/checkouts/${checkout.check_out_id}`}
        >
          Checkout #{checkout.check_out_id}
        </Link>
      ),
    },
    {
      id: "date",
      header: "Date",
      getValue: (checkout) => checkout.date,
    },
    {
      id: "boat",
      header: "Boat",
      getValue: (checkout) =>
        boatNames.get(checkout.boat_id) ?? `Boat #${checkout.boat_id}`,
    },
  ];

  const selectedRowerNames = selectedCheckout
    ? [
        userNames.get(selectedCheckout.user_id) ??
          `User #${selectedCheckout.user_id}`,
        ...(rowersByCheckout.get(selectedCheckout.check_out_id) ?? []).map(
          (userId) => userNames.get(userId) ?? `User #${userId}`
        ),
      ]
    : [];
  const linkedRepairs =
    repairs.data?.filter(
      (repair) => repair.check_out_id === selectedCheckout?.check_out_id
    ) ?? [];

  return (
    <RecordBrowserLayout
      title="Checkouts"
      description="Browse checkout records and their linked repairs."
      listTitle="Checkouts"
      listDescription="Select a checkout to view its information."
      list={
        <DataTable
          columns={columns}
          emptyMessage="No checkouts found."
          getRowId={(checkout) => checkout.check_out_id}
          rows={checkoutList}
          searchLabel="Search checkouts"
        />
      }
    >
      {selectedCheckout ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Checkout #{selectedCheckout.check_out_id}
              </CardTitle>
              <CardDescription>{selectedCheckout.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Boat</dt>
                  <dd>
                    <Link
                      className="text-primary underline-offset-4 hover:underline"
                      to={`/boats?boatId=${selectedCheckout.boat_id}`}
                    >
                      {boatNames.get(selectedCheckout.boat_id) ??
                        `Boat #${selectedCheckout.boat_id}`}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>{selectedCheckout.date}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Time out</dt>
                  <dd>{selectedCheckout.time_out ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Time in</dt>
                  <dd>{selectedCheckout.time_in ?? "Not recorded"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Rowers</dt>
                  <dd>{selectedRowerNames.join(", ")}</dd>
                </div>
              </dl>
              <RecordNotes
                key={selectedCheckout.check_out_id}
                notes={selectedCheckout.notes}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked repairs</CardTitle>
              <CardDescription>
                Repairs reported for this checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkedRepairs.length ? (
                <ul className="space-y-2">
                  {linkedRepairs.map((repair) => (
                    <li key={repair.repair_id}>
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/repairs/${repair.repair_id}`}
                      >
                        Repair #{repair.repair_id}
                        {repair.repair_type ? ` — ${repair.repair_type}` : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No repairs are linked to this checkout.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              {checkoutList.length
                ? checkoutId
                  ? `Checkout #${checkoutId} was not found. Select a checkout from the list.`
                  : "Select a checkout from the list to view its information."
                : "No checkouts found."}
            </p>
          </CardContent>
        </Card>
      )}
    </RecordBrowserLayout>
  );
}

export default Checkouts;
