import {
  Button,
  Container,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Link } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React from "react";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { DashboardBreadCrumb } from "@/components/DashboardBreadCrumb";
import { useSingleClub } from "@/hooks/useClub";
import { useUserClubDetails } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";
import { DescriptionEditor } from "@/pages/clubs/[id]/dashboard/settings";
import { CloudinaryImage } from "@/types/cloudinary";
import { BlogCredentialsDTO, blogSchema } from "@/validators";

const NewBlog = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data } = useSingleClub({ id: id as string });
  const { isUserInClub, isSuperUser } = useUserClubDetails();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    onUpdate: ({ editor }) => {
      form.setFieldValue("content", editor.getHTML());
    },
  });

  const form = useForm<BlogCredentialsDTO>({
    validateInputOnBlur: true,
    initialValues: {
      featuredImage: "",
      title: "",
      content: "",
      status: "draft",
    },
    validate: zodResolver(blogSchema),
  });

  const breadcrumbItems = [
    {
      href: `/clubs/${id}/dashboard`,
      title: data ? `${data?.club.name}'s Home` : "Home",
    },
    { href: `/clubs/${id}/dashboard/blogs/new`, title: "New Blog" },
  ];

  const handleAddBlog = async (data: BlogCredentialsDTO) => {
    await axios.post(`/api/clubs/${id}/blogs`, data);

    await queryClient.refetchQueries(["club-blogs", id]);
    await router.push(`/clubs/${id}/dashboard/blogs`);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("featuredImage", a.info.public_id);
  };

  const isUserAllowedToPublishBlogs =
    isUserInClub?.permissions.canPublishBlogs || isSuperUser;

  return (
    <ClubDashboardLayout>
      <Container size="xl">
        <DashboardBreadCrumb items={breadcrumbItems} />
        <Title sx={{ paddingBottom: "2rem" }} order={1} mt="sm">
          Add Blog
        </Title>

        {form.values.featuredImage ? (
          <div>
            <CldImage
              width="1080"
              height="720"
              src={form.values.featuredImage}
              alt="Description of my image"
              {...{
                style: {
                  width: "200px",
                  height: "120px",
                  objectFit: "cover",
                },
              }}
            />
          </div>
        ) : null}

        <CldUploadButton
          options={{
            multiple: false,
            resourceType: "image",
            maxFileSize: 5242880,
          }}
          onUpload={handleOnUpload}
          uploadPreset="fs1xhftk"
          {...{
            id: "uploadBtn",
            style: {
              visibility: "hidden",
              border: 0,
              padding: 0,
              width: 0,
            },
          }}
        />

        <Button
          onClick={() => {
            document.getElementById("uploadBtn")?.click();
          }}
          variant="default"
          size="sm"
          mt="md"
          sx={{ marginTop: "0.5rem" }}
        >
          Add Featured Image
        </Button>
        {form.errors.featuredImage ? (
          <Text size="xs" color="red" mt="xs">
            {form.errors.featuredImage}
          </Text>
        ) : null}

        <form onSubmit={form.onSubmit(handleAddBlog)}>
          <TextInput
            sx={{ marginTop: "1rem" }}
            label="Title"
            {...form.getInputProps("title")}
            withAsterisk
            error={form.errors.title}
            mb={isUserAllowedToPublishBlogs ? 0 : "md"}
          />

          {isUserAllowedToPublishBlogs ? (
            <Select
              label="Status"
              data={[
                { value: "draft", label: "Draft" },
                { value: "public", label: "Public" },
              ]}
              mb="md"
              mt="md"
              {...form.getInputProps("status")}
            />
          ) : null}

          <DescriptionEditor
            content={form.values.content || ""}
            editor={editor}
          />
          {form.errors.content ? (
            <Text fz="xs" color={"red"}>
              {form.errors.content}
            </Text>
          ) : null}

          <Button type="submit" sx={{ marginTop: "2rem" }}>
            Add Blog
          </Button>
        </form>
      </Container>
    </ClubDashboardLayout>
  );
};

export default NewBlog;
