import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useForm } from "react-hook-form";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IClub } from "@/models/club";
import { CloudinaryImage } from "@/types/cloudinary";
import { NewClubCredentialsDTO, newClubSchema } from "@/validators";

const AdminNewClub = () => {
  const { data } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm<NewClubCredentialsDTO>({
    resolver: zodResolver(newClubSchema),
    reValidateMode: "onBlur",
    mode: "all",
  });

  const router = useRouter();

  if (!data?.user || !(data?.user.role === "superuser")) return;

  const handleNewClub = async (data: NewClubCredentialsDTO) => {
    try {
      const response = (await axios.post("/api/clubs", data)) as {
        message: string;
        status: "OK" | "ERROR";
        club: IClub;
      };
      await router.push(`/admin/clubs/${response.club._id}`);
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

      <form onSubmit={handleSubmit(handleNewClub)}>
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

        <button disabled={isSubmitting}>Add Club</button>
      </form>
    </>
  );
};

export default AdminNewClub;
