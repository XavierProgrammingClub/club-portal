import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { useSingleClub } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";

export const ClubDashboardNavbar = () => {
  const router = useRouter();

  const { id } = router.query;
  const { data: userData, isLoading: isUserLoading } = useUser();
  const { data, isLoading: isClubLoading } = useSingleClub({
    id: id as string,
  });

  const currentClubUser = useMemo(
    () => data?.club.members.find((d) => d.user._id === userData?.user._id),
    [data]
  );

  if (!id) return null;
  if (!isUserLoading && !isClubLoading && !currentClubUser) {
    router.push("/");
    return null;
  }

  const baseUrl = `/clubs/${id}/dashboard`;
  return (
    <aside>
      <nav>
        <Link href={`${baseUrl}/`}>Admin Home</Link>
        <Link href={`${baseUrl}/members`}>Members</Link>
        <Link href={`${baseUrl}/settings`}>Edit Club Details</Link>
      </nav>
    </aside>
  );
};
