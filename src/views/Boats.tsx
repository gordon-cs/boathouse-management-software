import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import BoatStats from "@features/boats/components/BoatStats";
import { useBoats, useUpdateBoat } from "@features/boats/hooks/useBoats";
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
  CardAction,
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

function parseOptionalNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function Boats() {
  const [searchParams] = useSearchParams();
  const [boatDraft, setBoatDraft] = useState<Boat | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const updateBoat = useUpdateBoat();
  const boats = useBoats();
  const checkouts = useCheckouts();
  const repairs = useRepairs();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (boatDraft && !dialog.open) {
      dialog.showModal();
    } else if (!boatDraft && dialog.open) {
      dialog.close();
    }
  }, [boatDraft]);

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

  function handleSaveBoat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!boatDraft) {
      return;
    }

    const { boat_id: boatId, ...updates } = boatDraft;
    updateBoat.mutate(
      { boatId, updates },
      { onSuccess: () => setBoatDraft(null) },
    );
  }

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
      (checkout) => checkout.object_id === selectedBoat?.boat_id
    ) ?? [];
  const selectedRepairs =
    repairs.data?.filter((repair) => repair.object_id === selectedBoat?.boat_id) ??
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
      getValue: (repair) => repair.is_usable,
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
              <CardAction>
                <Button
                  onClick={() => {
                    updateBoat.reset();
                    setBoatDraft({ ...selectedBoat });
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Pencil aria-hidden="true" />
                  Edit boat
                </Button>
              </CardAction>
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

          {boatDraft && (
            <dialog
              aria-labelledby="edit-boat-title"
              className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,42rem)] max-w-none overflow-y-auto rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
              onCancel={() => setBoatDraft(null)}
              onClose={() => setBoatDraft(null)}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setBoatDraft(null);
                }
              }}
              ref={dialogRef}
            >
              <form className="space-y-5 p-6" onSubmit={handleSaveBoat}>
                <header className="space-y-1">
                  <h2 className="text-lg font-semibold" id="edit-boat-title">
                    Edit boat
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Boat #{boatDraft.boat_id}
                  </p>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    <span>Name</span>
                    <input
                      autoFocus
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      onChange={(event) =>
                        setBoatDraft({ ...boatDraft, name: event.target.value })
                      }
                      required
                      value={boatDraft.name}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Make</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          make: event.target.value || null,
                        })
                      }
                      value={boatDraft.make ?? ""}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Year</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          year: parseOptionalNumber(event.target.value),
                        })
                      }
                      step="1"
                      type="number"
                      value={boatDraft.year ?? ""}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Seats</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      min="1"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          seats: parseOptionalNumber(event.target.value) ?? 1,
                        })
                      }
                      required
                      step="1"
                      type="number"
                      value={boatDraft.seats}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Inboard (in)</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      min="0"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          inboard: parseOptionalNumber(event.target.value),
                        })
                      }
                      step="any"
                      type="number"
                      value={boatDraft.inboard ?? ""}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Minimum weight (lbs)</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      min="0"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          min_weight: parseOptionalNumber(event.target.value),
                        })
                      }
                      step="any"
                      type="number"
                      value={boatDraft.min_weight ?? ""}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Maximum weight (lbs)</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      min="0"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          max_weight: parseOptionalNumber(event.target.value),
                        })
                      }
                      step="any"
                      type="number"
                      value={boatDraft.max_weight ?? ""}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Pitch</span>
                    <input
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          pitch: parseOptionalNumber(event.target.value),
                        })
                      }
                      step="any"
                      type="number"
                      value={boatDraft.pitch ?? ""}
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    <span>Availability</span>
                    <select
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      onChange={(event) =>
                        setBoatDraft({
                          ...boatDraft,
                          is_available:
                            event.target.value === ""
                              ? null
                              : event.target.value === "available",
                        })
                      }
                      value={
                        boatDraft.is_available === null
                          ? ""
                          : boatDraft.is_available
                            ? "available"
                            : "unavailable"
                      }
                    >
                      <option value="">Not recorded</option>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={boatDraft.is_retired}
                    className="size-4 accent-primary"
                    onChange={(event) =>
                      setBoatDraft({
                        ...boatDraft,
                        is_retired: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                  Retired
                </label>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="edit-boat-notes">
                    Notes
                  </label>
                  <Textarea
                    id="edit-boat-notes"
                    onChange={(event) =>
                      setBoatDraft({ ...boatDraft, notes: event.target.value })
                    }
                    value={boatDraft.notes}
                  />
                </div>

                {updateBoat.error && (
                  <p className="text-sm text-destructive" role="alert">
                    Could not save boat: {updateBoat.error.message}
                  </p>
                )}

                <footer className="flex justify-end gap-2">
                  <Button
                    disabled={updateBoat.isPending}
                    onClick={() => setBoatDraft(null)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button disabled={updateBoat.isPending} type="submit">
                    <Save aria-hidden="true" />
                    {updateBoat.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </footer>
              </form>
            </dialog>
          )}

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
                defaultSort={[{ columnId: "time", direction: "descending" }]}
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