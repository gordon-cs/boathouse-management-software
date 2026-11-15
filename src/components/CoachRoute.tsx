import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabaseClient";

type CoachAccess =
  | { userId: string; status: "loading" }
  | { userId: string; status: "allowed" }
  | { userId: string; status: "denied" }
  | { userId: string; status: "error"; message: string };

export default function CoachRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const userId = session?.user.id;
  const [access, setAccess] = useState<CoachAccess | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const coachId = userId;
    let active = true;

    async function checkCoachAccess() {
      try {
        const { data, error } = await supabase
          .from("coaches")
          .select("coach_id")
          .eq("coach_id", coachId)
          .maybeSingle();

        if (!active) {
          return;
        }

        if (error) {
          console.error("Could not check coach access:", error);
          setAccess({ userId: coachId, status: "error", message: error.message });
          return;
        }

        setAccess({
          userId: coachId,
          status: data ? "allowed" : "denied",
        });
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        console.error("Could not check coach access:", error);
        setAccess({ userId: coachId, status: "error", message });
      }
    }

    void checkCoachAccess();

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

  if (!access || access.userId !== session.user.id || access.status === "loading") {
    return <p>Checking coach access...</p>;
  }

  if (access.status === "error") {
    return <p role="alert">Could not verify coach access: {access.message}</p>;
  }

  if (access.status === "denied") {
    return (<Navigate
        to="/rower-checkouts"
        replace
        state={{ from: location }}
      />);
  }

  return <Outlet />;
}
