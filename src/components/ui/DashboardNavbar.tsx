
import { NavLink, useNavigate } from "react-router-dom";
import { Ship, Users, Wrench, LogOut, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Boats", path: "/boats", icon: Ship },
  { label: "Checkouts", path: "/checkouts", icon: ClipboardList },
  { label: "Rowers", path: "/rowers", icon: Users },
  { label: "Repairs", path: "/repairs", icon: Wrench },
];

export default function DashboardNavbar() {
  const navigate = useNavigate();

  function handleLogout() {
    // TODO: Sign out through your authentication provider first.
    navigate("/login");
  }

  return (
    <header className="flex w-full items-center gap-2 border-b px-4 py-3">
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
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </header>
  );
}
