import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";

const getUser = async (): Promise<{ status: "OK" | "ERROR"; user: IUser }> => {
  return axios.get("/api/users/info");
};

export const useUser = (context?: {
  onSuccess?: (data: Awaited<ReturnType<typeof getUser>>) => void;
  enabled?: boolean;
}) => {
  return useQuery(["current-user"], getUser, {
    onSuccess: context?.onSuccess,
    enabled: context?.enabled,
  });
};
