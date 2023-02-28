import { useQuery } from "@tanstack/react-query";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";

const getUsers = async (): Promise<{
  status: "OK" | "ERROR";
  users: IUser[];
}> => {
  return axios.get("/api/users/");
};

const Index = () => {
  const { data: userData } = useUser();
  const { data, isLoading, isError } = useQuery(["all-users"], getUsers);

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  const handleDeleteUser = async (id: string) => {
    await axios.delete(`/api/users/${id}`);
    await queryClient.refetchQueries(["all-users"]);
  };

  return (
    <>
      <AdminNavbar />

      <ul>
        {data?.users.map((user) => (
          <li key={user._id}>
            #{user._id} {user.email} {user.name}{" "}
            <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Index;
