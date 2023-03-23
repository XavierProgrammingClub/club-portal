import { Container, SimpleGrid, Text, useMantineTheme } from "@mantine/core";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React from "react";

import { BlogCard } from "@/components/BlogCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { connectDatabase } from "@/lib/db";
import Blog, { IBlog } from "@/models/blog";
import { WhatAreYouThinkingSection } from "@/pages";

const Index = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
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
            Blogs
          </Text>
        </Container>
      </div>

      <Container size={"xl"}>
        <SimpleGrid
          mt="1rem"
          mb="3rem"
          cols={4}
          breakpoints={[
            { maxWidth: "lg", cols: 4 },
            { maxWidth: "md", cols: 3 },
            { maxWidth: "sm", cols: 2 },
            { maxWidth: "xs", cols: 1 },
          ]}
        >
          {props.blogs.map((blog: IBlog) => (
            <BlogCard
              key={blog._id}
              image={blog.featuredImage}
              title={blog.title}
              createdAt={new Date(blog.createdAt)}
              href={`/blogs/${blog._id}`}
              author={{
                name: (blog.author.club as any).name,
                image: (blog.author.club as any).profilePic,
              }}
            />
          ))}
        </SimpleGrid>
      </Container>

      <WhatAreYouThinkingSection />
      <Footer />
    </>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async (context) => {
  await connectDatabase();

  const blogs = (await Blog.find({ status: "public" }).populate(
    "author.club",
    "name profilePic"
  )) as IBlog[];

  return {
    props: {
      blogs: JSON.parse(JSON.stringify(blogs)),
    },
  };
};
