import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useForm } from "react-hook-form";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import {
  AdminUpdateUserCredentialsDTO,
  adminUpdateUserSchema,
} from "@/validators";
const getUser = async (data: {
  id: string;
}): Promise<{
  status: "OK" | "ERROR";
  user: IUser;
}> => {
  return axios.get(`/api/users/${data.id}`);
};

const AdminSingleUserEdit = () => {
  const { data: userData } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    reset,
  } = useForm<AdminUpdateUserCredentialsDTO>({
    resolver: zodResolver(adminUpdateUserSchema),
    reValidateMode: "onBlur",
    mode: "all",
  });

  const router = useRouter();
  const { id } = router.query;

  const { data } = useQuery(["user", id], () => getUser({ id: id as string }), {
    onSuccess: (data) => {
      reset(data.user);
    },
    enabled: router.isReady,
  });

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  const handleUpdateUser = async (data: AdminUpdateUserCredentialsDTO) => {
    await axios.patch(`/api/users/${id}`, data);

    await queryClient.refetchQueries(["all-users", "user", id]);
    await router.push(`/admin/users/${id}`);
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

      <form onSubmit={handleSubmit(handleUpdateUser)}>
        <input type="text" placeholder="Name" {...register("name")} />

        <button disabled={isSubmitting}>Update</button>
      </form>
    </>
  );
};

export default AdminSingleUserEdit;
