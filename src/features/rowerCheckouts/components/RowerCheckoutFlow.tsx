import { useState } from "react";
import type { ReactNode } from "react";
import { Check, Clock3, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import type { Boat } from "@features/boats/api/boats.api";
import { useBoats } from "@features/boats/hooks/useBoats";
import type { Erg } from "@features/ergs/api/ergs.api";
import { useErgs } from "@features/ergs/hooks/useErgs";
import type { Checkout } from "@features/checkouts/api/checkouts.api";
import {
  useAdditionalRowers,
  useCheckouts,
  useCreateCheckout,
  useUpdateCheckout,
} from "@features/checkouts/hooks/useCheckouts";
import { formatCheckoutTime } from "@features/checkouts/checkoutTime";
import { getUserDisplayName } from "@features/users/api/users.api";
import { useUsers } from "@features/users/hooks/useUsers";

type CheckoutCompletion = {
  checkout: Checkout;
  assetName: string;
  timeIn: string;
  report: string;
};

type RowerCheckoutAsset = {
  id: number;
  name: string;
  isAvailable: boolean | null;
  isRetired: boolean | null;
  specs: ReactNode;
};

type RowerCheckoutFlowProps = {
  assetType: "boat" | "erg";
};

const MAX_VISIBLE_ASSETS = 5;

function levenshteinDistance(first: string, second: string): number {
  let previousRow = Array.from(
    { length: second.length + 1 },
    (_, index) => index,
  );

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const currentRow = [firstIndex];

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const substitutionCost =
        first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;

      currentRow[secondIndex] = Math.min(
        previousRow[secondIndex] + 1,
        currentRow[secondIndex - 1] + 1,
        previousRow[secondIndex - 1] + substitutionCost,
      );
    }

    previousRow = currentRow;
  }

  return previousRow[second.length];
}

function fuzzySearchAssets(
  assets: RowerCheckoutAsset[],
  query: string,
): RowerCheckoutAsset[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return [...assets]
      .sort((first, second) => first.name.localeCompare(second.name))
      .slice(0, MAX_VISIBLE_ASSETS);
  }

  const threshold = Math.max(2, Math.floor(normalizedQuery.length * 0.4));

  return assets
    .map((asset) => {
      const normalizedName = asset.name.toLocaleLowerCase();
      const score = normalizedName.includes(normalizedQuery)
        ? 0
        : Math.min(
            levenshteinDistance(normalizedQuery, normalizedName),
            ...normalizedName
              .split(/\s+/)
              .map((word) => levenshteinDistance(normalizedQuery, word)),
          );

      return { asset, score };
    })
    .filter(({ score }) => score <= threshold)
    .sort(
      (first, second) =>
        first.score - second.score ||
        first.asset.name.localeCompare(second.asset.name),
    )
    .slice(0, MAX_VISIBLE_ASSETS)
    .map(({ asset }) => asset);
}

