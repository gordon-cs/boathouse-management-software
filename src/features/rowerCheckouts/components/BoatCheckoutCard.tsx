import type { Boat } from "@features/boats/api/boats.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RowerSeatCard from "./RowerSeatCard";

export interface BoatCheckoutRower {
  id: string;
  name: string;
}

interface BoatCheckoutCardProps {
  boat: Boat | undefined;
  boatId: number;
  rowers: BoatCheckoutRower[];
}

export default function BoatCheckoutCard({
  boat,
  boatId,
  rowers,
}: BoatCheckoutCardProps) {
  const seatCount = Math.max(boat?.seats ?? 0, rowers.length, 1);
  const boatName = boat?.name ?? `Boat #${boatId}`;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{boatName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {boat?.make ?? "Boat"} · {boat?.year ?? "Year not listed"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {rowers.length}/{boat?.seats ?? seatCount} occupied
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: seatCount }, (_, index) => (
            <RowerSeatCard
              key={rowers[index]?.id ?? `available-${index + 1}`}
              seatNumber={index + 1}
              rowerName={rowers[index]?.name}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
