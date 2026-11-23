
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RowerCheckoutMenu from "@features/rowerCheckouts/components/RowerCheckoutMenu";
import RowerCheckoutFlow from "@features/rowerCheckouts/components/RowerCheckoutFlow";

export default function RowerCheckoutNew() {
  const [searchParams, setSearchParams] = useSearchParams();
  const boatName = searchParams.get("boat")?.trim();
  const [showEnjoyScreen, setShowEnjoyScreen] = useState(
    searchParams.get("joined") === "true",
  );

  function handleEndSession() {
    setSearchParams({}, { replace: true });
    setShowEnjoyScreen(false);
  }

  return (
    <main className="min-h-svh bg-muted/40 px-4 pb-8 text-left sm:px-6 lg:px-8">

      <div className="mt-4 mx-auto flex w-full max-w-7xl flex-col gap-6">
        <RowerCheckoutMenu />
        {showEnjoyScreen ? (
          <Card className="mx-auto w-full max-w-2xl text-center">
            <CardHeader>
              <CardTitle className="text-3xl">
                Enjoy your row
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                {boatName
                  ? `You joined ${boatName}.`
                  : "You joined the boat."}
              </p>
              <Button className="w-full" onClick={handleEndSession}>
                End Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <RowerCheckoutFlow assetType="boat" />
        )}
      </div>
    </main>
  );
}