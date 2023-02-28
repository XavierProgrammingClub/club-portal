import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";

const AdminNewUser = () => {
  const { data } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  if (!data?.user || !(data?.user.role === "superuser")) return;

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const data = (await axios.post("/api/users", {
        name,
        email,
        password,
      })) as { message: string; status: "OK" | "ERROR"; user: IUser };
      await router.push(`/admin/users/${data.user._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminNavbar />

      <form onSubmit={handleSignup}>
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
