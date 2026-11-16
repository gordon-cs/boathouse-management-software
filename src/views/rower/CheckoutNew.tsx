
import RowerCheckoutMenu from "@features/rowerCheckouts/components/RowerCheckoutMenu";
import RowerCheckoutFlow from "@features/rowerCheckouts/components/RowerCheckoutFlow";

export default function RowerCheckoutNew() {
  return (
    <main className="min-h-svh bg-muted/40 px-4 pb-8 text-left sm:px-6 lg:px-8">

      <div className="mt-4 mx-auto flex w-full max-w-7xl flex-col gap-6">
        <RowerCheckoutMenu />
        <RowerCheckoutFlow assetType="boat" />
      </div>
    </main>
  );
}