import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

const checkoutViews = [
  { label: "Boat checkout", path: "/rower-checkouts" },
  { label: "Erg checkout", path: "/rower-erg-checkouts" },
];

export default function RowerCheckoutMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);
    setIsSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Could not log out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="relative flex justify-end">
      <Button
        aria-controls="rower-checkout-menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close checkout menu" : "Open checkout menu"}
        onClick={() => setIsOpen((open) => !open)}
        disabled={isSigningOut}
        size="icon"
        variant="outline"
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      <nav
        aria-label="Rower checkout views"
        className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border bg-popover p-1 shadow-lg"
        hidden={!isOpen}
        id="rower-checkout-menu"
      >
        {checkoutViews.map(({ label, path }) => (
          <NavLink
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm ${
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-foreground hover:bg-accent"
              }`
            }
            key={path}
            onClick={() => setIsOpen(false)}
            to={path}
          >
            {label}
          </NavLink>
        ))}
        <div className="my-1 border-t" />
        <Button
          className="w-full justify-start"
          disabled={isSigningOut}
          onClick={() => void handleLogout()}
          variant="ghost"
        >
          <LogOut aria-hidden="true" />
          {isSigningOut ? "Logging out..." : "Log out"}
        </Button>
        {logoutError && (
          <p className="px-3 py-2 text-sm text-destructive" role="alert">
            Could not log out: {logoutError}
          </p>
        )}
      </nav>
    </div>
  );
}
