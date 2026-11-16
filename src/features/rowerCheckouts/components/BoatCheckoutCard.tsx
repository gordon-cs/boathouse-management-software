
import { Link } from "react-router-dom";
import type { Boat } from "@features/boats/api/boats.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type BoatCheckoutRower = {
  id: string;
  name: string;
};

export default function BoatCheckoutCard({
  boat,
  boatId,
  rowers,
}: {
  boat: Boat | undefined;
  boatId: number;
  rowers: BoatCheckoutRower[];
}) {
  const capacity = boat?.seats ?? rowers.length;
  const availableSeats = Math.max(0, capacity - rowers.length);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>
            <Link
              className="text-primary underline underline-offset-4 hover:decoration-2"
              to={`/boats?boatId=${boatId}`}
            >
              {boat?.name ?? `Boat #${boatId}`}
            </Link>
          </CardTitle>

          <span className="text-sm text-muted-foreground">
            {rowers.length}/{capacity} seats occupied
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <p className="mb-3 text-sm font-medium">Rowers</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rowers.map((rower, index) => (
            <div
              key={rower.id}
              className="rounded-lg border bg-muted/40 p-3"
            >
              <p className="text-xs text-muted-foreground">
                Seat {index + 1}
              </p>

              <Link
                className="text-sm font-medium text-primary underline underline-offset-4 hover:decoration-2"
                to={`/rowers?rowerId=${encodeURIComponent(rower.id)}`}
              >
                {rower.name}
              </Link>
            </div>
          ))}

          {Array.from({ length: availableSeats }, (_, index) => (
            <div
              key={`available-${index}`}
              className="rounded-lg border border-dashed p-3"
            >
              <p className="text-xs text-muted-foreground">
                Seat {rowers.length + index + 1}
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
