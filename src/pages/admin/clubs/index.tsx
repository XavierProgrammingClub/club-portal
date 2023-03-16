import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Container,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import {
  IconEdit,
  IconSearch,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { CldUploadButton } from "next-cloudinary";
import React, { useState } from "react";

import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { useClubs } from "@/hooks/useClub";
import { axios } from "@/lib/axios";
import { IClub } from "@/models/club";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import {
  NewClubCredentialsDTO,
  newClubSchema,
  UpdateClubCredentialsDTO,
  updateClubSchema,
} from "@/validators";

const Clubs = () => {
  const { data } = useClubs();

  const [drawerOpened, { open: handleOpenDrawer, close: handleCloseDrawer }] =
    useDisclosure(false);

  return (
    <AdminDashboardLayout>
      <Container size="xl">
        <Title order={1} mt="sm">
          Clubs
        </Title>

        <Stack mt="xl" justify="space-between" style={{ flexDirection: "row" }}>
          <form>
            <TextInput
              placeholder="Search clubs"
              icon={<IconSearch size={14} />}
              size="md"
            />
          </form>
          <Button onClick={handleOpenDrawer} size="md">
            Add club
          </Button>

          <AddClubDrawer opened={drawerOpened} onClose={handleCloseDrawer} />
        </Stack>

        <ClubTable data={data?.clubs || []} />
      </Container>
    </AdminDashboardLayout>
  );
};

interface ClubTableProps {
  data: IClub[] | [];
}

export function ClubTable({ data }: ClubTableProps) {
  const [drawerOpened, { open: handleOpenDrawer, close: handleCloseDrawer }] =
    useDisclosure(false);
  const [selectedClub, setSelectedClub] = useState<IClub>();

  const handleDeleteClub = async (club: IClub) => {
    openConfirmModal({
      title: "Delete club",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this club ({club.name} #{club._id})?
        </Text>
      ),
      labels: { confirm: "Delete club", cancel: "No don't delete" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await axios.delete(`/api/clubs/${club._id}`);
        } catch (error) {
          console.log(error);
        }
        await queryClient.refetchQueries(["all-clubs"]);
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
              href={`/clubs/${item._id}`}
              fz="sm"
              fw={500}
            >
              {item.name}
            </Anchor>
          </div>
        </Group>
      </td>

      <td>
        <Group>
          <ActionIcon
            component={Link}
            href={`/clubs/${item._id}/dashboard`}
            variant="outline"
            color="green"
          >
            <IconSettings size={18} />
          </ActionIcon>

          <ActionIcon
            onClick={() => {
              setSelectedClub(item);
              handleOpenDrawer();
            }}
            variant="outline"
            color="blue"
          >
            <IconEdit size={18} />
          </ActionIcon>

          <ActionIcon
            variant="outline"
            color="red"
            onClick={() => handleDeleteClub(item)}
          >
            <IconTrash size={18} />
          </ActionIcon>
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>

      {selectedClub ? (
        <EditClubDrawer
          opened={drawerOpened}
          onClose={handleCloseDrawer}
          club={selectedClub}
        />
      ) : null}
    </ScrollArea>
  );
}

interface DrawerProps {
  opened: boolean;
  onClose: () => void;
}
const AddClubDrawer = (props: DrawerProps) => {
  const form = useForm<NewClubCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(newClubSchema),
    initialValues: {
      profilePic: "",
      name: "",
      shortDescription: "",
      isAvailableForRegistration: true,
    },
  });

  const handleAddClub = async (data: NewClubCredentialsDTO) => {
    await axios.post("/api/clubs", data);

    form.reset();
    props.onClose();
    await queryClient.refetchQueries(["all-clubs"]);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("profilePic", a.info.public_id);
  };

  return (
    <Drawer opened={props.opened} onClose={props.onClose} title="Add Club">
      <form onSubmit={form.onSubmit(handleAddClub)}>
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
          label="Name"
          mt="md"
          withAsterisk
          error={form.errors.name}
          {...form.getInputProps("name")}
        />

        <Textarea
          mt="md"
          withAsterisk
          autosize
          minRows={3}
          label="Short Description"
          error={form.errors.shortDescription}
          {...form.getInputProps("shortDescription")}
        />

        <Switch
          sx={{ marginTop: "1rem" }}
          label="Our club accepts new members registration!"
          checked={form.values.isAvailableForRegistration}
          {...form.getInputProps("isAvailableForRegistration")}
        />

        <Button type="submit" mt="xl">
          Add Club
        </Button>
      </form>
    </Drawer>
  );
};

const EditClubDrawer = (props: DrawerProps & { club: IClub }) => {
  const form = useForm<UpdateClubCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(updateClubSchema),
    initialValues: {
      profilePic: props.club.profilePic,
      name: props.club.name,
      shortDescription: props.club.shortDescription,
      isAvailableForRegistration: props.club.isAvailableForRegistration,
    },
  });

  const handleUpdateClub = async (data: UpdateClubCredentialsDTO) => {
    await axios.patch(`/api/clubs/${props.club?._id}`, data);

    form.reset();
    props.onClose();
    await queryClient.refetchQueries(["all-clubs"]);
  };

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("profilePic", a.info.public_id);
  };

  return (
    <Drawer
      opened={props.opened}
      onClose={props.onClose}
      title={`Update Club (${props.club?.name})`}
    >
      <form onSubmit={form.onSubmit(handleUpdateClub)}>
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
          label="Name"
          mt="md"
          withAsterisk
          error={form.errors.name}
          {...form.getInputProps("name")}
        />

        <Textarea
          mt="md"
          withAsterisk
          autosize
          label="Short Description"
          error={form.errors.shortDescription}
          {...form.getInputProps("shortDescription")}
        />

        <Switch
          sx={{ marginTop: "1rem" }}
          label="Our club accepts new members registration!"
          checked={form.values.isAvailableForRegistration}
          {...form.getInputProps("isAvailableForRegistration")}
        />

        <Button type="submit" mt="xl">
          Update Club
        </Button>
      </form>
    </Drawer>
  );
};

export default Clubs;
