import { Link, useParams } from "react-router-dom";
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
import { useBoats } from "@features/boats/hooks/useBoats";
import { useCheckouts } from "@features/checkouts/hooks/useCheckouts";
import EditRepairDialog from "@features/repairs/components/EditRepairDialog";
import { useRepairs } from "@features/repairs/hooks/useRepairs";
import type { Repair } from "@features/repairs/api/repairs.api";
import { useUsers } from "@features/users/hooks/useUsers";
import { getUserDisplayName } from "@features/users/api/users.api";

function formatRepairStatus(status: Repair["status"]) {
  return status === "to_do"
    ? "To do"
    : status === "in_progress"
      ? "In progress"
      : "Complete";
}

function Repairs() {
  const { repairId } = useParams();
  const repairs = useRepairs();
  const boats = useBoats();
  const checkouts = useCheckouts();
  const users = useUsers();

  if (
    repairs.isPending ||
    boats.isPending ||
    checkouts.isPending ||
    users.isPending
  ) {
    return <p className="text-sm text-muted-foreground">Loading repairs...</p>;
  }

  const error = repairs.error ?? boats.error ?? checkouts.error ?? users.error;
  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load repairs: {error.message}
      </p>
    );
  }

  const boatIds = new Set((boats.data ?? []).map((boat) => boat.boat_id));
  const repairList = (repairs.data ?? []).filter((repair) =>
    boatIds.has(repair.object_id)
  );
  const selectedRepair =
    repairList.find((repair) => repair.repair_id === Number(repairId)) ??
    (repairId ? undefined : repairList[0]);
  const boatNames = new Map(
    (boats.data ?? []).map((boat) => [
      boat.boat_id,
      boat.name ?? `Boat #${boat.boat_id}`,
    ])
  );
  const userNames = new Map(
    (users.data ?? []).map((user) => [user.user_id, getUserDisplayName(user)])
  );
  const columns: DataTableColumn<Repair>[] = [
    {
      id: "repair",
      header: "Repair",
      getValue: (repair) => repair.repair_id,
      getSearchValue: (repair) =>
        `Repair #${repair.repair_id} ${repair.repair_type ?? ""}`,
      render: (repair) => (
        <Link
          aria-current={selectedRepair?.repair_id === repair.repair_id ? "page" : undefined}
          className="block rounded-md px-2 py-1 font-medium text-primary underline underline-offset-4 hover:decoration-2"
          to={`/repairs/${repair.repair_id}`}
        >
          Repair #{repair.repair_id}
        </Link>
      ),
    },
    {
      id: "type",
      header: "Type",
      getValue: (repair) => repair.repair_type,
    },
    {
      id: "status",
      header: "Status",
      getValue: (repair) => repair.status !== "complete",
      getSearchValue: (repair) => formatRepairStatus(repair.status),
      render: (repair) => formatRepairStatus(repair.status),
    },
    {
      id: "rowable",
      header: "Rowable",
      getValue: (repair) => repair.is_usable,
    },
    {
      id: "date",
      header: "Date",
      getValue: (repair) => repair.date,
    },
    {
      id: "boat",
      header: "Boat",
      getValue: (repair) =>
        boatNames.get(repair.object_id) ?? `Boat #${repair.object_id}`,
    },
    {
      id: "rower",
      header: "Reported by",
      getValue: (repair) =>
        userNames.get(repair.user_id) ?? `User #${repair.user_id}`,
      render: (repair) => (
        <Link
          className="text-primary underline underline-offset-4 hover:decoration-2"
          to={`/rowers?rowerId=${encodeURIComponent(repair.user_id)}`}
        >
          {userNames.get(repair.user_id) ?? `User #${repair.user_id}`}
        </Link>
      ),
    },
    {
      id: "checkout",
      header: "Checkout",
      getValue: (repair) =>
        repair.check_out_id === null ? null : repair.check_out_id,
      render: (repair) =>
        repair.check_out_id === null ? (
          "Not linked"
        ) : (
          <Link
            className="text-primary underline underline-offset-4 hover:decoration-2"
            to={`/checkouts/${repair.check_out_id}`}
          >
            Checkout #{repair.check_out_id}
          </Link>
        ),
    },
  ];

  return (
    <RecordBrowserLayout
      title="Repairs"
      description="Browse repair records and their linked information."
      listTitle="Repairs"
      listDescription="Select a repair to view its information."
      list={
        <DataTable
          columns={columns}
          emptyMessage="No repairs found."
          getRowId={(repair) => repair.repair_id}
          rows={repairList}
          selectedRowId={selectedRepair?.repair_id}
          defaultSort={[
            { columnId: "status", direction: "descending" },
            { columnId: "date", direction: "descending" },
          ]}
          searchLabel="Search repairs"
        />
      }
    >
      {selectedRepair ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Repair #{selectedRepair.repair_id}
              </CardTitle>
              <CardDescription>
                {selectedRepair.repair_type ?? "Repair details"}
              </CardDescription>
              <CardAction>
                <EditRepairDialog
                  boats={boats.data ?? []}
                  checkouts={checkouts.data ?? []}
                  repair={selectedRepair}
                  users={users.data ?? []}
                />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd>{selectedRepair.repair_type ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>{selectedRepair.date ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>{formatRepairStatus(selectedRepair.status)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Rowable</dt>
                  <dd>{selectedRepair.is_usable ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Boat</dt>
                  <dd>
                    <Link
                      className="text-primary underline underline-offset-4 hover:decoration-2"
                      to={`/boats?boatId=${selectedRepair.object_id}`}
                    >
                      {boatNames.get(selectedRepair.object_id) ??
                        `Boat #${selectedRepair.object_id}`}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Checkout</dt>
                  <dd>
                    {selectedRepair.check_out_id === null ? (
                      "Not linked"
                    ) : (
                      <Link
                        className="text-primary underline underline-offset-4 hover:decoration-2"
                        to={`/checkouts/${selectedRepair.check_out_id}`}
                      >
                        Checkout #{selectedRepair.check_out_id}
                      </Link>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Reported by</dt>
                  <dd>
                    {selectedRepair.user_id === null
                      ? "Not recorded"
                      : (
                          <Link
                            className="text-primary underline underline-offset-4 hover:decoration-2"
                            to={`/rowers?rowerId=${encodeURIComponent(selectedRepair.user_id)}`}
                          >
                            {userNames.get(selectedRepair.user_id) ??
                              `User #${selectedRepair.user_id}`}
                          </Link>
                        )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Details</dt>
                  <dd className="whitespace-pre-wrap">
                    {selectedRepair.data ?? "Not recorded"}
                  </dd>
                </div>
              </dl>
              <RecordNotes
                key={selectedRepair.repair_id}
                notes={selectedRepair.notes}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked documents</CardTitle>
              <CardDescription>
                Documents associated with this repair.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No linked documents are available yet.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              {repairList.length
                ? repairId
                  ? `Repair #${repairId} was not found. Select a repair from the list.`
                  : "Select a repair from the list to view its information."
                : "No repairs found."}
            </p>
          </CardContent>
        </Card>
      )}
    </RecordBrowserLayout>
  );
}

export default Repairs;
