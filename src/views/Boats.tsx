import BoatStats from "@features/boats/components/BoatStats";
import { useBoats } from "@features/boats/hooks/useBoats";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardNavbar from "@/components/ui/DashboardNavbar";

function Boats() {
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

  return (
    <main className="min-h-svh bg-muted/40 px-4 py-8 text-left sm:px-6 lg:px-8">
      <DashboardNavbar />
      <div className="grid grid-cols-3">
        <div className="gap-4 col-start-2 col-span-2 mx-auto flex w-full max-w-7xl flex-col gap-8">
          <Card className = " grid grid-cols-2 gap-4">
            <CardHeader>
              <CardTitle className="px-10 py-10 text-2xl">{boatsList?.[0]?.name}</CardTitle>
            </CardHeader>
            <CardContent className="col-start-1">
              <BoatStats />
            </CardContent>
            <Textarea placeholder="Notes" />
          </Card>
        </div>
      </div>
    </main>
  );
}
export default Boats;