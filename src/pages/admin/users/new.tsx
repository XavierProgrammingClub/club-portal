import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useForm } from "react-hook-form";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { CloudinaryImage } from "@/types/cloudinary";
import { NewUserCredentialsDTO, newUserSchema } from "@/validators";

const AdminNewUser = () => {
  const { data } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm<NewUserCredentialsDTO>({
    resolver: zodResolver(newUserSchema),
    reValidateMode: "onBlur",
    mode: "all",
  });

  const router = useRouter();

  if (!data?.user || !(data?.user.role === "superuser")) return;

  const handleSignup = async (data: NewUserCredentialsDTO) => {
    try {
      const response = (await axios.post("/api/users", data)) as {
        message: string;
        status: "OK" | "ERROR";
        user: IUser;
      };
      await router.push(`/admin/users/${response.user._id}`);
    } catch (error) {
      console.log(error);
    }
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
      />

      <form onSubmit={handleSubmit(handleSignup)}>
        <input type="text" placeholder="Name" {...register("name")} />
        <input type="email" placeholder="Email" {...register("email")} />
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
        />

        <button disabled={isSubmitting}>Sign Up</button>
      </form>
    </>
  );
};

export default AdminNewUser;
