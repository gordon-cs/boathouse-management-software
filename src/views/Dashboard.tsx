import BoatCatalog from "@features/boats/components/BoatCatalog";
import UserCatalog from "@features/users/components/UserCatalog";
import CheckoutCatalog from "@features/checkouts/components/CheckoutCatalog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Dashboard() {
  return (
    <main className="min-h-svh bg-muted/40 px-4 py-8 text-left sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Boathouse management
          </p>
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            A quick look at the people, boats, and checkouts in your boathouse.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                People registered with the boathouse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserCatalog />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Boats</CardTitle>
              <CardDescription>Equipment available to rowers.</CardDescription>
            </CardHeader>
            <CardContent>
              <BoatCatalog />
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Checkouts</CardTitle>
              <CardDescription>
                Recent boat checkouts and their rowers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutCatalog />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;