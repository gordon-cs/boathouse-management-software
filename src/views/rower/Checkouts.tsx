import CheckoutCatalog from "@/features/rowerCheckouts/components/CheckoutCatalog";

export default function Checkouts() {
  return (
    <main className="min-h-svh bg-muted/40 px-4 pb-8 text-left sm:px-6 lg:px-8">

      <div className="mt-4 mx-auto flex w-full max-w-7xl flex-col gap-6">
        <CheckoutCatalog />
      </div>
    </main>
  );
}