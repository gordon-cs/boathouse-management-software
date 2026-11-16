import DashboardNavbar from "@/components/ui/DashboardNavbar";
import CheckoutCatalog from "@features/rowerCheckouts/components/CheckoutCatalog";

export default function RowerCheckouts() {
  return (
    <main className="min-h-svh bg-muted/40 px-4 pb-8 text-left sm:px-6 lg:px-8">
      <DashboardNavbar className="-mx-4 mb-8 sm:-mx-6 lg:-mx-8" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Boathouse management
          </p>
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-foreground">
            Rower checkout
          </h1>
          <p className="text-sm text-muted-foreground">
            See which boats are out and who is seated in each one.
          </p>
        </header>
        <CheckoutCatalog />
      </div>
    </main>
  );
}
