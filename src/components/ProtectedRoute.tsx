import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>; // Replace with your spinner/skeleton
  }

  // Redirect to login if unauthorized, otherwise render nested matching child routes
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}