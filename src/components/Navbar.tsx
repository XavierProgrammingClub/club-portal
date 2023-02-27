import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export const Navbar = () => {
  const user = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
  };

  const renderAuthLinks = () => {
    if (user.status === "unauthenticated")
      return (
        <>
          <Link href="/auth/signin">Sign In </Link>
          <Link href="/auth/signup">Sign Up </Link>
        </>
      );

    if (user.status === "authenticated")
      return <button onClick={handleLogout}>Logout</button>;
  };

  return (
    <nav>
      <Link href="/">Home </Link>
      {renderAuthLinks()}
    </nav>
  );
};
