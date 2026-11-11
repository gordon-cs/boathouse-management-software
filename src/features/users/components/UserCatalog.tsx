import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";

import type { User } from "../api/users.api";
import { getUserDisplayName } from "../api/users.api";
import { useUsers } from "../hooks/useUsers";

const columns: DataTableColumn<User>[] = [
  {
    id: "name",
    header: "Name",
    getValue: getUserDisplayName,
  },
  {
    id: "type",
    header: "Type",
    getValue: (user) => user.user_type,
  },
  {
    id: "single-seat-approval",
    header: "Single-seat approval",
    getValue: (user) => user.is_single_approved === true,
  },
];

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

  return (
    <DataTable
      columns={columns}
      emptyMessage="No users found."
      getRowId={(user) => user.user_id}
      rows={usersList ?? []}
      searchLabel="Search users"
    />
  );
}

export default UserCatalog;
