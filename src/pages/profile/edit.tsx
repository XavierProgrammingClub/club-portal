import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useForm } from "react-hook-form";

import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import { UpdateUserCredentialsDTO, updateUserSchema } from "@/validators";

const ProfileEdit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    reset,
  } = useForm<UpdateUserCredentialsDTO>({
    resolver: zodResolver(updateUserSchema),
    reValidateMode: "onBlur",
    mode: "all",
  });

  const { data } = useUser({
    onSuccess: (data) => {
      reset(data.user);
    },
  });

  const router = useRouter();

  const handleUpdateUser = async (data: UpdateUserCredentialsDTO) => {
    await axios.patch(`/api/users/info`, data);

    await queryClient.refetchQueries(["current-user"]);
    await router.push(`/profile`);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    setValue("profilePic", a.info.public_id);
  };

  const values = getValues();
  console.log(errors);

  return (
    <>
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
      />

      <form onSubmit={handleSubmit(handleUpdateUser)}>
        <input type="text" placeholder="Name" {...register("name")} />

        <button disabled={isSubmitting}>Update</button>
      </form>
    </>
  );
};

export default ProfileEdit;
