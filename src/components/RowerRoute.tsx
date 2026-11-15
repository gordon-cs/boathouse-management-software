import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { isCoach } from "@features/users/api/coaches.api";

type CoachAccess =
  | { userId: string; status: "loading" }
  | { userId: string; status: "allowed" }
  | { userId: string; status: "denied" }
  | { userId: string; status: "error"; message: string };

export default function RowerRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const userId = session?.user.id;
  const [access, setAccess] = useState<CoachAccess | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const rowerId = userId;
    let active = true;

    async function checkRowerAccess() {
      try {
        const coachAccess = await isCoach(rowerId);

        if (active) {
          setAccess({
            userId: rowerId,
            status: coachAccess ? "denied" : "allowed",
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        console.error("Could not check rower access:", error);
        setAccess({ userId: rowerId, status: "error", message });
      }
    }

    void checkRowerAccess();

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <Navigate
        to="/Login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    !access ||
    access.userId !== session.user.id ||
    access.status === "loading"
  ) {
    return <p>Checking rower access...</p>;
  }

  if (access.status === "error") {
    return <p role="alert">Could not verify rower access: {access.message}</p>;
  }

  if (access.status === "denied") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
