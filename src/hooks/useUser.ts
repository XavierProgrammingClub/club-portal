import { useQuery } from "@tanstack/react-query";

import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";

const getUser = async (): Promise<{ status: "OK" | "ERROR"; user: IUser }> => {
  return axios.get("/api/users/info");
};

interface IUseUserOptions {
  onSuccess?: (data: { status: "OK" | "ERROR"; user: IUser }) => void;
}

export const useUser = (context?: IUseUserOptions) => {
  return useQuery(["current-user"], getUser, {
    onSuccess: context?.onSuccess,
  });
};
