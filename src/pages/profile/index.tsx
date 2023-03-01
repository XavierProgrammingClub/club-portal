import Link from "next/link";
import { useRouter } from "next/router";
import { CldImage } from "next-cloudinary";

import { useUser } from "@/hooks/useUser";

const Index = () => {
  const { data, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return null;
  if (!isLoading && !data) {
    router.push("/");
    return;
  }

  return (
    <>
      {data ? (
        <CldImage
          width="50"
          height="50"
          src={data.user.profilePic}
          alt="Description of my image"
        />
      ) : null}
      <Link href="/profile/edit">Edit Profile</Link>
      <pre>{JSON.stringify(data?.user, null, 2)}</pre>
    </>
  );
};

export default Index;
