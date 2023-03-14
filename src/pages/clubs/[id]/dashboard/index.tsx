import {
  Affix,
  Avatar,
  Button,
  Col,
  Grid,
  Paper,
  rem,
  Title,
  createStyles,
  Card,
  Text,
  Container,
  AspectRatio,
  Stack,
  Group,
  Drawer,
  TextInput,
  Textarea,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconCheck,
  IconDots,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CldImage, CldUploadButton } from "next-cloudinary";
import React, { useEffect } from "react";
import TimeAgo from "react-timeago";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { useSingleClub } from "@/hooks/useClub";
import { useUserClubDetails } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IAnnouncement } from "@/models/club";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";
import { CloudinaryImage } from "@/types/cloudinary";
import {
  NewAnnouncementCredentialsDTO,
  newAnnouncementSchema,
  UpdateAnnouncementCredentialsDTO,
  updateAnnouncementSchema,
} from "@/validators";

const getAnnouncements = async (
  id: string
): Promise<{ status: "OK" | "ERROR"; announcements: IAnnouncement[] }> => {
  return axios.get(`/api/clubs/${id}/announcements`);
};

const ClubDashboard = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data } = useSingleClub({ id: id as string });
  const [
    newAnnouncementDrawerOpened,
    {
      open: handleNewAnnouncementDrawerOpen,
      close: handleNewAnnouncementDrawerClose,
    },
  ] = useDisclosure(false);

  const { data: announcementsData } = useQuery(
    ["club", id, "announcements"],
    () => getAnnouncements(id as string),
    {
      enabled: router.isReady,
    }
  );

  return (
    <>
      <ClubDashboardLayout>
        <Container size="md">
          <Grid>
            <Col lg={4} md={4} sm={12}>
              <ClubInfo
                avatar={data?.club.profilePic}
                name={data?.club.name}
                description={data?.club.description}
              />
            </Col>
            <Col lg={7} md={7} sm={12} ml={{ md: "md" }}>
              <Title sx={{ paddingBottom: "1rem" }} order={2}>
                Announcements
              </Title>

              <Stack mt="md">
                {announcementsData?.announcements.length === 0 ? (
                  <Text c="dimmed">No announcements found</Text>
                ) : null}
                {announcementsData?.announcements?.map((announcement) => (
                  <AnnouncementCard
                    key={announcement._id}
                    data={announcement}
                  />
                ))}
              </Stack>
            </Col>
          </Grid>
        </Container>

        <Affix position={{ bottom: rem(30), right: rem(30) }}>
          <Button
            leftIcon={<IconPlus size="1rem" />}
            size="md"
            onClick={handleNewAnnouncementDrawerOpen}
          >
            Announce Something
          </Button>
        </Affix>

        <NewAnnouncementDrawer
          opened={newAnnouncementDrawerOpened}
          onClose={handleNewAnnouncementDrawerClose}
        />
      </ClubDashboardLayout>
    </>
  );
};

interface ClubInfoProps {
  avatar?: string;
  name?: string;
  description?: string;
}

export const ClubInfo = ({ avatar, name, description }: ClubInfoProps) => (
  <Paper
    radius="md"
    withBorder
    p="lg"
    pos="sticky"
    top="5rem"
    sx={(theme) => ({
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    })}
  >
    <Avatar
      src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_200/${avatar}`}
      size={120}
      radius={120}
      sx={{ objectFit: "cover" }}
      mx="auto"
    />

    <Text ta="center" fz="lg" weight={500} mt="md" component="h1">
      {name}
    </Text>
    <Text ta="center" c="dimmed" fz="sm">
      {description}
    </Text>
  </Paper>
);

const useStyles = createStyles((theme) => ({
  card: {
    // transition: "transform 150ms ease, box-shadow 150ms ease",
    //
    // "&:hover": {
    //   transform: "scale(1.01)",
    //   boxShadow: theme.shadows.md,
    // // },
    // background: "none",

    background:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    transition: ".2s",
    "&:hover": {
      background:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[1],
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 600,
  },
}));

interface AnnouncementCardProps {
  data: {
    title: string;
    _id: string;
    description: string;
    photo?: string;
    author: {
      user: IUser;
      role: string;
    };
    createdAt: Date;
    updatedAt?: Date;
  };
}
const AnnouncementCard = (props: AnnouncementCardProps) => {
  const router = useRouter();
  const { id } = router.query;

  const { classes } = useStyles();

  const [
    editAnnouncementDrawerOpened,
    {
      open: handleEditAnnouncementDrawerOpen,
      close: handleEditAnnouncementDrawerClose,
    },
  ] = useDisclosure(false);

  const handleDeleteAnnouncement = () => {
    openConfirmModal({
      title: "Delete announcement",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this announcement ({props.data._id})?
        </Text>
      ),
      labels: { confirm: "Delete announcement", cancel: "No don't delete" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await axios.delete(
            `/api/clubs/${id}/announcements/${props.data._id}`
          );
        } catch (error) {
          console.log(error);
        }
        await queryClient.refetchQueries(["club", id, "announcements"]);
      },
    });
  };

  return (
    <Card
      p="md"
      radius="md"
      component="a"
      withBorder
      // href="#"
      className={classes.card}
    >
      <Group position="apart">
        <Group>
          <Avatar
            radius="xl"
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${props.data.author.user.profilePic}`}
          />
          <div>
            <Text fw={500} size="sm">
              {props.data.author.user.name}
            </Text>
            <Text fz="xs" c="dimmed" size="xs">
              Posted <TimeAgo date={props.data.createdAt} />{" "}
              {props.data.updatedAt ? (
                <>
                  {" "}
                  • Last Updated <TimeAgo date={props.data.updatedAt} />{" "}
                </>
              ) : null}
            </Text>
          </div>
        </Group>

        <Group spacing={0}>
          <Menu
            transitionProps={{ transition: "pop" }}
            withArrow
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <ActionIcon>
                <IconDots size="1rem" stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconPencil size="1rem" stroke={1.5} />}
                onClick={handleEditAnnouncementDrawerOpen}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                icon={<IconTrash size="1rem" stroke={1.5} />}
                color="red"
                onClick={handleDeleteAnnouncement}
              >
                Delete Announcement
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {props.data.photo ? (
        <AspectRatio ratio={1920 / 1080} mt="md">
          <CldImage
            width="1080"
            height="720"
            src={props.data.photo}
            alt="Description of my image"
          />
        </AspectRatio>
      ) : null}

      <Text mt="sm" className={classes.title}>
        {props.data.title}
      </Text>

      <Text size="sm" c="dimmed">
        {props.data.description}
      </Text>

      <EditAnnouncementDrawer
        opened={editAnnouncementDrawerOpened}
        onClose={handleEditAnnouncementDrawerClose}
        announcementId={props.data._id}
      />
    </Card>
  );
};

