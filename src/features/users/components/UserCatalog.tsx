import { useUsers } from "../hooks/useUsers";

function UserCatalog() {
  const {
    error: usersError,
    isPending: usersPending,
    data: usersList,
  } = useUsers();

  if (usersPending) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>;
  }

  if (usersError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Could not load users: {usersError.message}
      </p>
    );
  }

  if (!usersList?.length) {
    return <p className="text-sm text-muted-foreground">No users found.</p>;
  }

  return (
    <ul className="space-y-3">
      {usersList.map((user) => (
        <li
          className="rounded-lg border bg-background p-3"
          key={user.user_id}
        >
          <p className="font-medium text-foreground">{user.user_name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.user_type} · Single-seat approval:{" "}
            {user.is_single_approved ? "Yes" : "No"}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default UserCatalog;
