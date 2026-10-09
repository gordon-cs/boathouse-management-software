import { useEffect, useState } from "react";

import { supabase } from "./lib/supabaseClient";
import type { Tables } from "./types/supabase";

function App() {
  type User = Tables<"user">;
  type Boat = Tables<"boat">;

  const [users, setUsers] = useState<User[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getUsers();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getBoats();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      {users.map((user) => (
        <>
          <h2>{user.user_name}</h2>
          <p>
            {user.user_type} single approved:
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
    </div>
  );
}

export default App;
