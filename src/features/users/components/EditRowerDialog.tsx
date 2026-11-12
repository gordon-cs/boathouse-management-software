import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@context/useAuth";
import { getUserDisplayName, type User } from "../api/users.api";
import { useUpdateUser } from "../hooks/useUsers";

function EditRowerDialog({ rower }: { rower: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [lastNameDraft, setLastNameDraft] = useState("");
  const [preferredNameDraft, setPreferredNameDraft] = useState("");
  const [userTypeDraft, setUserTypeDraft] = useState<User["user_type"]>("master");
  const [isActiveDraft, setIsActiveDraft] = useState(false);
  const [isSingleApprovedDraft, setIsSingleApprovedDraft] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const updateUser = useUpdateUser();
  const { session } = useAuth();
  const isEditingOwnProfile = session?.user.id === rower.user_id;

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

  function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser.mutate(
      {
        userId: rower.user_id,
        updates: {
          user_type: userTypeDraft,
          is_active: isActiveDraft,
          is_single_approved: isSingleApprovedDraft,
          notes: notesDraft,
          ...(isEditingOwnProfile && {
            user_first_name: firstNameDraft,
            user_last_name: lastNameDraft,
            preferred_name: preferredNameDraft.trim() || null,
          }),
        },
      },
      { onSuccess: () => setIsOpen(false) },
    );
  }

  function openDialog() {
    updateUser.reset();
    setNotesDraft(rower.notes ?? "");
    setFirstNameDraft(rower.user_first_name);
    setLastNameDraft(rower.user_last_name);
    setPreferredNameDraft(rower.preferred_name ?? "");
    setUserTypeDraft(rower.user_type);
    setIsActiveDraft(rower.is_active);
    setIsSingleApprovedDraft(rower.is_single_approved);
    setIsOpen(true);
  }

  return (
    <>
      <Button onClick={openDialog} size="sm" variant="outline">
        <Pencil aria-hidden="true" />
        Edit rower
      </Button>

      {isOpen && (
        <dialog
          aria-labelledby="edit-rower-title"
          className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,34rem)] max-w-none overflow-y-auto rounded-lg border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
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
              <h2 className="text-lg font-semibold" id="edit-rower-title">
                Edit rower
              </h2>
              <p className="text-sm text-muted-foreground">
                {getUserDisplayName(rower)}
              </p>
            </header>

            {isEditingOwnProfile && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>First name</span>
                  <input
                    autoComplete="given-name"
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    onChange={(event) => setFirstNameDraft(event.target.value)}
                    required
                    value={firstNameDraft}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>Last name</span>
                  <input
                    autoComplete="family-name"
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    onChange={(event) => setLastNameDraft(event.target.value)}
                    required
                    value={lastNameDraft}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  <span>Preferred name</span>
                  <input
                    autoComplete="nickname"
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    onChange={(event) =>
                      setPreferredNameDraft(event.target.value)
                    }
                    value={preferredNameDraft}
                  />
                </label>
              </div>
            )}

            <label className="block space-y-2 text-sm font-medium" htmlFor="edit-rower-type">
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

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Status</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={isActiveDraft}
                  className="size-4 accent-primary"
                  onChange={(event) => setIsActiveDraft(event.target.checked)}
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
              <label className="text-sm font-medium" htmlFor="edit-rower-notes">
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
                onClick={() => setIsOpen(false)}
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
    </>
  );
}

export default EditRowerDialog;
