// import { zodResolver } from "@hookform/resolvers/zod";
import {
  Container,
  Grid,
  Col,
  Title,
  Avatar,
  Button,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { CldUploadButton } from "next-cloudinary";
// import { useForm } from "react-hook-form";

import { useUser } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { queryClient } from "@/pages/_app";
import { UserInfoAction } from "@/pages/profile/index";
import { CloudinaryImage } from "@/types/cloudinary";
import { UpdateUserCredentialsDTO, updateUserSchema } from "@/validators";

const ProfileEdit = () => {
  const router = useRouter();

  const form = useForm<UpdateUserCredentialsDTO>({
    validate: zodResolver(updateUserSchema),
    validateInputOnBlur: true,
    initialValues: { profilePic: "", name: "" },
  });

  const { data, isLoading } = useUser({
    onSuccess: (data) => {
      form.setValues(data.user);
    },
    enabled: router.isReady,
  });

  if (isLoading) return null;
  if (!data) {
    router.push("/");
    return;
  }

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("profilePic", a.info.public_id);
  };

  const handleUpdateUser = async (data: UpdateUserCredentialsDTO) => {
    try {
      await axios.patch(`/api/users/info`, data);

      showNotification({
        icon: <IconCheck size={16} />,
        color: "teal",
        message: "Profile updated successfully!",
      });
    } catch (error: any) {
      showNotification({
        title: "Error Occurred while updating profile!",
        message: error.message,
        icon: <IconX size={16} />,
        color: "red",
      });
    }

    await queryClient.refetchQueries(["current-user"]);
    await router.push(`/profile`);
  };

  return (
    <>
      <Container>
        <Grid>
          <Col md={4} sm={12}>
            <UserInfoAction
              avatar={data.user.profilePic}
              name={data.user.name}
              email={data.user.email}
              links={[
                {
                  variant: "default",
                  label: "Profile",
                  href: "/profile",
                },
                {
                  variant: "filled",
                  label: "Save",
                  onClick: form.onSubmit(handleUpdateUser),
                },
              ]}
            />
          </Col>
          <Col md={8} sm={12}>
            <Title sx={{ paddingBottom: "1rem" }} order={2}>
              Edit Profile
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
              Update Profile
            </Button>

            <form onSubmit={form.onSubmit(handleUpdateUser)}>
              <TextInput
                sx={{ marginTop: "1rem" }}
                label="Full name"
                {...form.getInputProps("name")}
                withAsterisk
                error={form.errors.name}
              />
            </form>
          </Col>
        </Grid>
      </Container>
    </>
  );
};

export default ProfileEdit;
