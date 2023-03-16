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
import React from "react";
import TimeAgo from "react-timeago";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Blog, { IBlog } from "@/models/blog";
import { useStyles } from "@/pages";

const SingleBlogsPage = (
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

export const BlogInfo = (props: BlogInfoProps) => (
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
        Posted <TimeAgo date={props.createdAt} />
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

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
};
