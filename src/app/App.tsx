import { AuthProvider } from "@context/AuthContext";
import Login from "@views/Login";
import SignUp from "@views/SignUp";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Dashboard from "@views/Dashboard";
import ProtectedRoute from "@components/ProtectedRoute";
import Boats from "@/views/Boats";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes, add new views here */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/boats" element={<Boats />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}