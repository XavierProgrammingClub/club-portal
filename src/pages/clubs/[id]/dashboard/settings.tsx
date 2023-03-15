import {
  Avatar,
  Button,
  Container,
  LoadingOverlay,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { RichTextEditor, Link } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/router";
import { CldUploadButton } from "next-cloudinary";
import React, { useEffect, useRef } from "react";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { DashboardBreadCrumb } from "@/components/DashboardBreadCrumb";
import { useSingleClub } from "@/hooks/useClub";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import { updateClubSchema, UpdateClubCredentialsDTO } from "@/validators";

const content =
  '<h2 style="text-align: center;">Welcome to Mantine rich text editor</h2><p><code>RichTextEditor</code> component focuses on usability and is designed to be as simple as possible to bring a familiar editing experience to regular users. <code>RichTextEditor</code> is based on <a href="https://tiptap.dev/" rel="noopener noreferrer" target="_blank">Tiptap.dev</a> and supports all of its features:</p><ul><li>General text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike-through</s> </li><li>Headings (h1-h6)</li><li>Sub and super scripts (<sup>&lt;sup /&gt;</sup> and <sub>&lt;sub /&gt;</sub> tags)</li><li>Ordered and bullet lists</li><li>Text align&nbsp;</li><li>And all <a href="https://tiptap.dev/extensions" target="_blank" rel="noopener noreferrer">other extensions</a></li></ul>';

const ClubSettings = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data } = useSingleClub({
    id: id as string,
    onSuccess: (data) => {
      form.setValues(data.club);
    },
  });

  const form = useForm<UpdateClubCredentialsDTO>({
    validateInputOnBlur: true,
    initialValues: {
      profilePic: "",
      name: "",
      isAvailableForRegistration: true,
      shortDescription: "",
      description: "",
    },
    validate: zodResolver(updateClubSchema),
  });

  const breadcrumbItems = [
    {
      href: `/clubs/${id}/dashboard`,
      title: data ? `${data?.club.name}'s Home` : "Home",
    },
    { href: `/clubs/${id}/dashboard/settings`, title: "Settings" },
  ];

  const handleUpdateClub = async (data: UpdateClubCredentialsDTO) => {
    await axios.patch(`/api/clubs/${id}`, data);

    await queryClient.refetchQueries(["all-clubs", "club", id]);
    await router.push(`/clubs/${id}/dashboard`);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("profilePic", a.info.public_id);
  };

  return (
    <ClubDashboardLayout>
      <Container size="xl">
        <DashboardBreadCrumb items={breadcrumbItems} />
        <Title sx={{ paddingBottom: "2rem" }} order={1} mt="sm">
          Edit Club Settings
        </Title>

        <Avatar
          size={100}
          src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_120/${form.values.profilePic}`}
          radius={100}
          sx={{ objectFit: "cover" }}
        />

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
          sx={{ marginTop: "0.5rem" }}
        >
          Update Avatar
        </Button>

        <form onSubmit={form.onSubmit(handleUpdateClub)}>
          <TextInput
            sx={{ marginTop: "1rem" }}
            label="Name"
            {...form.getInputProps("name")}
            withAsterisk
            error={form.errors.name}
          />

          <Textarea
            sx={{ marginTop: "1rem" }}
            label="Short Description"
            {...form.getInputProps("shortDescription")}
            withAsterisk
            autosize
            minRows={3}
            mb={"md"}
            error={form.errors.shortDescription}
          />

          <DescriptionEditor
            content={form.values.description || ""}
            onChange={(value: string) =>
              form.setFieldValue("description", value)
            }
          />
          {form.errors.description ? (
            <Text fz="xs" color={"red"}>
              {form.errors.description}
            </Text>
          ) : null}

          <Switch
            sx={{ marginTop: "1rem" }}
            label="Our club accepts new members registration!"
            checked={form.values.isAvailableForRegistration}
            {...form.getInputProps("isAvailableForRegistration")}
          />

          <Button type="submit" sx={{ marginTop: "2rem" }}>
            Update Settings
          </Button>
        </form>
      </Container>
    </ClubDashboardLayout>
  );
};

function DescriptionEditor(props: {
  content: string;
  onChange: (value: string) => void;
}) {
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
    content: props.content,
  });

  const contentChangedRef = useRef(false);

  useEffect(() => {
    if (contentChangedRef.current || !props.content) return;

    editor?.commands.setContent(props.content);
  }, [props.content]);

  editor?.on("update", (a) => {
    props.onChange(a.editor.getHTML());
  });

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}

export default ClubSettings;
