import RowerCheckoutFlow from "@features/rowerCheckouts/components/RowerCheckoutFlow";
import RowerCheckoutMenu from "@features/rowerCheckouts/components/RowerCheckoutMenu";

export default function RowerErgCheckouts() {
  return (
    <main className="min-h-svh bg-muted/40 px-4 pb-8 text-left sm:px-6 lg:px-8">
      <div className="mx-auto mt-4 flex w-full max-w-7xl flex-col gap-6">
        <RowerCheckoutMenu />
        <RowerCheckoutFlow assetType="erg" />
      </div>
    </main>
  );
}
