
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Wait until Supabase checks the current session.
  if (loading) {
    return <p>Loading...</p>;
  }

  // Redirect unauthenticated users to the login page.
  if (!session) {
    return (
      <Navigate
        to="/Login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Allow authenticated users to access the requested page.
  return <Outlet />;
}
