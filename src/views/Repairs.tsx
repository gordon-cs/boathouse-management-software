import { Link, useParams } from "react-router-dom";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import RecordBrowserLayout from "@/components/ui/RecordBrowserLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBoats } from "@features/boats/hooks/useBoats";
import { useRepairs } from "@features/repairs/hooks/useRepairs";
import type { Repair } from "@features/repairs/api/repairs.api";
import { useUsers } from "@features/users/hooks/useUsers";

function Repairs() {
  const { repairId } = useParams();
  const repairs = useRepairs();
  const boats = useBoats();
  const users = useUsers();

  if (repairs.isPending || boats.isPending || users.isPending) {
    return <p className="text-sm text-muted-foreground">Loading repairs...</p>;
  }

  const error = repairs.error ?? boats.error ?? users.error;
  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load repairs: {error.message}
      </p>
    );
  }

  const repairList = repairs.data ?? [];
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
    (users.data ?? []).map((user) => [user.user_id, user.user_name])
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
          className={`block rounded-md px-2 py-1 font-medium underline-offset-4 hover:underline ${
            selectedRepair?.repair_id === repair.repair_id
              ? "bg-accent text-accent-foreground"
              : "text-primary"
          }`}
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
      id: "date",
      header: "Date",
      getValue: (repair) => repair.date,
    },
    {
      id: "boat",
      header: "Boat",
      getValue: (repair) =>
        repair.boat_id === null
          ? "Not linked"
          : boatNames.get(repair.boat_id) ?? `Boat #${repair.boat_id}`,
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
            </CardHeader>
            <CardContent>
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
                  <dt className="text-muted-foreground">Boat</dt>
                  <dd>
                    {selectedRepair.boat_id === null ? (
                      "Not linked"
                    ) : (
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
                        to={`/boats?boatId=${selectedRepair.boat_id}`}
                      >
                        {boatNames.get(selectedRepair.boat_id) ??
                          `Boat #${selectedRepair.boat_id}`}
                      </Link>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Checkout</dt>
                  <dd>
                    {selectedRepair.check_out_id === null ? (
                      "Not linked"
                    ) : (
                      <Link
                        className="text-primary underline-offset-4 hover:underline"
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
                      : userNames.get(selectedRepair.user_id) ??
                        `User #${selectedRepair.user_id}`}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Details</dt>
                  <dd className="whitespace-pre-wrap">
                    {selectedRepair.data ?? "Not recorded"}
                  </dd>
                </div>
              </dl>
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
