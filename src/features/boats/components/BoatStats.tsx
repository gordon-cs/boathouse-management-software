import type { Boat } from "../api/boats.api";

function BoatStats({ boat }: { boat: Boat }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">Make</dt>
        <dd>{boat.make ?? "Not recorded"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Year</dt>
        <dd>{boat.year ?? "Not recorded"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Seats</dt>
        <dd>{boat.seats}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Inboard</dt>
        <dd>{boat.inboard === null ? "Not recorded" : `${boat.inboard} in`}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Weight class</dt>
        <dd>
          {boat.min_weight ?? "?"}–{boat.max_weight ?? "?"} lbs
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Pitch</dt>
        <dd>{boat.pitch ?? "Not recorded"}</dd>
      </div>
    </dl>
  );
}

export default BoatStats;
