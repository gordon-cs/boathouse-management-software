import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Boat } from "@features/boats/api/boats.api";
import { getUserDisplayName, type User } from "@features/users/api/users.api";
import type { AdditionalRower, Checkout } from "../api/checkouts.api";
import {
  useCreateAdditionalRower,
  useDeleteAdditionalRower,
  useUpdateCheckout,
} from "../hooks/useCheckouts";
import {
  joinCheckoutTimestamp,
  splitCheckoutTimestamp,
} from "../checkoutTime";

type EditCheckoutDialogProps = {
  checkout: Checkout;
  boats: Boat[];
  users: User[];
  additionalRowers: AdditionalRower[];
};

function EditCheckoutDialog({
  checkout,
  boats,
  users,
  additionalRowers,
}: EditCheckoutDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [objectId, setObjectId] = useState(String(checkout.object_id));
  const [primaryRowerId, setPrimaryRowerId] = useState(checkout.user_id);
  const [additionalRowerIds, setAdditionalRowerIds] = useState<string[]>([]);
  const [rowerSearch, setRowerSearch] = useState("");
  const [notes, setNotes] = useState(checkout.notes);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const updateCheckout = useUpdateCheckout();
  const createAdditionalRower = useCreateAdditionalRower();
  const deleteAdditionalRower = useDeleteAdditionalRower();

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
    const timeOutParts = splitCheckoutTimestamp(checkout.time_out);
    const timeInParts = checkout.time_in
      ? splitCheckoutTimestamp(checkout.time_in)
      : { date: timeOutParts.date, time: "" };

    setDate(timeOutParts.date);
    setTimeOut(timeOutParts.time);
    setTimeIn(timeInParts.time);
    setObjectId(String(checkout.object_id));
    setPrimaryRowerId(checkout.user_id);
    setAdditionalRowerIds(
      additionalRowers
        .filter((rower) => rower.check_out_id === checkout.check_out_id)
        .map((rower) => rower.additional_rower_id),
    );
    setRowerSearch("");
    setNotes(checkout.notes);
    setSaveError(null);
    updateCheckout.reset();
    createAdditionalRower.reset();
    deleteAdditionalRower.reset();
    setIsOpen(true);
  }

  function toggleAdditionalRower(userId: string, checked: boolean) {
    setAdditionalRowerIds((currentIds) =>
      checked
        ? [...new Set([...currentIds, userId])]
        : currentIds.filter((currentId) => currentId !== userId),
    );
  }

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !timeOut || !objectId || !primaryRowerId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const desiredAdditionalIds = new Set(
      additionalRowerIds.filter((userId) => userId !== primaryRowerId),
    );
    const currentAdditionalIds = new Set(
      additionalRowers
        .filter((rower) => rower.check_out_id === checkout.check_out_id)
        .map((rower) => rower.additional_rower_id),
    );

    try {
      await updateCheckout.mutateAsync({
        checkOutId: checkout.check_out_id,
        updates: {
          object_id: Number(objectId),
          user_id: primaryRowerId,
          time_out: joinCheckoutTimestamp(date, timeOut),
          time_in: timeIn ? joinCheckoutTimestamp(date, timeIn) : null,
          notes,
        },
      });

      await Promise.all([
        ...[...desiredAdditionalIds]
          .filter((userId) => !currentAdditionalIds.has(userId))
          .map((additionalRowerId) =>
            createAdditionalRower.mutateAsync({
              check_out_id: checkout.check_out_id,
              additional_rower_id: additionalRowerId,
            }),
          ),
        ...[...currentAdditionalIds]
          .filter((userId) => !desiredAdditionalIds.has(userId))
          .map((additionalRowerId) =>
            deleteAdditionalRower.mutateAsync({
              checkOutId: checkout.check_out_id,
              additionalRowerId,
            }),
          ),
      ]);

      setIsOpen(false);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "An unexpected error occurred.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const busy =
    isSaving ||
    updateCheckout.isPending ||
    createAdditionalRower.isPending ||
    deleteAdditionalRower.isPending;
  const normalizedRowerSearch = rowerSearch.trim().toLowerCase();
  const matchingUsers = users.filter((user) =>
    `${getUserDisplayName(user)} ${user.user_id}`
      .toLowerCase()
      .includes(normalizedRowerSearch),
  );

  return (
    <>
      <Button onClick={openDialog} size="sm" variant="outline">
        <Pencil aria-hidden="true" />
        Edit checkout
      </Button>

      {isOpen && (
        <dialog
          aria-labelledby="edit-checkout-title"
          className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,42rem)] max-w-none overflow-y-auto rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
          onCancel={() => !busy && setIsOpen(false)}
          onClose={() => setIsOpen(false)}
          onClick={(event) => {
            if (!busy && event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
          ref={dialogRef}
        >
          <form className="space-y-5 p-6" onSubmit={handleSave}>
            <header className="space-y-1">
              <h2 className="text-lg font-semibold" id="edit-checkout-title">
                Edit checkout
              </h2>
              <p className="text-sm text-muted-foreground">
                Checkout #{checkout.check_out_id}
              </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Date</span>
                <input
                  autoFocus
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setDate(event.target.value)}
                  required
                  type="date"
                  value={date}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Boat</span>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setObjectId(event.target.value)}
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
                <span>Time out</span>
                <input
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setTimeOut(event.target.value)}
                  required
                  type="time"
                  value={timeOut}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Time in</span>
                <input
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(event) => setTimeIn(event.target.value)}
                  type="time"
                  value={timeIn}
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-medium" htmlFor="edit-checkout-primary-rower">
              <span>Primary rower</span>
              <select
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                id="edit-checkout-primary-rower"
                onChange={(event) => setPrimaryRowerId(event.target.value)}
                required
                value={primaryRowerId}
              >
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {getUserDisplayName(user)}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Additional rowers</legend>
              <label
                className="block space-y-2 text-sm font-medium"
                htmlFor="edit-checkout-rower-search"
              >
                <span>Find rowers</span>
                <input
                  autoComplete="off"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  id="edit-checkout-rower-search"
                  onChange={(event) => setRowerSearch(event.target.value)}
                  placeholder="Search by name or ID"
                  type="search"
                  value={rowerSearch}
                />
              </label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-input p-3">
                {matchingUsers
                  .filter((user) => user.user_id !== primaryRowerId)
                  .map((user) => (
                    <label
                      className="flex items-center gap-2 text-sm"
                      key={user.user_id}
                    >
                      <input
                        checked={additionalRowerIds.includes(user.user_id)}
                        className="size-4 accent-primary"
                        onChange={(event) =>
                          toggleAdditionalRower(
                            user.user_id,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                      />
                      {getUserDisplayName(user)}
                    </label>
                  ))}
                {matchingUsers.filter(
                  (user) => user.user_id !== primaryRowerId,
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No matching rowers.
                  </p>
                )}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="edit-checkout-notes">
                Notes
              </label>
              <Textarea
                id="edit-checkout-notes"
                onChange={(event) => setNotes(event.target.value)}
                value={notes}
              />
            </div>

            {saveError && (
              <p className="text-sm text-destructive" role="alert">
                Could not save checkout: {saveError}
              </p>
            )}

            <footer className="flex justify-end gap-2">
              <Button
                disabled={busy}
                onClick={() => setIsOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={busy} type="submit">
                <Save aria-hidden="true" />
                {busy ? "Saving..." : "Save changes"}
              </Button>
            </footer>
          </form>
        </dialog>
      )}
    </>
  );
}

export default EditCheckoutDialog;
