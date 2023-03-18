import {
  Container,
  Title,
  TextInput,
  Button,
  Select,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { Link as RichTextEditorLink } from "@mantine/tiptap";
import { useQuery } from "@tanstack/react-query";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React from "react";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { DashboardBreadCrumb } from "@/components/DashboardBreadCrumb";
import { useSingleClub } from "@/hooks/useClub";
import { useUserClubDetails } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IBlog } from "@/models/blog";
import { queryClient } from "@/pages/_app";
import { DescriptionEditor } from "@/pages/clubs/[id]/dashboard/settings";
import { CloudinaryImage } from "@/types/cloudinary";
import { BlogCredentialsDTO, blogSchema } from "@/validators";

const getBlog = (
  id: string,
  blogId: string
): Promise<{ status: "OK" | "ERROR"; blog: IBlog }> => {
  return axios.get(`/api/clubs/${id}/blogs/${blogId}`);
};

const EditBlog = () => {
  const router = useRouter();
  const { id, blogId } = router.query;

  const { data: clubData } = useSingleClub({ id: id as string });

  const { data } = useQuery(
    ["club-blog", id, blogId],
    () => getBlog(id as string, blogId as string),
    {
      enabled: router.isReady,
      onSuccess: (d) => {
        form.setValues({
          content: d.blog.content,
          title: d.blog.title,
          status: d.blog.status,
          featuredImage: d.blog.featuredImage,
        });

        editor?.commands.setContent(d.blog.content);
      },
    }
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      RichTextEditorLink,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    onCreate: ({ editor }) => {
      editor.commands.setContent(data?.blog.content || "");
    },
    onUpdate: ({ editor }) => {
      form.setFieldValue("content", editor.getHTML());
    },
  });
  const { isUserInClub, isSuperUser } = useUserClubDetails();

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

  if (!data) return <LoadingOverlay visible={true} overlayBlur={2} />;

  const breadcrumbItems = [
    {
      href: `/clubs/${id}/dashboard`,
      title: data ? `${clubData?.club.name}'s Home` : "Home",
    },
    { href: `/clubs/${id}/dashboard/blogs`, title: "Blogs" },
  ];

  const handleUpdateBlog = async (data: BlogCredentialsDTO) => {
    await axios.patch(`/api/clubs/${id}/blogs/${blogId}`, data);

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
          Edit Blog{" "}
        </Title>

        <div>
          {form.values.featuredImage ? (
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
          ) : null}
        </div>

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
          Update Featured Image
        </Button>
        {form.errors.featuredImage ? (
          <Text size="xs" color="red" mt="xs">
            {form.errors.featuredImage}
          </Text>
        ) : null}

        <form onSubmit={form.onSubmit(handleUpdateBlog)}>
          <TextInput
            // sx={{ marginTop: "1rem" }}
            label="Title"
            {...form.getInputProps("title")}
            withAsterisk
            mt="md"
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
            Update Blog
          </Button>
        </form>
      </Container>
    </ClubDashboardLayout>
  );
};

export default EditBlog;
