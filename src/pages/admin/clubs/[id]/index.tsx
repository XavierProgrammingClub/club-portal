import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { CldImage } from "next-cloudinary";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IClub } from "@/models/club";

const getClub = async (
  id: string
): Promise<{
  status: "OK" | "ERROR";
  club: IClub;
}> => {
  return axios.get(`/api/clubs/${id}`);
};

const AdminSingleClub = () => {
  const { data: userData } = useUser();
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, isError } = useQuery(["club", id], () =>
    getClub(id as string)
  );

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  return (
    <>
      <AdminNavbar />

      {data ? (
        <CldImage
          width="50"
          height="50"
          src={data.club.profilePic}
          alt="Description of my image"
        />
      ) : null}

      <Link href={`/admin/clubs/${id}/edit`}>Edit Club Settings</Link>

      <pre>{JSON.stringify(data?.club, null, 2)}</pre>
    </>
  );
};

export default AdminSingleClub;
