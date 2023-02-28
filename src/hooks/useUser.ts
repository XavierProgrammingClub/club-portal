import { useQuery } from "@tanstack/react-query";

import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";

const getUser = async (): Promise<{ status: "OK" | "ERROR"; user: IUser }> => {
  return axios.get("/api/users/info");
};

export const useUser = () => {
  return useQuery(["current-user"], getUser);
};
