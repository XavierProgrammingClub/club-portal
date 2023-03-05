import Link from "next/link";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useClubs } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";

const Clubs = () => {
  const { data: userData } = useUser();
  const { data, isLoading, isError } = useClubs();

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  const handleDeleteClubs = async (id: string) => {
    await axios.delete(`/api/clubs/${id}`);
    await queryClient.refetchQueries(["all-clubs"]);
  };

  return (
    <>
      <AdminNavbar />

      <ul>
        {data?.clubs.map((club) => (
          <li key={club._id}>
            <Link href={`/admin/clubs/${club._id}`}>
              #{club._id} {club.name}
            </Link>
            <button onClick={() => handleDeleteClubs(club._id)}>Delete</button>{" "}
            <Link href={`/admin/clubs/${club._id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Clubs;
