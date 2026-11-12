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
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link
            className="text-primary underline underline-offset-4 hover:decoration-2"
            to={`/boats?boatId=${boatId}`}
          >
            {boat?.name ?? `Boat #${boatId}`}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Rowers</p>
        {rowers.length ? (
          <ul className="mt-1 flex flex-wrap gap-x-2">
            {rowers.map((rower) => (
              <li key={rower.id}>
                <Link
                  className="text-primary underline underline-offset-4 hover:decoration-2"
                  to={`/rowers?rowerId=${encodeURIComponent(rower.id)}`}
                >
                  {rower.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm">No rowers recorded</p>
        )}
      </CardContent>
    </Card>
  );
}
