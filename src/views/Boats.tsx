import BoatStats from "@features/boats/components/BoatStats";
import { useBoats } from "@features/boats/hooks/useBoats";
import { useCheckouts } from "@features/checkouts/hooks/useCheckouts";
import { useRepairs } from "@features/repairs/hooks/useRepairs";
import type { Boat } from "@features/boats/api/boats.api";
import type { Checkout } from "@features/checkouts/api/checkouts.api";
import type { Repair } from "@features/repairs/api/repairs.api";
import { Link, useSearchParams } from "react-router-dom";
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

function formatRepairStatus(status: Repair["status"]) {
  return status === "to_do"
    ? "To do"
    : status === "in_progress"
      ? "In progress"
      : "Complete";
}

function Boats() {
  const [searchParams] = useSearchParams();
  const boats = useBoats();
  const checkouts = useCheckouts();
  const repairs = useRepairs();
  const isPending = boats.isPending || checkouts.isPending || repairs.isPending;

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading boats...</p>;
  }

  const error = boats.error ?? checkouts.error ?? repairs.error;
  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load boat data: {error.message}
      </p>
    );
  }

  const boatList = boats.data ?? [];
  const requestedBoatId = searchParams.get("boatId");
  const selectedBoat =
    boatList.find((boat) => boat.boat_id === Number(requestedBoatId)) ??
    (requestedBoatId ? undefined : boatList[0]);

  const columns: DataTableColumn<Boat>[] = [
    {
      id: "boat",
      header: "Boat",
      getValue: (boat) => boat.name,
      getSearchValue: (boat) =>
        `${boat.name ?? "Unnamed boat"} ${boat.make ?? ""}`,
      render: (boat) => (
        <Link
          aria-current={selectedBoat?.boat_id === boat.boat_id ? "page" : undefined}
          className="block rounded-md px-2 py-1 font-medium text-primary underline underline-offset-4 hover:decoration-2"
          to={`/boats?boatId=${boat.boat_id}`}
        >
          {boat.name ?? `Boat #${boat.boat_id}`}
        </Link>
      ),
    },
    {
      id: "make",
      header: "Make",
      getValue: (boat) => boat.make,
    },
    {
      id: "seats",
      header: "Seats",
      getValue: (boat) => boat.seats,
    },
    {
      id: "weight-class",
      header: "Weight class",
      getValue: (boat) => boat.min_weight ?? boat.max_weight,
      getSearchValue: (boat) =>
        `${boat.min_weight ?? "?"}-${boat.max_weight ?? "?"} lbs`,
      render: (boat) =>
        `${boat.min_weight ?? "?"}–${boat.max_weight ?? "?"} lbs`,
    },
  ];

  const selectedCheckouts =
    checkouts.data?.filter(
      (checkout) => checkout.boat_id === selectedBoat?.boat_id
    ) ?? [];
  const selectedRepairs =
    repairs.data?.filter((repair) => repair.boat_id === selectedBoat?.boat_id) ??
    [];

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
    { id: "date", header: "Date", getValue: (checkout) => checkout.date },
    {
      id: "time",
      header: "Time out",
      getValue: (checkout) => checkout.time_out,
    },
    {
      id: "time-in",
      header: "Time in",
      getValue: (checkout) => checkout.time_in,
    },
  ];
  const repairColumns: DataTableColumn<Repair>[] = [
    {
      id: "repair",
      header: "Repair",
      getValue: (repair) => repair.repair_id,
      render: (repair) => (
        <Link
          className="text-primary underline underline-offset-4 hover:decoration-2"
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
      getValue: (repair) => repair.is_rowable,
    },
    { id: "date", header: "Date", getValue: (repair) => repair.date },
  ];

  return (
    <RecordBrowserLayout
      title="Boats"
      description="Select a boat to view its information, checkouts, and repairs."
      listTitle="Boats"
      listDescription="Select a boat to view its information."
      list={
        <DataTable
          columns={columns}
          emptyMessage="No boats found."
          getRowId={(boat) => boat.boat_id}
          rows={boatList}
          selectedRowId={selectedBoat?.boat_id}
          defaultSort={[{ columnId: "boat", direction: "ascending" }]}
          searchLabel="Search boats"
        />
      }
    >
      {selectedBoat ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedBoat.name ?? `Boat #${selectedBoat.boat_id}`}
              </CardTitle>
              <CardDescription>Boat information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <BoatStats boat={selectedBoat} />
                <RecordNotes
                  key={selectedBoat.boat_id}
                  notes={selectedBoat.notes}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkouts</CardTitle>
              <CardDescription>
                Checkouts associated with this boat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={checkoutColumns}
                emptyMessage="No checkouts for this boat."
                getRowId={(checkout) => checkout.check_out_id}
                rows={selectedCheckouts}
                defaultSort={[{ columnId: "date", direction: "descending" }]}
                searchLabel="Search boat checkouts"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repairs</CardTitle>
              <CardDescription>
                Repairs associated with this boat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={repairColumns}
                emptyMessage="No repairs for this boat."
                getRowId={(repair) => repair.repair_id}
                rows={selectedRepairs}
                defaultSort={[
                  { columnId: "status", direction: "descending" },
                  { columnId: "date", direction: "descending" },
                ]}
                searchLabel="Search boat repairs"
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              {boatList.length
                ? `Boat #${requestedBoatId} was not found. Select a boat from the list.`
                : "No boats found."}
            </p>
          </CardContent>
        </Card>
      )}
    </RecordBrowserLayout>
  );
}
export default Boats;