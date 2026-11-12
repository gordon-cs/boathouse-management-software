import { AuthProvider } from "@context/AuthContext";
import Login from "@views/Login";
import SignUp from "@views/SignUp";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Dashboard from "@/views/coach/Dashboard";
import ProtectedRoute from "@components/ProtectedRoute";
import Boats from "@/views/coach/Boats";
import Repairs from "@/views/coach/Repairs";
import Checkouts from "@/views/coach/Checkouts";
import Rowers from "@/views/coach/Rowers";
import RowerCheckouts from "@/views/rower/Checkouts";

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
            <Route path="/rowers" element={<Rowers />} />
            <Route path="/repairs/:repairId?" element={<Repairs />} />
            <Route path="/checkouts/:checkoutId?" element={<Checkouts />} />
            <Route path="/rower-checkouts" element={<RowerCheckouts />} />
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