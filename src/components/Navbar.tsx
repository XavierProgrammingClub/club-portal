import Link from "next/link";
import { signOut } from "next-auth/react";

import { useUser } from "@/hooks/useUser";
import { queryClient } from "@/pages/_app";
export const Navbar = () => {
  const { data, isLoading, isError } = useUser();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    await queryClient.refetchQueries(["current-user"]);
  };

  const renderAuthLinks = () => {
    if (!data?.user || isError)
      return (
        <>
          <Link href="/auth/signin">Sign In</Link>
        </>
      );

    const logoutButton = <button onClick={handleLogout}>Logout</button>;

    if (data?.user.role === "superuser") {
      return (
        <>
          <Link href="/admin">Admin</Link>
          {logoutButton}
        </>
      );
    }
    return logoutButton;
  };

  return (
    <nav>
      <Link href="/">Home </Link>
      {renderAuthLinks()}
    </nav>
  );
};
