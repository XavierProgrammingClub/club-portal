import { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";

import { useUser } from "@/hooks/useUser";
import Club, { IClub } from "@/models/club";
import { connectDatabase } from "@/utils/db";

const ClubsIndex = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: userData } = useUser();

  return (
    <>
      Here are list of all clubs
      <pre>{JSON.stringify(props.clubs, null, 2)}</pre>
      <ul>
        {props.clubs.map((club: IClub) => (
          <li key={club._id}>
            <Link href={`/clubs/${club._id}`}>
              #{club._id} {club.name}
            </Link>

            {userData &&
            club.members.find(
              (member) => (member.user as unknown) === userData.user._id
            ) ? (
              <Link href={`/clubs/${club._id}/dashboard`}>View Dashboard</Link>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
};

export default ClubsIndex;

interface IProps {
  clubs: IClub[];
}

export const getStaticProps: GetStaticProps<IProps> = async (context) => {
  await connectDatabase();

  const clubs = await Club.find();

  return {
    props: { clubs: JSON.parse(JSON.stringify(clubs)) },
    revalidate: 100,
  };
};
