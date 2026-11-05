import { Card, CardContent } from "@/components/ui/card";

interface RowerSeatCardProps {
  seatNumber: number;
  rowerName?: string;
}

export default function RowerSeatCard({
  seatNumber,
  rowerName,
}: RowerSeatCardProps) {
  return (
    <Card
      className={
        rowerName
          ? "border-primary/20 bg-primary/5"
          : "border-dashed bg-muted/30"
      }
      size="sm"
    >
      <CardContent className="flex min-h-16 flex-col justify-center gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          Seat {seatNumber}
        </span>
        <span
          className={
            rowerName
              ? "font-medium text-foreground"
              : "text-sm text-muted-foreground"
          }
        >
          {rowerName ?? "Available"}
        </span>
      </CardContent>
    </Card>
  );
}