interface NewAnnouncementDrawerProps {
  opened: boolean;
  onClose: () => void;
}

const NewAnnouncementDrawer = (props: NewAnnouncementDrawerProps) => {
  const router = useRouter();
  const { id } = router.query;

  const { isUserInClub } = useUserClubDetails();

  const form = useForm<NewAnnouncementCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(newAnnouncementSchema),
    initialValues: {
      description: "",
      title: "",
      photo: "",
      author: {
        user: "",
        role: "",
      },
    },
  });

  useEffect(() => {
    if (!isUserInClub) return;

    form.setFieldValue("author", {
      user: isUserInClub?.user._id,
      role: isUserInClub?.role,
    });
  }, [isUserInClub]);

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("photo", a.info.public_id);
  };

  const handleNewAnnouncement = async (data: NewAnnouncementCredentialsDTO) => {
    await axios.post(`/api/clubs/${id}/announcements/`, data);

    showNotification({
      icon: <IconCheck size={16} />,
      color: "teal",
      message: "Announcement created successfully",
    });
    props.onClose();
    form.reset();
    await queryClient.refetchQueries(["club", id, "announcements"]);
  };

  return (
    <Drawer
      opened={props.opened}
      onClose={props.onClose}
      title="New Announcement"
    >
      {form.values.photo ? (
        <Avatar
          size={100}
          src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_120/${form.values.photo}`}
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
      <form onSubmit={form.onSubmit(handleNewAnnouncement)}>
        <TextInput
          sx={{ marginTop: "1rem" }}
          label="Title"
          placeholder="Request for ..."
          {...form.getInputProps("title")}
          withAsterisk
          error={form.errors.title}
        />

        <Textarea
          sx={{ marginTop: "1rem" }}
          label="Description"
          placeholder="Write something..."
          {...form.getInputProps("description")}
          withAsterisk
          autosize
          minRows={4}
          error={form.errors.description}
        />

        <Button type="submit" mt="lg">
          Submit
        </Button>
      </form>
    </Drawer>
  );
};

const getAnnouncement = async (
  clubId: string,
  announcementId: string
): Promise<{ status: "OK" | "ERROR"; announcement: IAnnouncement }> => {
  return axios.get(`/api/clubs/${clubId}/announcements/${announcementId}`);
};

const EditAnnouncementDrawer = (
  props: NewAnnouncementDrawerProps & { announcementId: string }
) => {
  const router = useRouter();
  const { id: clubId } = router.query;

  const form = useForm<UpdateAnnouncementCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(updateAnnouncementSchema),
    initialValues: {
      description: "",
      title: "",
      photo: "",
    },
  });

  useQuery(
    ["club", clubId, "announcement", props.announcementId],
    () => getAnnouncement(clubId as string, props.announcementId),
    {
      enabled: router.isReady,
      onSuccess: ({ announcement }) => {
        form.setValues({
          description: announcement.description,
          title: announcement.title,
          photo: announcement.photo,
        });
      },
    }
  );

  const handleOnUpload = (a: CloudinaryImage) => {
    if (!(a.event === "success")) return;

    form.setFieldValue("photo", a.info.public_id);
  };

  const handleUpdateAnnouncement = async (
    data: UpdateAnnouncementCredentialsDTO
  ) => {
    await axios.patch(
      `/api/clubs/${clubId}/announcements/${props.announcementId}`,
      data
    );

    showNotification({
      icon: <IconCheck size={16} />,
      color: "teal",
      message: "Announcement updated successfully",
    });
    props.onClose();
    form.reset();
    await queryClient.refetchQueries(["club", clubId, "announcements"]);
  };

  return (
    <Drawer
      opened={props.opened}
      onClose={props.onClose}
      title="Edit Announcement"
    >
      {form.values.photo ? (
        <Avatar
          size={100}
          src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_120/${form.values.photo}`}
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
      <form onSubmit={form.onSubmit(handleUpdateAnnouncement)}>
        <TextInput
          sx={{ marginTop: "1rem" }}
          label="Title"
          placeholder="Request for ..."
          {...form.getInputProps("title")}
          withAsterisk
          error={form.errors.title}
        />

        <Textarea
          sx={{ marginTop: "1rem" }}
          label="Description"
          placeholder="Write something..."
          {...form.getInputProps("description")}
          withAsterisk
          autosize
          minRows={4}
          error={form.errors.description}
        />

        <Button type="submit" mt="lg">
          Submit
        </Button>
      </form>
    </Drawer>
  );
};

export default ClubDashboard;
