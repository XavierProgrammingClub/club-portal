import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";

const getUser = async (
  id: string
): Promise<{
  status: "OK" | "ERROR";
  user: IUser;
}> => {
  return axios.get(`/api/users/${id}`);
};

const AdminSingleUser = () => {
  const { data: userData } = useUser();
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, isError } = useQuery(["user", id], () =>
    getUser(id as string)
  );

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  return (
    <>
      <AdminNavbar />

      <pre>{JSON.stringify(data?.user, null, 2)}</pre>
    </>
  );
};

export default AdminSingleUser;
