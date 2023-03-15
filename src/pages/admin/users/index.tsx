import {
  ActionIcon,
  Anchor,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Container,
  Drawer,
  Group,
  Loader,
  LoadingOverlay,
  PasswordInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { CldUploadButton } from "next-cloudinary";
import React, { useEffect, useMemo, useState } from "react";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { useUser, useUserClubDetails } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import {
  AdminNewUserCredentialsDTO,
  adminNewUserSchema,
  AdminUpdateUserCredentialsDTO,
  adminUpdateUserSchema,
} from "@/validators";

const getUsers = async (): Promise<{
  status: "OK" | "ERROR";
  users: IUser[];
}> => {
  return axios.get("/api/users/");
};

const Index = () => {
  const { data } = useQuery(["all-users"], getUsers);

  const [drawerOpened, { open: handleOpenDrawer, close: handleCloseDrawer }] =
    useDisclosure(false);

  return (
    <AdminDashboardLayout>
      <Container size="xl">
        <Title order={1} mt="sm">
          Users
        </Title>

        <Stack mt="xl" justify="space-between" style={{ flexDirection: "row" }}>
          <form>
            <TextInput
              placeholder="Search users"
              icon={<IconSearch size={14} />}
              size="md"
            />
          </form>
          <Button onClick={handleOpenDrawer} size="md">
            Add users
          </Button>

          <AddUserDrawer opened={drawerOpened} onClose={handleCloseDrawer} />
        </Stack>

        <UsersTable data={data?.users || []} />
      </Container>
    </AdminDashboardLayout>
  );
};

interface DrawerProps {
  opened: boolean;
  onClose: () => void;
}
const AddUserDrawer = (props: DrawerProps) => {
  const router = useRouter();

  const { id } = router.query;

  const form = useForm<AdminNewUserCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(adminNewUserSchema),
    initialValues: {
      password: "",
      email: "",
      name: "",
      profilePic: "",
      role: "user",
    },
  });

  const handleAddUser = async (data: AdminNewUserCredentialsDTO) => {
    const response = (await axios.post("/api/users", data)) as {
      message: string;
      status: "OK" | "ERROR";
      user: IUser;
    };
    await router.push(`/admin/users/${response.user._id}`);
    form.reset();
    props.onClose();
    await queryClient.refetchQueries(["all-users"]);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("profilePic", a.info.public_id);
  };

  return (
    <Drawer opened={props.opened} onClose={props.onClose} title="Add User">
      <form onSubmit={form.onSubmit(handleAddUser)}>
        {form.values.profilePic ? (
          <Avatar
            size={100}
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_120/${form.values.profilePic}`}
            radius={100}
            sx={{ objectFit: "cover" }}
          />
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
          sx={{ marginTop: "0.5rem" }}
        >
          Upload Photo
        </Button>

        <TextInput
          label="Full name"
          mt="md"
          withAsterisk
          error={form.errors.name}
          {...form.getInputProps("name")}
        />

        <TextInput
          mt="md"
          withAsterisk
          label="Email"
          error={form.errors.email}
          {...form.getInputProps("email")}
        />

        <PasswordInput
          mt="md"
          label="Password"
          withAsterisk
          error={form.errors.password}
          {...form.getInputProps("password")}
        />

        <Select
          label="Role?"
          data={[
            { value: "user", label: "User" },
            { value: "superuser", label: "Super User" },
          ]}
          mt="md"
          checked={form.values.role}
          {...form.getInputProps("role")}
        />

        <Button type="submit" mt="xl">
          Add User
        </Button>
      </form>
    </Drawer>
  );
};

interface UsersTableProps {
  data: IUser[] | [];
}

export function UsersTable({ data }: UsersTableProps) {
  const router = useRouter();

  const { id } = router.query;

  const { isUserInClub, isSuperUser } = useUserClubDetails();
  const [drawerOpened, { open: handleOpenDrawer, close: handleCloseDrawer }] =
    useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IUser>();

  const handleDeleteUser = async (user: IUser) => {
    openConfirmModal({
      title: "Delete user",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this user ({user.name} #{user._id})?
        </Text>
      ),
      labels: { confirm: "Delete User", cancel: "No don't delete" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await axios.delete(`/api/users/${user._id}`);
        } catch (error) {
          console.log(error);
        }
        await queryClient.refetchQueries(["all-users"]);
      },
    });
  };

  const rows = data.map((item) => (
    <tr key={item._id}>
      <td>
        <Group spacing="sm">
          <Avatar
            size={40}
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${item.profilePic}`}
            radius={40}
            sx={{ objectFit: "cover" }}
          />
          <div>
            <Anchor
              component={Link}
              href={`/admin/users/${item._id}`}
              fz="sm"
              fw={500}
            >
              {item.name}
            </Anchor>
            <Text fz="xs" c="dimmed">
              {item.email}
            </Text>
          </div>
        </Group>
      </td>

      <td>
        <Badge color="blue">{item.role}</Badge>
      </td>

      <td>
        <Group>
          {isSuperUser || isUserInClub?.role === "President" ? (
            <ActionIcon
              onClick={() => {
                setSelectedUser(item);
                handleOpenDrawer();
              }}
              variant="outline"
              color="blue"
            >
              <IconEdit size={18} />
            </ActionIcon>
          ) : null}

          {isSuperUser || isUserInClub?.permissions.canRemoveMembers ? (
            <ActionIcon
              variant="outline"
              color="red"
              onClick={() => handleDeleteUser(item)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          ) : null}
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={"100%"} mt="xl" verticalSpacing="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>

      <EditUserDrawer
        opened={drawerOpened}
        onClose={handleCloseDrawer}
        user={selectedUser}
      />
    </ScrollArea>
  );
}

const EditUserDrawer = (props: DrawerProps & { user: IUser | undefined }) => {
  const form = useForm<AdminUpdateUserCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(adminUpdateUserSchema),
    initialValues: {
      profilePic: "",
      name: "",
      email: "",
      role: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!props.user) return;

    form.setValues(props.user);
  }, [props.user]);

  if (!props.user) {
    props.onClose();
    return null;
  }

  const handleUpdateUser = async (data: AdminUpdateUserCredentialsDTO) => {
    await axios.patch(`/api/users/${props.user?._id}/`, data);
    form.reset();
    props.onClose();
    await queryClient.refetchQueries(["all-users"]);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("profilePic", a.info.public_id);
  };

  return (
    <Drawer opened={props.opened} onClose={props.onClose} title="Update Member">
      <Group spacing="sm">
        <Avatar
          size={40}
          src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${props.user.profilePic}`}
          radius={40}
          sx={{ objectFit: "cover" }}
        />
        <div>
          <Anchor
            component={Link}
            href={`/users/${props.user._id}`}
            fz="sm"
            fw={500}
          >
            {props.user.name}
          </Anchor>
          <Text fz="xs" c="dimmed">
            {props.user.email}
          </Text>
        </div>
      </Group>

      <form onSubmit={form.onSubmit(handleUpdateUser)}>
        {form.values.profilePic ? (
          <Avatar
            size={100}
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_120/${form.values.profilePic}`}
            radius={100}
            sx={{ objectFit: "cover" }}
            mt={"md"}
          />
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
          sx={{ marginTop: "0.5rem" }}
        >
          Change Photo
        </Button>

        <TextInput
          label="Full name"
          mt="md"
          withAsterisk
          error={form.errors.name}
          {...form.getInputProps("name")}
        />

        <TextInput
          mt="md"
          withAsterisk
          label="Email"
          error={form.errors.email}
          {...form.getInputProps("email")}
        />

        <PasswordInput
          mt="md"
          label="Password"
          error={form.errors.password}
          {...form.getInputProps("password")}
          description={"Leave it empty to not change password"}
        />

        {props.user.role !== "superuser" ? (
          <Select
            label="Role?"
            data={[
              { value: "user", label: "User" },
              { value: "superuser", label: "Super User" },
            ]}
            mt="md"
            checked={form.values.role}
            {...form.getInputProps("role")}
          />
        ) : null}

        <Button type="submit" mt="xl">
          Update User
        </Button>
      </form>
    </Drawer>
  );
};

export default Index;
