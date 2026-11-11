import { useEffect, useRef, useState, type FormEvent } from "react";
import { Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Boat } from "../api/boats.api";
import { useUpdateBoat } from "../hooks/useBoats";

function parseOptionalNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
}

function EditBoatDialog({ boat }: { boat: Boat }) {
  const [boatDraft, setBoatDraft] = useState<Boat | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const updateBoat = useUpdateBoat();

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

  return (
    <>
      <Button
        onClick={() => {
          updateBoat.reset();
          setBoatDraft({ ...boat });
        }}
        size="sm"
        variant="outline"
      >
        <Pencil aria-hidden="true" />
        Edit boat
      </Button>

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
                    setBoatDraft({ ...boatDraft, make: event.target.value || null })
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
                  setBoatDraft({ ...boatDraft, is_retired: event.target.checked })
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
    </>
  );
}

export default EditBoatDialog;
