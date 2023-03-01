import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { FormEvent, useState } from "react";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";

const getUser = async (
  id: string
): Promise<{
  status: "OK" | "ERROR";
  user: IUser;
}> => {
  return axios.get(`/api/users/${id}`);
};

const AdminSingleUserEdit = () => {
  const { data: userData } = useUser();

  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<string>();

  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading, isError } = useQuery(
    ["user", id],
    () => getUser(id as string),
    {
      onSuccess: (data) => {
        setName(data.user.name);
      },
    }
  );

  if (!userData?.user || !(userData?.user.role === "superuser")) return;

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    await axios.patch(`/api/users/${id}`, { name, profilePic });

    await queryClient.refetchQueries(["all-users", "user", id]);
    await router.push(`/admin/users/${id}`);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    setProfilePic(a.info.public_id);
  };

  return (
    <>
      <AdminNavbar />

      {data ? (
        <CldImage
          width="50"
          height="50"
          src={profilePic ? profilePic : data.user.profilePic}
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

      <form onSubmit={handleUpdateUser}>
        <input
          type="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button>Update</button>
      </form>
    </>
  );
};

export default AdminSingleUserEdit;
