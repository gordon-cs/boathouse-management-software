import { useEffect, useState } from "react";

import { supabase } from "./lib/supabaseClient";
import type { Tables } from "./types/supabase";

function App() {
  type User = Tables<"user">;
  type Boat = Tables<"boat">;
  type Checkout = Tables<"check_out">;
  type AdditionalRower = Tables<"additional_rower">;

  const [users, setUsers] = useState<User[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [additionalRowers, setAdditionalRowers] = useState<AdditionalRower[]>(
    [],
  );

  async function getUsers() {
    const { data, error } = await supabase.from("user").select();

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data);
  }

  async function getBoats() {
    const { data, error } = await supabase.from("boat").select();

    if (error) {
      console.error(error);
      return;
    }

    setBoats(data);
  }

  async function getCheckouts() {
    const { data, error } = await supabase.from("check_out").select();

    if (error) {
      console.error(error);
      return;
    }

    setCheckouts(data);
  }

  async function getAdditionalRowers() {
    const { data, error } = await supabase.from("additional_rower").select();

    if (error) {
      console.error(error);
      return;
    }

    setAdditionalRowers(data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCheckouts();
    getBoats();
    getUsers();
    getAdditionalRowers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      {users.map((user) => (
        <>
          <h2>{user.user_name}</h2>
          <p>
            {user.user_type}, approved to row single:{" "}
            {user.is_single_approved ? "yes" : "no"}
          </p>
        </>
      ))}
      <h1>Boats</h1>
      {boats.map((boat) => (
        <>
          <h2>{boat.name}</h2>
          <p>
            {boat.make}, {boat.seats} seats
          </p>
        </>
      ))}
      {checkouts.map((checkout) => (
        <>
          <h1>Checkout {checkout.check_out_id}</h1>
          <ul>
            <li>
              Boat:{" "}
              {boats.filter((b) => b.boat_id === checkout.boat_id).at(0)?.name}
            </li>
            <li>Time in: {checkout.time_in}</li>

            <li>Time out: {checkout.time_out}</li>
          </ul>
          <h2>Users</h2>
          <ul>
            <li>
              {
                users.filter((u) => u.user_id === checkout.user_id).at(0)
                  ?.user_name
              }
            </li>
            {additionalRowers
              .filter((row) => row.check_out_id === checkout.check_out_id)
              .map((rower) => (
                <li>
                  {
                    users.filter((u) => u.user_id === rower.user_id).at(0)
                      ?.user_name
                  }
                </li>
              ))}
          </ul>
        </>
      ))}
    </div>
  );
}

export default App;
