import { AdminNavbar } from "@/components/AdminNavbar";
import { useUser } from "@/hooks/useUser";

const Admin = () => {
  const { data } = useUser();
  if (!data?.user || !(data?.user.role === "superuser")) return;

  return (
    <>
      <AdminNavbar />
    </>
  );
};

export default Admin;
