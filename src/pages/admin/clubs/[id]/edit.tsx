import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useForm } from "react-hook-form";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useSingleClub } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IClub } from "@/models/club";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import {
  AdminUpdateClubCredentialsDTO,
  adminUpdateClubSchema,
} from "@/validators";
const getClub = async (
  id: string
): Promise<{
  status: "OK" | "ERROR";
  club: IClub;
}> => {
  return axios.get(`/api/clubs/${id}`);
};

const AdmingSingleClubEdit = () => {
  const { data: userData } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    reset,
  } = useForm<AdminUpdateClubCredentialsDTO>({
    resolver: zodResolver(adminUpdateClubSchema),
    reValidateMode: "onBlur",
    mode: "all",
  });

  const router = useRouter();
  const { id } = router.query;

  const { data } = useSingleClub({
    id: id as string,
    onSuccess: (data) => {
      reset(data.club);
    },
    enabled: router.isReady,
  });

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  const handleUpdateClub = async (data: AdminUpdateClubCredentialsDTO) => {
    await axios.patch(`/api/clubs/${id}`, data);

    await queryClient.refetchQueries(["all-clubs", "club", id]);
    await router.push(`/admin/clubs/${id}`);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    setValue("profilePic", a.info.public_id);
  };

  const values = getValues();
  console.log(errors);

  return (
    <>
      <AdminNavbar />

      {values.profilePic ? (
        <CldImage
          width="50"
          height="50"
          src={values.profilePic}
          alt="Description of my image"
        />
      ) : null}

      <CldUploadButton
        options={{
          multiple: false,
          resourceType: "image",
          maxFileSize: 5242880,
        }}
        onUpload={handleOnUpload}
        uploadPreset="fs1xhftk"
      ></CldUploadButton>

      <form onSubmit={handleSubmit(handleUpdateClub)}>
        <div>
          <input type="text" placeholder="Name" {...register("name")} />
        </div>

        <div>
          <textarea
            {...register("description")}
            placeholder="Description"
          ></textarea>
        </div>

        <div>
          <label htmlFor="isAvailableForRegistration">
            isAvailableForRegistration
          </label>
          <input
            type="checkbox"
            id="isAvailableForRegistration"
            {...register("isAvailableForRegistration")}
          />
        </div>

        <button disabled={isSubmitting}>Update</button>
      </form>
    </>
  );
};

export default AdmingSingleClubEdit;
