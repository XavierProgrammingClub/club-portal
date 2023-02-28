import Link from "next/link";

export const AdminNavbar = () => {
  return (
    <aside>
      <nav>
        <Link href="/admin">Admin Home</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/users/new">New User</Link>
      </nav>
    </aside>
  );
};
