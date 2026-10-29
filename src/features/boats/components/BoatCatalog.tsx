import { useBoats } from "../hooks/useBoats";

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

  if (!boatsList?.length) {
    return <p className="text-sm text-muted-foreground">No boats found.</p>;
  }

  return (
    <ul className="space-y-3">
      {boatsList.map((boat) => (
        <li
          className="rounded-lg border bg-background p-3"
          key={boat.boat_id}
        >
          <p className="font-medium text-foreground">
            {boat.name ?? "Unnamed boat"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {boat.make ?? "Make not provided"} · {boat.seats} seats
          </p>
        </li>
      ))}
    </ul>
  );
}

export default BoatCatalog;
