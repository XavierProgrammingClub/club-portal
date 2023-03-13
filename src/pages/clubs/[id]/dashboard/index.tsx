import { useRouter } from "next/router";
import { CldImage } from "next-cloudinary";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { ClubDashboardNavbar } from "@/components/ClubDashboardNavbar";
import { useSingleClub } from "@/hooks/useClub";

const ClubDashboard = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data } = useSingleClub({ id: id as string, enabled: router.isReady });
  //
  // if (!id) return null;
  // if (!data?.club) return;

  return (
    <>
      <ClubDashboardLayout>
        {/*<ClubDashboardNavbar />*/}

        {data ? (
          <CldImage
            width="50"
            height="50"
            src={data.club.profilePic}
            alt="Description of my image"
          />
        ) : null}
      </ClubDashboardLayout>
    </>
  );
};

export default ClubDashboard;
