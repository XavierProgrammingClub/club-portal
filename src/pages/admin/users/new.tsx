import { useRouter } from "next/router";
import { CldUploadButton } from "next-cloudinary";
import { FormEvent, useState } from "react";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { CloudinaryImage } from "@/types/cloudinary";

const AdminNewUser = () => {
  const { data } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string>();

  const router = useRouter();

  if (!data?.user || !(data?.user.role === "superuser")) return;

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const data = (await axios.post("/api/users", {
        name,
        email,
        password,
        profilePic,
      })) as { message: string; status: "OK" | "ERROR"; user: IUser };
      await router.push(`/admin/users/${data.user._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    setProfilePic(a.info.public_id);
  };

  return (
    <>
      <AdminNavbar />

      <form onSubmit={handleSignup}>
        <CldUploadButton
          options={{
            multiple: false,
            resourceType: "image",
            maxFileSize: 5242880,
          }}
          onUpload={handleOnUpload}
          uploadPreset="fs1xhftk"
        />

        <input
          type="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Sign Up</button>
      </form>
    </>
  );
};

export default AdminNewUser;
