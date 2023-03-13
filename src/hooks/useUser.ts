import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { useSingleClub } from "@/hooks/useClub";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";

const getUser = async (): Promise<{ status: "OK" | "ERROR"; user: IUser }> => {
  const data = (await axios.get("/api/users/info")) as {
    status: "OK" | "ERROR";
    user: IUser;
  };
  return data;
};

export const useUser = (context?: {
  onSuccess?: (data: Awaited<ReturnType<typeof getUser>>) => void;
}) => {
  return useQuery(["current-user"], getUser, {
    onSuccess: context?.onSuccess,
  });
};

export const useUserClubDetails = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data: userData } = useUser();
  const { data } = useSingleClub({
    id: id as string,
  });

  const isSuperUser = userData?.user.role === "superuser";

  const isUserInClub = data?.club.members.find(
    (d) => d.user._id === userData?.user._id
  );

  return { isSuperUser, isUserInClub };
};
