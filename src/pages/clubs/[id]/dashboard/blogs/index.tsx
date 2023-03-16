import {
  Container,
  Title,
  Stack,
  TextInput,
  Button,
  Text,
  Group,
  Badge,
  ActionIcon,
  ScrollArea,
  Table,
  SimpleGrid,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import { BlogCard } from "@/components/BlogCard";
import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { DashboardBreadCrumb } from "@/components/DashboardBreadCrumb";
import { useSingleClub } from "@/hooks/useClub";
import { useUser, useUserClubDetails } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IBlog } from "@/models/blog";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";

const getBlogs = (
  id: string
): Promise<{ status: "OK" | "ERROR"; blogs: IBlog[] }> => {
  return axios.get(`/api/clubs/${id}/blogs?all=true`);
};

const ClubBlogs = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: clubData } = useSingleClub({ id: id as string });

  const { data } = useQuery(["club-blogs", id], () => getBlogs(id as string), {
    enabled: router.isReady,
  });

  const breadcrumbItems = [
    {
      href: `/clubs/${id}/dashboard`,
      title: data ? `${clubData?.club.name}'s Home` : "Home",
    },
    { href: `/clubs/${id}/dashboard/blogs`, title: "Blogs" },
  ];

  const handleDeleteBlog = async (blog: IBlog) => {
    openConfirmModal({
      title: "Delete blog",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this blog ({blog.title} #{blog._id})?
        </Text>
      ),
      labels: { confirm: "Delete Blog", cancel: "No don't delete" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await axios.delete(`/api/clubs/${id}/blogs/${blog._id}`);
        } catch (error) {
          console.log(error);
        }
        await queryClient.refetchQueries(["club-blogs", id]);
      },
    });
  };

  return (
    <ClubDashboardLayout>
      <Container size="xl">
        <DashboardBreadCrumb items={breadcrumbItems} />
        <Title order={1} mt="sm">
          Blogs
        </Title>

        <Stack mt="xl" justify="space-between" style={{ flexDirection: "row" }}>
          <form>
            <TextInput
              placeholder="Search members"
              icon={<IconSearch size={14} />}
              size="md"
            />
          </form>
          <Button
            size="md"
            component={Link}
            href={`/clubs/${id}/dashboard/blogs/new`}
          >
            Add blogs
          </Button>
        </Stack>

        <ClubBlogsTable data={data?.blogs || []} />

        <SimpleGrid
          mt="1rem"
          mb="3rem"
          cols={4}
          breakpoints={[
            { maxWidth: "lg", cols: 3 },
            { maxWidth: "md", cols: 2 },
            { maxWidth: "sm", cols: 1 },
          ]}
        >
          {data?.blogs.map((blog: IBlog) => (
            <BlogCard
              key={blog._id}
              image={blog.featuredImage}
              title={blog.title}
              createdAt={new Date(blog.createdAt)}
              href={`/blogs/${blog._id}`}
              status={blog.status}
              author={{
                name: (blog.author.user as any).name,
                image: (blog.author.user as any).profilePic,
              }}
              onDelete={() => handleDeleteBlog(blog)}
              showActions={true}
              editUrl={`/clubs/${id}/dashboard/blogs/${blog._id}/edit`}
            />
          ))}
        </SimpleGrid>
      </Container>
    </ClubDashboardLayout>
  );
};

interface ClubBlogsTableProsp {
  data: IBlog[];
}

export function ClubBlogsTable({ data }: ClubBlogsTableProsp) {
  const router = useRouter();

  const { id } = router.query;

  const { isUserInClub, isSuperUser } = useUserClubDetails();
  const { data: userData } = useUser();

  const handleDeleteBlog = async (blog: IBlog) => {
    openConfirmModal({
      title: "Delete blog",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this blog ({blog.title} #{blog._id})?
        </Text>
      ),
      labels: { confirm: "Delete Blog", cancel: "No don't delete" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await axios.delete(`/api/clubs/${id}/blogs/${blog._id}`);
        } catch (error) {
          console.log(error);
        }
        await queryClient.refetchQueries(["club-blogs", id]);
      },
    });
  };

  const rows = data.map((item) => {
    return (
      <tr key={item._id}>
        <td>{item.title}</td>
        <td>
          <Badge color="blue">{item.status}</Badge>
        </td>

        <td>
          <Group>
            {isSuperUser ||
            isUserInClub?.permissions.canPublishBlogs ||
            (item.author.user as IUser)._id === userData?.user._id ? (
              <>
                <ActionIcon
                  component={Link}
                  href={`/clubs/${id}/dashboard/blogs/${item._id}/edit`}
                  variant="outline"
                  color="blue"
                >
                  <IconEdit size={18} />
                </ActionIcon>

                <ActionIcon
                  variant="outline"
                  color="red"
                  onClick={() => handleDeleteBlog(item)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </>
            ) : null}
          </Group>
        </td>
      </tr>
    );
  });

  return (
    <ScrollArea>
      <Table miw={"100%"} mt="xl" verticalSpacing="sm">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export default ClubBlogs;
