import {
  Container,
  Title,
  Stack,
  TextInput,
  Button,
  Table,
  ScrollArea,
  Anchor,
  ActionIcon,
  Drawer,
  Group,
  Avatar,
  Text,
  MantineColor,
  SelectItemProps,
  Autocomplete,
  Loader,
  Switch,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { forwardRef, useRef, useState } from "react";

import { ClubDashboardLayout } from "@/components/ClubDashboardLayout";
import { DashboardBreadCrumb } from "@/components/DashboardBreadCrumb";
import { clubMembersRole, defaultPermissions } from "@/constants";
import { useSingleClub } from "@/hooks/useClub";
import { useUserClubDetails } from "@/hooks/useUser";
import { axios } from "@/lib/axios";
import { IClub } from "@/models/club";
import { IUser } from "@/models/user";
import { queryClient } from "@/pages/_app";
import { NewMemberCredentialsDTO, newMemberSchema } from "@/validators";

const getUsers = async (
  searchQuery: string
): Promise<{ status: "OK" | "ERROR"; users: IUser[] }> => {
  return axios.get("/api/users", { params: { search: searchQuery } });
};

const AdminSingleClub = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data } = useSingleClub({
    id: id as string,
  });
  const { isUserInClub, isSuperUser } = useUserClubDetails();
  const [drawerOpened, { open: handleOpenDrawer, close: handleCloseDrawer }] =
    useDisclosure(false);

  if (!isUserInClub) return;

  const breadcrumbItems = [
    {
      href: `/clubs/${id}/dashboard`,
      title: data ? `${data?.club.name}'s Home` : "Home",
    },
    { href: `/clubs/${id}/dashboard/members`, title: "Members" },
  ];

  const handleDeleteMember = async (user: IUser) => {
    openConfirmModal({
      title: "Delete club member",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this member ({user.name} #{user._id})?
        </Text>
      ),
      labels: { confirm: "Delete Member", cancel: "No don't delete" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await axios.delete(`/api/clubs/${id}/members/${user._id}`);
        } catch (error) {
          console.log(error);
        }
        await queryClient.refetchQueries(["club", id]);
      },
    });
  };

  return (
    <ClubDashboardLayout>
      <Container size="xl">
        <DashboardBreadCrumb items={breadcrumbItems} />
        <Title order={1} mt="sm">
          Members{" "}
        </Title>

        <Stack mt="xl" justify="space-between" style={{ flexDirection: "row" }}>
          <form>
            <TextInput
              placeholder="Search members"
              icon={<IconSearch size={14} />}
              size="md"
            />
          </form>
          {isSuperUser || isUserInClub.permissions.canAddMembers ? (
            <Button onClick={handleOpenDrawer} size="md">
              Add members
            </Button>
          ) : null}

          <AddMemberDrawer opened={drawerOpened} onClose={handleCloseDrawer} />
        </Stack>

        <ClubMembersTable
          data={data?.club.members || []}
          onDeleteMember={handleDeleteMember}
        />
      </Container>
    </ClubDashboardLayout>
  );
};

