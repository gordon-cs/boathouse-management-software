import type { ReactNode } from "react";

import DashboardNavbar from "@/components/ui/DashboardNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RecordBrowserLayoutProps = {
  title: string;
  description: string;
  listTitle: string;
  listDescription: string;
  list: ReactNode;
  children: ReactNode;
};

function RecordBrowserLayout({
  title,
  description,
  listTitle,
  listDescription,
  list,
  children,
}: RecordBrowserLayoutProps) {
  return (
    <main className="min-h-svh bg-muted/40 px-4 py-8 text-left sm:px-6 lg:px-8">
      <DashboardNavbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </header>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,2fr)]">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>{listTitle}</CardTitle>
              <CardDescription>{listDescription}</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">{list}</CardContent>
          </Card>
          <section aria-label={`${title} details`} className="min-w-0 space-y-6">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

export default RecordBrowserLayout;
