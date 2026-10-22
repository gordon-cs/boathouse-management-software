
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoggingOut(false);
      return;
    }

    navigate("/login", { replace: true });
  }

  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <h1>Dashboard</h1>
          <p>Welcome! This is your dashboard.</p>
        </div>

        <button onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </header>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={cardStyle}>
          <h3>Total Projects</h3>
          <p style={statStyle}>0</p>
          <p>Projects will appear here.</p>
        </div>

        <div style={cardStyle}>
          <h3>Recent Activity</h3>
          <p style={statStyle}>0</p>
          <p>Your recent actions will appear here.</p>
        </div>

        <div style={cardStyle}>
          <h3>Account Status</h3>
          <p style={statStyle}>Active</p>
          <p>You are signed in.</p>
        </div>
      </section>

      <section style={cardStyle}>
        <h2>Quick Links</h2>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Profile (placeholder)</Link>
          </li>
          <li>
            <Link to="/settings">Settings (placeholder)</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 24,
  border: "1px solid #ddd",
  borderRadius: 12,
  backgroundColor: "#fff",
  color: "#222",
};

const statStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: "bold",
  margin: "12px 0",
};
