import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { axios } from "@/lib/axios";
import { IClub } from "@/models/club";

const getClubs = async (): Promise<{
  status: "OK" | "ERROR";
  clubs: IClub[];
}> => {
  return axios.get("/api/clubs/");
};

export const useClubs = () => {
  return useQuery(["all-clubs"], getClubs);
};

const getSingleClub = async (
  id: string
): Promise<{
  status: "OK" | "ERROR";
  club: IClub;
}> => {
  return await axios.get(`/api/clubs/${id}`);
};

export const useSingleClub = ({
  id,
  onSuccess,
}: {
  id: string;
  onSuccess?: (club: Awaited<ReturnType<typeof getSingleClub>>) => void;
  enabled?: boolean;
}) => {
  const router = useRouter();

  return useQuery(["club", id], () => getSingleClub(id), {
    onSuccess,
    enabled: router.isReady,
  });
};

const getUserClubs = async (): Promise<{
  status: "OK" | "ERROR";
  clubs: IClub[];
}> => {
  return axios.get("/api/users/info/clubs");
};

export const useUserClubs = () => {
  return useQuery(["user-clubs"], getUserClubs);
};
