
import { useState } from "react";
import type { ComponentProps } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Ship, Users, Wrench, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

const navItems = [
  { label: "Boats", path: "/boats", icon: Ship },
  { label: "Rowers", path: "/rowers", icon: Users },
  { label: "Repairs", path: "/repairs", icon: Wrench },
];

export default function DashboardNavbar({
  className,
  ...props
}: ComponentProps<"header">) {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setLogoutError(null);
    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Could not sign out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header
      {...props}
      className={cn("flex w-full items-center gap-2 border-b px-4 py-3", className)}
    >
      <nav
        className="flex items-center gap-2"
        aria-label="Dashboard navigation"
      >
        {navItems.map(({ label, path, icon: Icon }) => (
          <Button key={path} asChild variant="ghost">
            <NavLink
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "bg-accent text-accent-foreground"
                  : ""
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </NavLink>
          </Button>
        ))}
      </nav>

      <div className="ml-auto">
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Logging Out..." : "Log Out"}
        </Button>
        {logoutError && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {logoutError}
          </p>
        )}
      </div>
    </header>
  );
}