function BoatSpecs({ boat }: { boat: Boat }) {
  return (
    <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
      <div>
        <dt className="text-muted-foreground">Seats</dt>
        <dd className="font-medium">{boat.seats}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Pitch</dt>
        <dd className="font-medium">{boat.pitch ?? "Not recorded"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Weight class</dt>
        <dd className="font-medium">
          {boat.min_weight ?? "?"}–{boat.max_weight ?? "?"} lbs
        </dd>
      </div>
    </dl>
  );
}

function ErgSpecs({ erg }: { erg: Erg }) {
  return (
    <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
      <div>
        <dt className="text-muted-foreground">Number</dt>
        <dd className="font-medium">{erg.number}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Model</dt>
        <dd className="font-medium">{erg.model ?? "Not recorded"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Year</dt>
        <dd className="font-medium">{erg.year}</dd>
      </div>
    </dl>
  );
}

function formatDuration(start: string, end: string): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60_000),
  );
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function RowerCheckoutFlow({
  assetType,
}: RowerCheckoutFlowProps) {
  const { session, loading: authIsLoading } = useAuth();
  const boats = useBoats(assetType === "boat");
  const ergs = useErgs(assetType === "erg");
  const users = useUsers();
  const checkouts = useCheckouts();
  const additionalRowers = useAdditionalRowers();
  const createCheckout = useCreateCheckout();
  const updateCheckout = useUpdateCheckout();
  const [search, setSearch] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [returnReport, setReturnReport] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [completion, setCompletion] = useState<CheckoutCompletion | null>(null);

  const isPending =
    authIsLoading ||
    (assetType === "boat" ? boats.isPending : ergs.isPending) ||
    users.isPending ||
    checkouts.isPending ||
    additionalRowers.isPending;

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading your {assetType} checkout...
      </p>
    );
  }

  const error =
    (assetType === "boat" ? boats.error : ergs.error) ??
    users.error ??
    checkouts.error ??
    additionalRowers.error;

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load your {assetType} checkout: {error.message}
      </p>
    );
  }

  if (!session?.user.id) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Sign in to check out a {assetType}.
      </p>
    );
  }

  const userId = session.user.id;
  const assetLabel = assetType === "boat" ? "boat" : "erg";
  const assetTitle = assetType === "boat" ? "Boat" : "Erg";
  const assetArticle = assetType === "boat" ? "a" : "an";
  const assets: RowerCheckoutAsset[] =
    assetType === "boat"
      ? (boats.data ?? []).map((boat) => ({
          id: boat.boat_id,
          name: boat.name,
          isAvailable: boat.is_available,
          isRetired: boat.is_retired,
          specs: <BoatSpecs boat={boat} />,
        }))
      : (ergs.data ?? []).map((erg) => ({
          id: erg.erg_id,
          name: erg.name?.trim() || `Erg #${erg.number}`,
          isAvailable: erg.is_available,
          isRetired: erg.is_retired,
          specs: <ErgSpecs erg={erg} />,
        }));
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));
  const rowerProfile = users.data?.find((user) => user.user_id === userId);
  const rowerName = rowerProfile
    ? getUserDisplayName(rowerProfile)
    : session.user.email ?? "Rower";
  const additionalCheckoutIds = new Set(
    (additionalRowers.data ?? [])
      .filter((rower) => rower.additional_rower_id === userId)
      .map((rower) => rower.check_out_id),
  );
  const assetIds = new Set(assetById.keys());
  const activeCheckouts = (checkouts.data ?? [])
    .filter(
      (checkout) =>
        checkout.time_in === null &&
        assetIds.has(checkout.object_id) &&
        (checkout.user_id === userId ||
          additionalCheckoutIds.has(checkout.check_out_id)),
    )
    .sort((first, second) => second.time_out.localeCompare(first.time_out));
  const checkedOutAssetIds = new Set(
    (checkouts.data ?? [])
      .filter((checkout) => checkout.time_in === null)
      .map((checkout) => checkout.object_id),
  );
  const availableAssets = assets.filter(
    (asset) =>
      !asset.isRetired &&
      asset.isAvailable !== false &&
      !checkedOutAssetIds.has(asset.id),
  );
  const searchResults = fuzzySearchAssets(availableAssets, search);
  const selectedAsset = availableAssets.find(
    (asset) => asset.id === selectedAssetId,
  );
  const isCreatingCheckout = createCheckout.isPending;
  const isUpdatingCheckout = updateCheckout.isPending;

  async function handleCheckOut() {
    if (!selectedAsset) {
      return;
    }

    setActionError(null);
    setCompletion(null);

    try {
      await createCheckout.mutateAsync({
        object_id: selectedAsset.id,
        user_id: userId,
        time_out: new Date().toISOString(),
        time_in: null,
        notes: "",
      });
      setSelectedAssetId(null);
      setSearch("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : `Could not check out the ${assetLabel}.`,
      );
    }
  }

  async function handleCheckIn(checkout: Checkout) {
    const timeIn = new Date().toISOString();
    const report = returnReport.trim();
    const notes = report
      ? [checkout.notes.trim(), `Return report: ${report}`]
          .filter(Boolean)
          .join("\n")
      : checkout.notes;

    setActionError(null);

    try {
      await updateCheckout.mutateAsync({
        checkOutId: checkout.check_out_id,
        updates: { time_in: timeIn, notes },
      });
      setCompletion({
        checkout,
        assetName:
          assetById.get(checkout.object_id)?.name ??
          `${assetTitle} #${checkout.object_id}`,
        timeIn,
        report,
      });
      setCheckingInId(null);
      setReturnReport("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : `Could not check in the ${assetLabel}.`,
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Welcome, {rowerName}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {assetTitle} Checkouts
        </h2>
        <p className="text-sm text-muted-foreground">
          Find your {assetLabel}, check it out, and check it back in when you
          return.
        </p>
      </header>

      {completion && (
        <Card className="border-emerald-600/30 bg-emerald-600/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Check aria-hidden="true" className="size-5" />
              {assetTitle} checked in
            </CardTitle>
            <CardDescription>{completion.assetName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Checked out</dt>
                <dd className="font-medium">
                  {formatCheckoutTime(completion.checkout.time_out)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Checked in</dt>
                <dd className="font-medium">
                  {formatCheckoutTime(completion.timeIn)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">
                  {formatDuration(
                    completion.checkout.time_out,
                    completion.timeIn,
                  )}
                </dd>
              </div>
            </dl>
            {completion.report && (
              <p className="rounded-lg border bg-background p-3 text-sm">
                <span className="font-medium">Return report:</span>{" "}
                {completion.report}
              </p>
            )}
            <Button onClick={() => setCompletion(null)} variant="outline">
              Find another {assetLabel}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeCheckouts.length > 0 ? (
        <section aria-label="Your active checkouts" className="space-y-4">
          {activeCheckouts.map((checkout) => {
            const asset = assetById.get(checkout.object_id);
            const isCheckingIn = checkingInId === checkout.check_out_id;

            return (
              <Card className="overflow-hidden" key={checkout.check_out_id}>
                <div className="h-1.5 bg-destructive" />
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-destructive">
                      <span className="size-2 animate-pulse rounded-full bg-destructive" />
                      Currently checked out
                    </span>
                    <Clock3
                      aria-hidden="true"
                      className="size-5 text-muted-foreground"
                    />
                  </div>
                  <CardTitle className="pt-2">
                    {asset?.name ?? `${assetTitle} #${checkout.object_id}`}
                  </CardTitle>
                  <CardDescription>
                    Checked out at{" "}
                    <strong>{formatCheckoutTime(checkout.time_out)}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {asset?.specs}
                  {isCheckingIn ? (
                    <div className="space-y-3">
                      <label
                        className="block space-y-2 text-sm font-medium"
                        htmlFor={`return-report-${checkout.check_out_id}`}
                      >
                        Repairs &amp; maintenance
                        <span className="block font-normal text-muted-foreground">
                          Report any damage or issues for the coach.
                        </span>
                        <textarea
                          className="min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          id={`return-report-${checkout.check_out_id}`}
                          onChange={(event) =>
                            setReturnReport(event.target.value)
                          }
                          placeholder="Describe any issues, or leave blank if everything is in good condition."
                          value={returnReport}
                        />
                      </label>
                      {actionError && (
                        <p className="text-sm text-destructive" role="alert">
                          {actionError}
                        </p>
                      )}
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          disabled={isUpdatingCheckout}
                          onClick={() => {
                            setCheckingInId(null);
                            setReturnReport("");
                            setActionError(null);
                          }}
                          type="button"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isUpdatingCheckout}
                          onClick={() => void handleCheckIn(checkout)}
                          type="button"
                        >
                          {isUpdatingCheckout
                            ? "Checking in..."
                            : "Complete check-in"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {actionError && (
                        <p className="text-sm text-destructive" role="alert">
                          {actionError}
                        </p>
                      )}
                      <Button
                        className="w-full"
                        disabled={isUpdatingCheckout}
                        onClick={() => {
                          setCheckingInId(checkout.check_out_id);
                          setActionError(null);
                        }}
                      >
                        Check {assetLabel} back in
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Find {assetArticle} {assetLabel}</CardTitle>
            <CardDescription>
              Search by {assetLabel} name. Close matches are included.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label
              className="relative block"
              htmlFor={`${assetType}-search`}
            >
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                autoComplete="off"
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                id={`${assetType}-search`}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedAssetId(null);
                  setActionError(null);
                }}
                placeholder={`Search ${assetLabel}s...`}
                type="search"
                value={search}
              />
            </label>

            {searchResults.length ? (
              <ul
                aria-label={`Available ${assetLabel}s`}
                className="divide-y overflow-hidden rounded-lg border"
              >
                {searchResults.map((asset) => (
                  <li key={asset.id}>
                    <button
                      aria-pressed={selectedAssetId === asset.id}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                        selectedAssetId === asset.id
                          ? "bg-primary/5 font-medium text-primary"
                          : "bg-card"
                      }`}
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setActionError(null);
                      }}
                      type="button"
                    >
                      <span className="min-w-0 truncate">{asset.name}</span>
                      {selectedAssetId === asset.id && (
                        <Check
                          aria-hidden="true"
                          className="size-4 shrink-0"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {availableAssets.length
                  ? `No ${assetLabel}s match your search.`
                  : `No ${assetLabel}s are available right now.`}
              </p>
            )}

            {selectedAsset && (
              <div className="space-y-3 border-t pt-4">
                {selectedAsset.specs}
                {actionError && (
                  <p className="text-sm text-destructive" role="alert">
                    Could not check out this {assetLabel}: {actionError}
                  </p>
                )}
                <Button
                  className="w-full"
                  disabled={isCreatingCheckout}
                  onClick={() => void handleCheckOut()}
                >
                  {isCreatingCheckout
                    ? "Checking out..."
                    : `${assetType === "boat" ? "Sign out" : "Check out"} ${selectedAsset.name}`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
