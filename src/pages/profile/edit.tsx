import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { FormEvent, useState } from "react";

import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";

const ProfileEdit = () => {
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState<string>();

  const { data } = useUser({
    onSuccess: (data) => {
      setName(data.user.name);
      setProfilePic(data.user.profilePic);
    },
  });

  const router = useRouter();

  const handleUpdateUser = async (e: FormEvent) => {
    e.preventDefault();
    await axios.patch(`/api/users/info`, { name, profilePic });
    console.log("HEY");

    await queryClient.refetchQueries(["current-user"]);
    await router.push(`/profile`);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    setProfilePic(a.info.public_id);
  };

  return (
    <>
      {profilePic ? (
        <CldImage
          width="50"
          height="50"
          src={profilePic}
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

export default ProfileEdit;
