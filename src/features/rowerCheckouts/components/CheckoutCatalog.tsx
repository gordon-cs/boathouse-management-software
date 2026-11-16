
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveCheckouts } from "../hooks/useActiveCheckouts";
import RowerCheckoutNew from "@/views/rower/CheckoutNew";
import BoatCheckoutCard from "./BoatCheckoutCard";

export default function CheckoutCatalog() {
  const {
    data: activeCheckouts,
    isPending,
    error,
  } = useActiveCheckouts();

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading current checkouts...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load current checkouts: {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Active checkouts
        </h1>

        <p className="text-sm text-muted-foreground">
          View boats currently checked out and their rowers.
        </p>
      </header>

      <section
        aria-label="Currently checked-out boats"
        className="max-h-[min(68svh,56rem)] min-h-64 space-y-4 overflow-y-auto pr-2"
      >
        {activeCheckouts?.length ? (
          activeCheckouts.map((checkout) => (
            <BoatCheckoutCard
              key={checkout.check_out_id}
              boat={checkout.boat}
              boatId={checkout.boatId}
              rowers={checkout.rowers}
            />
          ))
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-center">
            <div className="space-y-2">
              <h2 className="font-medium">
                No boats are checked out
              </h2>

              <p className="text-sm text-muted-foreground">
                New checkouts will appear here.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="flex justify-end border-t pt-5">
        <Button asChild>
          <Link to="/rower-checkouts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create new checkout
          </Link>
        </Button>
      </div>
    </div>
  );
}
