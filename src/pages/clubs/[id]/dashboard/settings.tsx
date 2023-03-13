import {
  Avatar,
  Button,
  Container,
  Switch,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useRouter } from "next/router";
import { CldUploadButton } from "next-cloudinary";
import React from "react";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { DashboardBreadCrumb } from "@/components/DashboardBreadCrumb";
import { useSingleClub } from "@/hooks/useClub";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import { updateClubSchema, UpdateClubCredentialsDTO } from "@/validators";

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
      // banner: "",
      isAvailableForRegistration: true,
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
            label="Description"
            {...form.getInputProps("description")}
            withAsterisk
            autosize
            minRows={3}
            error={form.errors.description}
          />

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

export default ClubSettings;
