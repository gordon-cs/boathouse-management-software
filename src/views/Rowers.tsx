import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pencil, Save } from "lucide-react";

import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import RecordBrowserLayout from "@/components/ui/RecordBrowserLayout";
import RecordNotes from "@/components/ui/RecordNotes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useBoats } from "@features/boats/hooks/useBoats";
import type { Checkout } from "@features/checkouts/api/checkouts.api";
import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";
import { useUpdateUser, useUsers } from "@features/users/hooks/useUsers";
import {
  getUserDisplayName,
  type User,
} from "@features/users/api/users.api";

function Rowers() {
  const [searchParams] = useSearchParams();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [userTypeDraft, setUserTypeDraft] = useState<User["user_type"]>("master");
  const [isActiveDraft, setIsActiveDraft] = useState(false);
  const [isSingleApprovedDraft, setIsSingleApprovedDraft] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const updateUser = useUpdateUser();
  const users = useUsers();
  const checkouts = useCheckouts();
  const additionalRowers = useAdditionalRowers();
  const boats = useBoats();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (editingUserId && !dialog.open) {
      dialog.showModal();
    } else if (!editingUserId && dialog.open) {
      dialog.close();
    }
  }, [editingUserId]);

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
  const editingRower = rowerList.find(
    (rower) => rower.user_id === editingUserId
  );
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

  function handleSaveNotes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingRower) {
      return;
    }

    updateUser.mutate(
      {
        userId: editingRower.user_id,
        updates: {
          user_type: userTypeDraft,
          is_active: isActiveDraft,
          is_single_approved: isSingleApprovedDraft,
          notes: notesDraft,
        },
      },
      { onSuccess: () => setEditingUserId(null) },
    );
  }

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
                <Button
                  onClick={() => {
                    updateUser.reset();
                    setNotesDraft(selectedRower.notes ?? "");
                    setUserTypeDraft(selectedRower.user_type);
                    setIsActiveDraft(selectedRower.is_active);
                    setIsSingleApprovedDraft(
                      selectedRower.is_single_approved,
                    );
                    setEditingUserId(selectedRower.user_id);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Pencil aria-hidden="true" />
                  Edit rower
                </Button>
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

          {editingRower && (
            <dialog
              aria-labelledby="edit-rower-title"
              className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,34rem)] max-w-none overflow-y-auto rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
              onCancel={() => setEditingUserId(null)}
              onClose={() => setEditingUserId(null)}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setEditingUserId(null);
                }
              }}
              ref={dialogRef}
            >
              <form className="space-y-5 p-6" onSubmit={handleSaveNotes}>
                <header className="space-y-1">
                  <h2
                    className="text-lg font-semibold"
                    id="edit-rower-title"
                  >
                    Edit rower
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getUserDisplayName(editingRower)}
                  </p>
                </header>

                <div className="space-y-2">
                  <label
                    className="block space-y-2 text-sm font-medium"
                    htmlFor="edit-rower-type"
                  >
                    <span>Type</span>
                    <select
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      id="edit-rower-type"
                      onChange={(event) =>
                        setUserTypeDraft(event.target.value as User["user_type"])
                      }
                      value={userTypeDraft}
                    >
                      <option value="master">Master</option>
                      <option value="collegiate">Collegiate</option>
                      <option value="junior">Junior</option>
                      <option value="middie">Middie</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Status</legend>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      checked={isActiveDraft}
                      className="size-4 accent-primary"
                      onChange={(event) =>
                        setIsActiveDraft(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      checked={isSingleApprovedDraft}
                      className="size-4 accent-primary"
                      onChange={(event) =>
                        setIsSingleApprovedDraft(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Single-seat approved
                  </label>
                </fieldset>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="edit-rower-notes"
                  >
                    Notes
                  </label>
                  <Textarea
                    autoFocus
                    id="edit-rower-notes"
                    onChange={(event) => setNotesDraft(event.target.value)}
                    value={notesDraft}
                  />
                </div>

                {updateUser.error && (
                  <p className="text-sm text-destructive" role="alert">
                    Could not save rower: {updateUser.error.message}
                  </p>
                )}

                <footer className="flex justify-end gap-2">
                  <Button
                    disabled={updateUser.isPending}
                    onClick={() => setEditingUserId(null)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button disabled={updateUser.isPending} type="submit">
                    <Save aria-hidden="true" />
                    {updateUser.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </footer>
              </form>
            </dialog>
          )}

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
