import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Boat } from "@features/boats/api/boats.api";
import type { Checkout } from "@features/checkouts/api/checkouts.api";
import { getUserDisplayName, type User } from "@features/users/api/users.api";
import type { Repair } from "../api/repairs.api";
import { useUpdateRepair } from "../hooks/useRepairs";

function toDateInputValue(value: string): string {
  const datePrefix = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  if (datePrefix) {
    return datePrefix;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const localDate = new Date(
    parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 10);
}

function EditRepairDialog({
  repair,
  boats,
  checkouts,
  users,
}: {
  repair: Repair;
  boats: Boat[];
  checkouts: Checkout[];
  users: User[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [objectId, setObjectId] = useState(String(repair.object_id));
  const [checkOutId, setCheckOutId] = useState(
    repair.check_out_id === null ? "" : String(repair.check_out_id),
  );
  const [userId, setUserId] = useState(repair.user_id);
  const [repairType, setRepairType] = useState(repair.repair_type);
  const [date, setDate] = useState(() => toDateInputValue(repair.date));
  const [status, setStatus] = useState<Repair["status"]>(repair.status);
  const [isUsable, setIsUsable] = useState(repair.is_usable);
  const [details, setDetails] = useState(repair.data ?? "");
  const [notes, setNotes] = useState(repair.notes ?? "");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const updateRepair = useUpdateRepair();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function openDialog() {
    updateRepair.reset();
    setObjectId(String(repair.object_id));
    setCheckOutId(repair.check_out_id === null ? "" : String(repair.check_out_id));
    setUserId(repair.user_id);
    setRepairType(repair.repair_type);
    setDate(toDateInputValue(repair.date));
    setStatus(repair.status);
    setIsUsable(repair.is_usable);
    setDetails(repair.data ?? "");
    setNotes(repair.notes ?? "");
    setIsOpen(true);
  }

  function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    updateRepair.mutate(
      {
        repairId: repair.repair_id,
        updates: {
          object_id: Number(objectId),
          check_out_id: checkOutId ? Number(checkOutId) : null,
          user_id: userId,
          repair_type: repairType,
          date,
          status,
          is_usable: isUsable,
          data: details || null,
          notes: notes || null,
        },
      },
      { onSuccess: () => setIsOpen(false) },
    );
  }

  const validCheckouts = checkouts.filter(
    (checkout) => checkout.object_id === Number(objectId),
  );

  return (
    <>
      <Button onClick={openDialog} size="sm" variant="outline">
        <Pencil aria-hidden="true" />
        Edit repair
      </Button>

      {isOpen && (
        <dialog
          aria-labelledby="edit-repair-title"
          className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,42rem)] max-w-none overflow-y-auto rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
          onCancel={() => setIsOpen(false)}
          onClose={() => setIsOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
          ref={dialogRef}
        >
          <form className="space-y-5 p-6" onSubmit={handleSave}>
            <header className="space-y-1">
              <h2 className="text-lg font-semibold" id="edit-repair-title">
                Edit repair
              </h2>
              <p className="text-sm text-muted-foreground">
                Repair #{repair.repair_id}
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Type</span>
                <input
                  autoFocus
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setRepairType(event.target.value)}
                  required
                  value={repairType}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Date</span>
                <input
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setDate(event.target.value)}
                  required
                  type="date"
                  value={date}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Status</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) =>
                    setStatus(event.target.value as Repair["status"])
                  }
                  value={status}
                >
                  <option value="to_do">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="complete">Complete</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Boat</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => {
                    setObjectId(event.target.value);
                    if (
                      checkouts.find(
                        (checkout) =>
                          String(checkout.check_out_id) === checkOutId &&
                          String(checkout.object_id) !== event.target.value,
                      )
                    ) {
                      setCheckOutId("");
                    }
                  }}
                  required
                  value={objectId}
                >
                  {boats.map((boat) => (
                    <option key={boat.boat_id} value={boat.boat_id}>
                      {boat.name || `Boat #${boat.boat_id}`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Linked checkout</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setCheckOutId(event.target.value)}
                  value={checkOutId}
                >
                  <option value="">Not linked</option>
                  {validCheckouts.map((checkout) => (
                    <option key={checkout.check_out_id} value={checkout.check_out_id}>
                      Checkout #{checkout.check_out_id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Reported by</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setUserId(event.target.value)}
                  required
                  value={userId}
                >
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {getUserDisplayName(user)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                checked={isUsable}
                className="size-4 accent-primary"
                onChange={(event) => setIsUsable(event.target.checked)}
                type="checkbox"
              />
              Usable while repair is pending
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-repair-details">
                Details
              </label>
              <Textarea
                id="edit-repair-details"
                onChange={(event) => setDetails(event.target.value)}
                value={details}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-repair-notes">
                Notes
              </label>
              <Textarea
                id="edit-repair-notes"
                onChange={(event) => setNotes(event.target.value)}
                value={notes}
              />
            </div>

            {updateRepair.error && (
              <p className="text-sm text-destructive" role="alert">
                Could not save repair: {updateRepair.error.message}
              </p>
            )}

            <footer className="flex justify-end gap-2">
              <Button
                disabled={updateRepair.isPending}
                onClick={() => setIsOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={updateRepair.isPending} type="submit">
                <Save aria-hidden="true" />
                {updateRepair.isPending ? "Saving..." : "Save changes"}
              </Button>
            </footer>
          </form>
        </dialog>
      )}
    </>
  );
}

export default EditRepairDialog;
