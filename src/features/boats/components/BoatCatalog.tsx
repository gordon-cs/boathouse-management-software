import { Fragment } from "react";
import { useBoats } from "../hooks/useBoats";

function BoatCatalog() {
  const {
    error: boatsError,
    isPending: boatsPending,
    data: boatsList,
  } = useBoats();

  if (boatsPending) {
    return <p>Loading boats...</p>;
  }

  if (boatsError) {
    return <p>Could not load boats: {boatsError.message}</p>;
  }

  return (
    <>
      <h1>Boats</h1>
      {boatsList?.map((boat) => (
        <Fragment key={boat.boat_id}>
          <h2>{boat.name}</h2>
          <p>
            {boat.make}, {boat.seats} seats
          </p>
        </Fragment>
      ))}
    </>
  );
}

export default BoatCatalog;
