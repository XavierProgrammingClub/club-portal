import Link from "next/link";
import { useRouter } from "next/router";
import { CldImage } from "next-cloudinary";

import { useUserClubs } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";

const Index = () => {
  const { data, isLoading } = useUser();
  const { data: clubsData } = useUserClubs();
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
      <pre>{JSON.stringify(clubsData?.clubs, null, 2)}</pre>
      <ul>
        {clubsData?.clubs.map((club) => (
          <li key={club._id}>
            <Link href={`/clubs/${club._id}`}>
              #{club._id} {club.name}
            </Link>{" "}
            <Link href={`/clubs/${club._id}/dashboard`}>View Dashboard</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Index;