interface AddMemberDrawerProps {
  opened: boolean;
  onClose: () => void;
}
const AddMemberDrawer = (props: AddMemberDrawerProps) => {
  const router = useRouter();

  const { id } = router.query;

  const timeoutRef = useRef<number>(-1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<
    { email: string; profilePic: string; name: string; value: string }[]
  >([]);

  const form = useForm<NewMemberCredentialsDTO>({
    validateInputOnBlur: true,
    validate: zodResolver(newMemberSchema),
    initialValues: {
      permissions: clubMembersRole.find(
        (role) => role.title === "Active Member"
      )?.permissions as IClub["members"][0]["permissions"],
      role: "",
      showcase: true,
      user: "",
    },
  });

  const handleAddMember = async (data: NewMemberCredentialsDTO) => {
    await axios.post(`/api/clubs/${id}/members/`, data);
    props.onClose();
    await queryClient.refetchQueries(["club", id]);
  };

  const handleRoleSelectChange = (val: string) => {
    form.setFieldValue("role", val);
    const userPermission = clubMembersRole.find((role) => role.title === val);
    if (!userPermission) {
      return form.setFieldValue("permissions", defaultPermissions);
    }

    form.setFieldValue("permissions", userPermission.permissions);
  };

  const handleChange = async (val: string) => {
    window.clearTimeout(timeoutRef.current);
    setData([]);
    form.setFieldValue("user", val);

    if (val.trim().length === 0 || val.includes("@")) {
      setLoading(false);
    } else {
      setLoading(true);
      timeoutRef.current = window.setTimeout(() => {
        getUsers(val).then((data) => {
          const usersData = data.users.map((d) => ({
            email: d.email,
            name: d.name,
            profilePic: d.profilePic,
            value: d._id,
          }));

          setData(usersData);
          setLoading(false);
        });
      }, 500);
    }
  };

  return (
    <Drawer opened={props.opened} onClose={props.onClose} title="Add Member">
      <form onSubmit={form.onSubmit(handleAddMember)}>
        <Autocomplete
          data={data}
          onChange={handleChange}
          rightSection={loading ? <Loader size="1rem" /> : null}
          itemComponent={MembersAutoCompleteItem}
          filter={() => true}
          label="Name of user"
          value={form.values.user}
          placeholder="John Smith"
          error={form.errors.user}
        />

        <Autocomplete
          label="Role"
          placeholder="Member"
          mt={"md"}
          limit={20}
          value={form.values.role}
          error={form.errors.role}
          onChange={handleRoleSelectChange}
          data={[
            { value: "President", label: "President" },
            { value: "Vice President", label: "Vice President" },
            { value: "Secretary", label: "Secretary" },
            { value: "Treasurer", label: "Treasurer" },
            { value: "Active Member", label: "Active Member" },
            { value: "General Member", label: "General Member" },
          ]}
        />

        <Switch
          label="Showcase member on club's page"
          mt="md"
          checked={form.values.showcase}
          {...form.getInputProps("showcase")}
        />

        <Text fw={500} fz="sm" mt="lg">
          Permissions
        </Text>
        <Text c="dimmed" fz="xs">
          Choose the permissions that you want to allow to this user!
        </Text>

        <Switch
          label="Can add members"
          mt="sm"
          checked={form.values.permissions.canAddMembers}
          {...form.getInputProps("permissions.canAddMembers")}
        />
        <Switch
          label="Can remove members"
          mt="sm"
          checked={form.values.permissions.canRemoveMembers}
          {...form.getInputProps("permissions.canRemoveMembers")}
        />
        <Switch
          label="Can publish announcements"
          mt="sm"
          checked={form.values.permissions.canPublishAnnouncements}
          {...form.getInputProps("permissions.canPublishAnnouncements")}
        />
        <Switch
          label="Can publish blogs"
          mt="sm"
          checked={form.values.permissions.canPublishBlogs}
          {...form.getInputProps("permissions.canPublishBlogs")}
        />
        <Switch
          label="Can manage club settings"
          mt="sm"
          checked={form.values.permissions.canManageClubSettings}
          {...form.getInputProps("permissions.canManageClubSettings")}
        />
        <Switch
          label="Can manage permissions"
          mt="sm"
          checked={form.values.permissions.canManagePermissions}
          {...form.getInputProps("permissions.canManagePermissions")}
        />

        <Button type="submit" mt="xl">
          Add Member
        </Button>
      </form>
    </Drawer>
  );
};

// eslint-disable-next-line react/display-name
const MembersAutoCompleteItem = forwardRef<
  HTMLDivElement,
  MembersAutoCompleteItemProps
>(
  (
    { email, name, profilePic, ...others }: MembersAutoCompleteItemProps,
    ref
  ) => {
    return (
      <div ref={ref} {...others}>
        <Group noWrap>
          <Avatar
            size={40}
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${profilePic}`}
            radius={40}
            sx={{ objectFit: "cover" }}
          />

          <div>
            <Text>{name}</Text>
            <Text size="xs" color="dimmed">
              {email}
            </Text>
          </div>
        </Group>
      </div>
    );
  }
);

interface ClubMembersTableProps {
  data: IClub["members"] | [];
  onDeleteMember: (user: IUser) => void;
}

export function ClubMembersTable({
  data,
  onDeleteMember,
}: ClubMembersTableProps) {
  const { isUserInClub, isSuperUser } = useUserClubDetails();

  const rows = data.map((item) => (
    <tr key={item._id}>
      <td>
        <Group spacing="sm">
          <Avatar
            size={40}
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${item.user.profilePic}`}
            radius={40}
            sx={{ objectFit: "cover" }}
          />
          <div>
            <Anchor
              component={Link}
              href={`/users/${item.user._id}`}
              fz="sm"
              fw={500}
            >
              {item.user.name}
            </Anchor>
            <Text fz="xs" c="dimmed">
              {item.user.email}
            </Text>
          </div>
        </Group>
      </td>

      <td>
        <Group>
          <ActionIcon variant="outline" color="blue">
            <IconEdit size={18} />
          </ActionIcon>
          {isSuperUser || isUserInClub?.permissions.canRemoveMembers ? (
            <ActionIcon
              variant="outline"
              color="red"
              onClick={() => onDeleteMember(item.user)}
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

interface MembersAutoCompleteItemProps extends SelectItemProps {
  color: MantineColor;
  email: string;
  name: string;
  profilePic: string;
  value: string;
}

export default AdminSingleClub;
