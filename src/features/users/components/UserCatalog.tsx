import { Fragment } from "react";
import { useUsers } from "../hooks/useUsers";

function UserCatalog() {
  const {
    error: usersError,
    isPending: usersPending,
    data: usersList,
  } = useUsers();

  if (usersPending) {
    return <p>Loading boats...</p>;
  }

  if (usersError) {
    return <p>Could not load boats: {usersError.message}</p>;
  }

  return (
    <>
      <h1>Users</h1>
      {usersList?.map((user) => (
        <Fragment key={user.user_id}>
          <h2>{user.user_name}</h2>
          <p>
            {user.user_type}, approved to row single:{" "}
            {user.is_single_approved ? "yes" : "no"}
          </p>
        </Fragment>
      ))}
    </>
  );
}

export default UserCatalog;
