import {
  Avatar,
  Badge,
  Col,
  Container,
  Grid,
  Paper,
  Text,
  TypographyStylesProvider,
  useMantineTheme,
} from "@mantine/core";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect, useState } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Blog, { IBlog } from "@/models/blog";
import Club from "@/models/club";
import { useStyles } from "@/pages";
import { getCurrentUserDetails } from "@/pages/api/auth/[...nextauth]";
import { timeAgo } from "@/utils/timeAgo";

const SingleBlogsPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  return "FUCK ALL";
  const theme = useMantineTheme();

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
            {props.blog.title}
          </Text>
        </Container>
      </div>

      <Container size="xl">
        <Grid>
          <Col md={9} sm={12}>
            <div style={{ maxWidth: "50rem" }}>
              <TypographyStylesProvider>
                <div dangerouslySetInnerHTML={{ __html: props.blog.content }} />
              </TypographyStylesProvider>
            </div>
          </Col>

          <Col md={3} sm={12}>
            <BlogInfo
              createdAt={new Date(props.blog.createdAt)}
              club={{
                name: props.blog.author.club.name,
                avatar: props.blog.author.club.profilePic,
              }}
              user={{
                name: props.blog.author.user.name,
                avatar: props.blog.author.user.profilePic,
              }}
            />
          </Col>
        </Grid>
      </Container>

      <Footer />
    </>
  );
};

export default SingleBlogsPage;

interface BlogInfoProps {
  club: {
    avatar: string;
    name: string;
  };

  user: {
    avatar: string;
    name: string;
  };
  createdAt: Date;
}

export const BlogInfo = (props: BlogInfoProps) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
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
        src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_200/${props.club.avatar}`}
        size={120}
        radius={120}
        sx={{ objectFit: "cover" }}
        mx="auto"
      />

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Badge mt="lg">
          {hydrated ? `Posted ${timeAgo(props.createdAt)}` : null}
        </Badge>
      </div>
      <Text ta="center" fz="lg" weight={500} component="h1">
        {props.club.name}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {/*{description}*/}
      </Text>

      {/*{isSuperUser || isUserInClub ? (*/}
      {/*  <Button*/}
      {/*    fullWidth*/}
      {/*    mt="md"*/}
      {/*    component={Link}*/}
      {/*    href={`/clubs/${_id}/dashboard`}*/}
      {/*  >*/}
      {/*    View Dashboard*/}
      {/*  </Button>*/}
      {/*) : null}*/}
    </Paper>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  return {
    props: { blog: "fuck all" },
  };

  const blog = (await Blog.findById(id as string)
    .populate("author.user", "profilePic name")
    .populate("author.club", "profilePic name")) as IBlog;

  if (!blog)
    return {
      notFound: true,
    };

  return {
    props: { blog: JSON.parse(JSON.stringify(blog)) },
  };

  if (blog.status === "draft") {
    let user;

    try {
      user = await getCurrentUserDetails(context);
    } catch (err) {
      //   Empty
    }

    if (!user) return { notFound: true };

    const club = await Club.find({
      _id: (blog.author.club as any)._id,
      members: {
        $elemMatch: {
          user: (user._id as any).toHexString(),
        },
      },
    });

    if (club.length === 0)
      return {
        notFound: true,
      };
  }

  return {
    props: { blog: JSON.parse(JSON.stringify(blog)) },
  };
};
