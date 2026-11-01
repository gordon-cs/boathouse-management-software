/**
 * BoatStats component displays the statistics of the first boat in the list.
 * It should eventually show whatever boat is selected
 * The notes should also eventually be saved in the database.
 * @returns JSX.Element displaying the boat statistics.
 */


import { useBoats } from "../hooks/useBoats";
import { Card } from "@/components/ui/card";

function BoatStats() {
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
    <Card className="grid grid-cols-2 gap-4 border-none shadow-none ring-0 px-6">
    <div>
        Make:
        <br />
        {boatsList?.[0]?.make}
        <br />
        <br />
        Year:
        <br />
        {boatsList?.[0]?.year}
        <br />
        <br />
        Seats:
        <br />
        {boatsList?.[0]?.seats}  
    </div>
    <div>
        Inboard:
        <br />
        {boatsList?.[0]?.inboard}
        "
        <br />
        <br />
        Weight Class:
        <br />
        {boatsList?.[0]?.min_weight}
        -
        {boatsList?.[0]?.max_weight}
        lbs
        <br />
        <br />
        Pitch:
        <br />
        {boatsList?.[0]?.pitch}
    </div>
    </Card>
  );
}

export default BoatStats;
