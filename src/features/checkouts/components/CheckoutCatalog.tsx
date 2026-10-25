import { Fragment } from "react";

import { useBoats } from "@features/boats/hooks/useBoats";
import { useUsers } from "@features/users/hooks/useUsers";

import {
  useAdditionalRowers,
  useCheckouts,
} from "@features/checkouts/hooks/useCheckouts";

function CheckoutCatalog() {
  const boats = useBoats();

  const users = useUsers();

  const checkouts = useCheckouts();

  const additionalRowers = useAdditionalRowers();

  const isPending =
    boats.isPending ||
    users.isPending ||
    checkouts.isPending ||
    additionalRowers.isPending;

  if (isPending) {
    return <p>Loading boathouse data...</p>;
  }

  const error =
    boats.error ?? users.error ?? checkouts.error ?? additionalRowers.error;

  if (error) {
    return <p>Could not load boathouse data: {error.message}</p>;
  }

  const boatsList = boats.data;
  const usersList = users.data;
  const checkoutsList = checkouts.data;
  const additionalRowersList = additionalRowers.data;

  return (
    <>
      {checkoutsList?.map((checkout) => (
        <Fragment key={checkout.check_out_id}>
          <h1>Checkout {checkout.check_out_id}</h1>
          <ul>
            <li>
              Boat:{" "}
              {boatsList?.find((b) => b.boat_id === checkout.boat_id)?.name}
            </li>
            <li>Time in: {checkout.time_in}</li>
            <li>Time out: {checkout.time_out}</li>
          </ul>

          <h2>Users</h2>
          <ul>
            <li>
              {
                usersList?.find((u) => u.user_id === checkout.user_id)
                  ?.user_name
              }
            </li>

            {additionalRowersList
              ?.filter((row) => row.check_out_id === checkout.check_out_id)
              .map((rower) => (
                <li key={rower.user_id}>
                  {
                    usersList?.find((u) => u.user_id === rower.user_id)
                      ?.user_name
                  }
                </li>
              ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}

export default CheckoutCatalog;
