import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { CldImage } from "next-cloudinary";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Club, { IClub } from "@/models/club";
import { connectDatabase } from "@/utils/db";

const SingleClubPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return (
    <>
      <Navbar />
      <ul>
        <li>{props.club._id}</li>
        <li>{props.club.name}</li>
        <li>
          <CldImage
            width="50"
            height="50"
            src={props.club.profilePic}
            alt="Description of my image"
          />
        </li>
      </ul>
      <Footer />
    </>
  );
};

export default SingleClubPage;

interface IProps {
  club: IClub;
}

interface IParams extends NextParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<IProps> = async (
  context
) => {
  const { id } = context.params as IParams;
  await connectDatabase();

  try {
    const club = await Club.findById(id);
    if (!club) throw new Error("Club not found!");

    return {
      props: { club: JSON.parse(JSON.stringify(club)) },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
