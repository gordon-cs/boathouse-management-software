import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";

import type { Boat } from "../api/boats.api";
import { useBoats } from "../hooks/useBoats";

const columns: DataTableColumn<Boat>[] = [
  {
    id: "name",
    header: "Boat",
    getValue: (boat) => boat.name,
    getSearchValue: (boat) => boat.name ?? "Unnamed boat",
    render: (boat) => boat.name ?? "Unnamed boat",
  },
  {
    id: "make",
    header: "Make",
    getValue: (boat) => boat.make,
    getSearchValue: (boat) => boat.make ?? "Make not provided",
    render: (boat) => boat.make ?? "Make not provided",
  },
  {
    id: "seats",
    header: "Seats",
    getValue: (boat) => boat.seats,
    render: (boat) => `${boat.seats} seats`,
  },
];

function BoatCatalog() {
  const {
    error: boatsError,
    isPending: boatsPending,
    data: boatsList,
  } = useBoats();

  if (boatsPending) {
    return <p className="text-sm text-muted-foreground">Loading boats...</p>;
  }

  if (boatsError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load boats: {boatsError.message}
      </p>
    );
  }

  return (
    <DataTable
      columns={columns}
      emptyMessage="No boats found."
      getRowId={(boat) => boat.boat_id}
      rows={boatsList ?? []}
      searchLabel="Search boats"
    />
  );
}

export default BoatCatalog;
