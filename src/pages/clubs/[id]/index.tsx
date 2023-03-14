import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Flex,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Title,
  TypographyStylesProvider,
  useMantineTheme,
} from "@mantine/core";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Link from "next/link";
import React from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Club, { IClub, IMember } from "@/models/club";
import { useStyles } from "@/pages";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { connectDatabase } from "@/utils/db";

const SingleClubPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  return (
    <>
      <Navbar />

      <div
        style={{
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[1],
          marginTop: "-1rem",
          marginBottom: "2rem",
        }}
      >
        <Container size={"xl"} py="5rem">
          <Text align="center" fw={700} size={"2rem"}>
            {props.club.name}
          </Text>
        </Container>
      </div>

      <Container size="xl">
        <Grid>
          <Col md={9} sm={12}>
            <div style={{ maxWidth: "50rem" }}>
              <TypographyStylesProvider>
                <div
                  dangerouslySetInnerHTML={{ __html: props.club.description }}
                />
              </TypographyStylesProvider>
            </div>
          </Col>

          <Col md={3} sm={12}>
            <ClubInfoAction
              avatar={props.club.profilePic}
              name={props.club.name}
              description={props.club.shortDescription}
              _id={props.club._id}
              isSuperUser={props.isSuperUser}
              isUserInClub={props.isUserInClub}
            />
          </Col>
        </Grid>
      </Container>

      <Container id="clubs" size="xl" className={classes.clubsWrapper}>
        <Title className={classes.clubsTitle}>Members</Title>

        <Flex
          gap={"xl"}
          wrap={"wrap"}
          justify={"center"}
          mt={50}
          sx={{ placeItems: "center" }}
        >
          {props.club.members.map((member) => {
            if (!member.showcase) return;

            return (
              <Card
                key={member._id}
                sx={{ textAlign: "center", background: "none" }}
              >
                <Avatar
                  src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_200/${member.user.profilePic}`}
                  size={75}
                  radius={75}
                  sx={{ objectFit: "cover" }}
                  mx="auto"
                />
                <Badge mt="md">{member.role}</Badge>
                <Text
                  ta="center"
                  fz="lg"
                  sx={{ marginTop: "0" }}
                  weight={500}
                  component="h1"
                >
                  {member.user.name}
                </Text>
              </Card>
            );
          })}
        </Flex>
      </Container>

      <Footer />
    </>
  );
};

interface ClubInfoActionProps {
  _id: string;
  avatar: string;
  name: string;
  description: string;
  isSuperUser: boolean;
  isUserInClub?: IMember;
}

export const ClubInfoAction = ({
  _id,
  avatar,
  name,
  description,
  isSuperUser,
  isUserInClub,
}: ClubInfoActionProps) => (
  <Paper
    radius="md"
    withBorder
    p="lg"
    sx={(theme) => ({
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    })}
  >
    <Avatar
      src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_200/${avatar}`}
      size={120}
      radius={120}
      sx={{ objectFit: "cover" }}
      mx="auto"
    />

    <Text ta="center" fz="lg" weight={500} mt="md" component="h1">
      {name}
    </Text>
    <Text ta="center" c="dimmed" fz="sm">
      {description}
    </Text>

    {isSuperUser || isUserInClub ? (
      <Button
        fullWidth
        mt="md"
        component={Link}
        href={`/clubs/${_id}/dashboard`}
      >
        View Dashboard
      </Button>
    ) : null}
  </Paper>
);

export default SingleClubPage;

interface IProps {
  club: IClub;
  isSuperUser: boolean;
  isUserInClub: IMember | undefined;
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
    const club = (await Club.findById(id).populate("members.user")) as IClub;
    if (!club) throw new Error("Club not found!");

    try {
      const user = await getCurrentUserDetails(context);

      const isSuperUser = user?.role === "superuser";
      const isUserInClub = club.members.find(
        (d) =>
          (d.user._id as any).toHexString() === (user?._id as any).toHexString()
      );

      return {
        props: {
          club: JSON.parse(JSON.stringify(club)),
          isSuperUser,
          isUserInClub: isUserInClub
            ? JSON.parse(JSON.stringify(isUserInClub))
            : null,
        },
      };
    } catch (error) {
      return {
        props: {
          club: JSON.parse(JSON.stringify(club)),
          isSuperUser: false,
          isUserInClub: null,
        },
      };
      /* Catching Error just for the sake of preventing it from throwing error when user is not logged in */
    }
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
