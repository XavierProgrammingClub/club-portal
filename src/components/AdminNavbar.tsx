import Link from "next/link";

export const AdminNavbar = () => {
  return (
    <aside>
      <nav>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/users/new">New User</Link>
        <Link href="/admin/clubs">Clubs</Link>
        <Link href="/admin/clubs/new">New Club</Link>
      </nav>
    </aside>
  );
};
