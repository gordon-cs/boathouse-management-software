import { Link, useSearchParams } from "react-router-dom";

import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import RecordBrowserLayout from "@/components/ui/RecordBrowserLayout";
import RecordNotes from "@/components/ui/RecordNotes";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EditRowerDialog from "@features/users/components/EditRowerDialog";
import { useBoats } from "@features/boats/hooks/useBoats";
import type { Checkout } from "@features/checkouts/api/checkouts.api";
import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";
import { useUsers } from "@features/users/hooks/useUsers";
import {
  getUserDisplayName,
  type User,
} from "@features/users/api/users.api";

function Rowers() {
  const [searchParams] = useSearchParams();
  const users = useUsers();
  const checkouts = useCheckouts();
  const additionalRowers = useAdditionalRowers();
  const boats = useBoats();

  const isPending =
    users.isPending ||
    checkouts.isPending ||
    additionalRowers.isPending ||
    boats.isPending;

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading rowers...</p>;
  }

  const error =
    users.error ??
    checkouts.error ??
    additionalRowers.error ??
    boats.error;

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load rower information: {error.message}
      </p>
    );
  }

  const rowerList = users.data ?? [];
  const requestedRowerId = searchParams.get("rowerId");
  const selectedRower =
    rowerList.find((rower) => rower.user_id === requestedRowerId) ??
    (requestedRowerId ? undefined : rowerList[0]);
  const boatNames = new Map(
    (boats.data ?? []).map((boat) => [
      boat.boat_id,
      boat.name ?? `Boat #${boat.boat_id}`,
    ])
  );
  const boatIds = new Set((boats.data ?? []).map((boat) => boat.boat_id));
  const additionalCheckoutIds = new Set(
    (additionalRowers.data ?? [])
      .filter(
        (rower) => rower.additional_rower_id === selectedRower?.user_id
      )
      .map((rower) => rower.check_out_id)
  );
  const rowerCheckouts =
    checkouts.data?.filter(
      (checkout) =>
        boatIds.has(checkout.object_id) &&
        (checkout.user_id === selectedRower?.user_id ||
          additionalCheckoutIds.has(checkout.check_out_id))
    ) ?? [];
  const rowerColumns: DataTableColumn<User>[] = [
    {
      id: "name",
      header: "Rower",
      getValue: getUserDisplayName,
      getSearchValue: (rower) =>
        `${getUserDisplayName(rower)} ${rower.user_type} ${rower.user_id}`,
      render: (rower) => (
        <Link
          aria-current={
            selectedRower?.user_id === rower.user_id ? "page" : undefined
          }
          className="block rounded-md px-2 py-1 font-medium text-primary underline underline-offset-4 hover:decoration-2"
          to={`/rowers?rowerId=${encodeURIComponent(rower.user_id)}`}
        >
          {getUserDisplayName(rower)}
        </Link>
      ),
    },
    {
      id: "type",
      header: "Type",
      getValue: (rower) => rower.user_type,
    },
    {
      id: "coach",
      header: "Coach",
      getValue: (rower) => rower.is_coach,
    },
    {
      id: "active",
      header: "Active",
      getValue: (rower) => rower.is_active,
    },
  ];
  const checkoutColumns: DataTableColumn<Checkout>[] = [
    {
      id: "checkout",
      header: "Checkout",
      getValue: (checkout) => checkout.check_out_id,
      render: (checkout) => (
        <Link
          className="text-primary underline underline-offset-4 hover:decoration-2"
          to={`/checkouts/${checkout.check_out_id}`}
        >
          Checkout #{checkout.check_out_id}
        </Link>
      ),
    },
    {
      id: "boat",
      header: "Boat",
      getValue: (checkout) =>
        boatNames.get(checkout.object_id) ?? `Boat #${checkout.object_id}`,
    },
    {
      id: "role",
      header: "Role",
      getValue: (checkout) =>
        checkout.user_id === selectedRower?.user_id
          ? "Primary rower"
          : "Additional rower",
    },
    {
      id: "time-out",
      header: "Time out",
      getValue: (checkout) => checkout.time_out,
    },
    {
      id: "time-in",
      header: "Time in",
      getValue: (checkout) => checkout.time_in,
    },
  ];

  return (
    <RecordBrowserLayout
      title="Rowers"
      description="Select a rower to view their information and checkouts."
      listTitle="Rowers"
      listDescription="Select a rower to view their information."
      list={
        <DataTable
          columns={rowerColumns}
          emptyMessage="No rowers found."
          getRowId={(rower) => rower.user_id}
          rows={rowerList}
          selectedRowId={selectedRower?.user_id}
          defaultSort={[{ columnId: "name", direction: "ascending" }]}
          searchLabel="Search rowers"
        />
      }
    >
      {selectedRower ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{getUserDisplayName(selectedRower)}</CardTitle>
              <CardDescription>Rower information</CardDescription>
              <CardAction>
                <EditRowerDialog rower={selectedRower} />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Rower ID</dt>
                  <dd>{selectedRower.user_id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{selectedRower.user_type}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Coach</dt>
                  <dd>{selectedRower.is_coach ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Active</dt>
                  <dd>{selectedRower.is_active ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    Single-seat approval
                  </dt>
                  <dd>
                    {selectedRower.is_single_approved === null
                      ? "Not recorded"
                      : selectedRower.is_single_approved
                        ? "Approved"
                        : "Not approved"}
                  </dd>
                </div>
              </dl>
              <RecordNotes
                key={selectedRower.user_id}
                notes={selectedRower.notes}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkouts</CardTitle>
              <CardDescription>
                Checkouts where this rower was a primary or additional rower.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={checkoutColumns}
                emptyMessage="No checkouts for this rower."
                getRowId={(checkout) => checkout.check_out_id}
                rows={rowerCheckouts}
                defaultSort={[{ columnId: "time-out", direction: "descending" }]}
                searchLabel="Search rower checkouts"
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              {rowerList.length
                ? `Rower ${requestedRowerId} was not found. Select a rower from the list.`
                : "No rowers found."}
            </p>
          </CardContent>
        </Card>
      )}
    </RecordBrowserLayout>
  );
}

export default Rowers;
