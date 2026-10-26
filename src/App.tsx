import { useEffect, useState, type FormEvent } from "react";

import "./App.css";
import { supabase } from "./lib/supabaseClient";
import type { Tables } from "./types/supabase";

type User = Tables<"user">;
type Boat = Tables<"boat">;
type Checkout = Tables<"check_out">;

function getLocalDateTime() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":");

  return { date, time };
}

function formatTime(value: string | null) {
  if (!value) return "Time not recorded";

  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hours, minutes));
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedBoatId, setSelectedBoatId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCheckoutOptions() {
      const [usersResult, boatsResult, checkoutsResult] = await Promise.all([

        
        supabase.from("user").select().order("user_name"),
        supabase.from("boat").select().order("name"),
        supabase.from("check_out").select(),
      ]);

      console.log("Rower data:", usersResult.data);
      console.log("Rower query error:", usersResult.error);
      console.log("Users:", usersResult);
      console.log("Boats:", boatsResult);
      console.log("Checkouts:", checkoutsResult);

      if (usersResult.error) throw usersResult.error;
      if (boatsResult.error) throw boatsResult.error;
      if (checkoutsResult.error) throw checkoutsResult.error;

      if (isMounted) {
        setUsers(usersResult.data);
        setBoats(boatsResult.data);
        setCheckouts(checkoutsResult.data);
      }
    }

    loadCheckoutOptions()
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : String(error),
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCheckouts = checkouts.filter(
    (checkout) => checkout.time_in === null,
  );
  const activeBoatIds = new Set(
    activeCheckouts.map((checkout) => checkout.boat_id),
  );
  const selectedUser = users.find(
    (user) => user.user_id === Number(selectedUserId),
  );
  const availableBoats = boats.filter((boat) => {
    const isApprovedForSingle = selectedUser?.is_single_approved === true;
    return (
      !activeBoatIds.has(boat.boat_id) &&
      (boat.seats !== 1 || isApprovedForSingle)
    );
  });
  const selectedBoat = boats.find(
    (boat) => boat.boat_id === Number(selectedBoatId),
  );

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const boatId = Number(selectedBoatId);
    const userId = Number(selectedUserId);
    if (
      !boatId ||
      !userId ||
      !availableBoats.some((boat) => boat.boat_id === boatId)
    ) {
      setErrorMessage("Choose a rower and an available boat to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const latestCheckoutResult = await supabase
        .from("check_out")
        .select("check_out_id")
        .order("check_out_id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestCheckoutResult.error) throw latestCheckoutResult.error;

      const { date, time } = getLocalDateTime();
      const checkoutId = (latestCheckoutResult.data?.check_out_id ?? 0) + 1;
      const insertResult = await supabase.from("check_out").insert({
        check_out_id: checkoutId,
        boat_id: boatId,
        user_id: userId,
        date,
        time_out: time,
        time_in: null,
      });

      if (insertResult.error) throw insertResult.error;

      const newCheckout: Checkout = {
        check_out_id: checkoutId,
        boat_id: boatId,
        user_id: userId,
        date,
        time_out: time,
        time_in: null,
      };

      setCheckouts((currentCheckouts) => [...currentCheckouts, newCheckout]);
      setSelectedBoatId("");
      setSuccessMessage("Checkout recorded. Have a safe row!");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function getUserName(userId: number) {
    return (
      users.find((user) => user.user_id === userId)?.user_name ?? "Unknown rower"
    );
  }

  return (
    <main className="checkout-page">
      <header className="page-header">
        <a className="brand" href="/" aria-label="Boathouse home">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>Gordon Rowing Association</span>
        </a>
        <span className="header-label">BOATHOUSE</span>
      </header>

      <div className="page-content">
        <section className="page-intro" aria-labelledby="page-title">
          <p className="eyebrow">BOAT LOG</p>
          <h1 id="page-title">Check out a boat</h1>
          <p className="intro-copy">
            Select a rower and an available boat to start a session.
          </p>
        </section>

        {errorMessage && (
          <div className="feedback feedback-error" role="alert">
            <span className="feedback-icon" aria-hidden="true">
              !
            </span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="feedback feedback-success" role="status">
            <span className="feedback-icon" aria-hidden="true">
              ✓
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="checkout-layout">
          <section className="checkout-card" aria-labelledby="form-title">
            <div className="card-heading">
              <div className="step-number" aria-hidden="true">
                01
              </div>
              <div>
                <h2 id="form-title">Start a checkout</h2>
                <p>Who is taking a boat out?</p>
              </div>
            </div>

            {isLoading ? (
              <p className="loading-message" role="status">
                Loading rowers and boats…
              </p>
            ) : (
              <form className="checkout-form" onSubmit={handleCheckout}>
                <label className="form-field" htmlFor="rower">
                  <span className="field-label">Rower</span>
                  <select
                    id="rower"
                    value={selectedUserId}
                    onChange={(event) => {
                      setSelectedUserId(event.target.value);
                      setSelectedBoatId("");
                    }}
                    required
                  >
                    <option value="">Select a rower</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.user_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field" htmlFor="boat">
                  <span className="field-label">Available boat</span>
                  <select
                    id="boat"
                    value={selectedBoatId}
                    onChange={(event) => setSelectedBoatId(event.target.value)}
                    required
                    disabled={!selectedUser || availableBoats.length === 0}
                  >
                    <option value="">
                      {!selectedUser
                        ? "Select a rower first"
                        : availableBoats.length
                          ? "Select a boat"
                          : "No boats available"}
                    </option>
                    {availableBoats.map((boat) => (
                      <option key={boat.boat_id} value={boat.boat_id}>
                        {boat.name ?? `Boat ${boat.boat_id}`}
                        {boat.make ? ` · ${boat.make}` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="field-hint">
                    {selectedUser?.is_single_approved === true
                      ? `${availableBoats.length} ${
                          availableBoats.length === 1 ? "boat" : "boats"
                        } available`
                      : "Single boats are limited to approved rowers."}
                  </span>
                </label>

                {selectedBoat && (
                  <div className="boat-summary" aria-live="polite">
                    <div className="boat-icon" aria-hidden="true">
                      ≋
                    </div>
                    <div className="boat-summary-copy">
                      <strong>
                        {selectedBoat.name ?? `Boat ${selectedBoat.boat_id}`}
                      </strong>
                      <span>
                        {selectedBoat.make ?? "Make not listed"} ·{" "}
                        {selectedBoat.seats}{" "}
                        {selectedBoat.seats === 1 ? "seat" : "seats"}
                      </span>
                    </div>
                    <span className="available-tag">AVAILABLE</span>
                  </div>
                )}

                <button
                  className="submit-button"
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isLoading ||
                    users.length === 0 ||
                    availableBoats.length === 0
                  }
                >
                  {isSubmitting ? "Recording checkout…" : "Check out boat"}
                  {!isSubmitting && (
                    <span aria-hidden="true" className="button-arrow">
                      →
                    </span>
                  )}
                </button>
                <p className="form-footnote">
                  Checkout time is recorded automatically.
                </p>
              </form>
            )}
          </section>

          <aside className="active-card" aria-labelledby="active-title">
            <div className="active-card-heading">
              <div>
                <p className="eyebrow">ON THE WATER</p>
                <h2 id="active-title">Currently out</h2>
              </div>
              <span className="active-count">{activeCheckouts.length}</span>
            </div>

            {isLoading ? (
              <p className="empty-state">Loading active checkouts…</p>
            ) : activeCheckouts.length > 0 ? (
              <ul className="active-list">
                {activeCheckouts.map((checkout) => {
                  const boat = boats.find(
                    (item) => item.boat_id === checkout.boat_id,
                  );

                  return (
                    <li className="active-item" key={checkout.check_out_id}>
                      <span className="active-item-icon" aria-hidden="true">
                        ≋
                      </span>
                      <span className="active-item-copy">
                        <strong>
                          {boat?.name ?? `Boat ${checkout.boat_id}`}
                        </strong>
                        <span>{getUserName(checkout.user_id)}</span>
                      </span>
                      <span className="active-item-time">
                        {formatTime(checkout.time_out)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">
                  ≋
                </span>
                <p>No boats are out right now.</p>
                <span>Checkouts will appear here.</span>
              </div>
            )}

            <div className="active-card-footer">
              <span className="status-dot" aria-hidden="true" />
              Current checkout status
            </div>
          </aside>
        </div>
      </div>

      <footer className="page-footer">
        <span>Gordon Rowing Association</span>
        <span>Need help? Ask your coach.</span>
      </footer>
    </main>
  );
}

export default App;