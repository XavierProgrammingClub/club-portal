import Link from "next/link";
import { useRouter } from "next/router";

export const ClubDashboardNavbar = () => {
  const router = useRouter();

  const { id } = router.query;

  if (!id) return null;

  const baseUrl = `/clubs/${id}/dashboard`;
  return (
    <aside>
      <nav>
        <Link href={`${baseUrl}/`}>Admin Home</Link>
        <Link href={`${baseUrl}/members`}>Members</Link>
        <Link href={`${baseUrl}/members/new`}>New member</Link>
      </nav>
    </aside>
  );
};
