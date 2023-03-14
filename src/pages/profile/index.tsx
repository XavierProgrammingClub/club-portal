import {
  Container,
  Button,
  Paper,
  Grid,
  Col,
  Avatar,
  Table,
  Group,
  Text,
  ScrollArea,
  Title,
  LoadingOverlay,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import { Navbar } from "@/components/Navbar";
import { useUserClubs } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";
import { IClub } from "@/models/club";

const Index = () => {
  const { data: userData, isLoading: isUserLoading } = useUser();
  const { data: clubsData, isLoading: isClubLoading } = useUserClubs();
  const router = useRouter();

  if (isUserLoading || isClubLoading)
    return <LoadingOverlay visible={true} overlayBlur={2} />;
  if (!userData || !clubsData) {
    router.push("/");
    return;
  }

  return (
    <>
      <Navbar />
      <Container size="xl">
        <Grid>
          <Col md={3} sm={12}>
            <UserInfoAction
              avatar={userData.user.profilePic}
              name={userData.user.name}
              email={userData.user.email}
              links={[
                {
                  variant: "default",
                  label: "Edit Profile",
                  href: "/profile/edit",
                },
              ]}
            />
          </Col>
          <Col md={9} sm={12}>
            <Title sx={{ paddingBottom: "1rem" }} order={2}>
              Clubs
            </Title>
            {clubsData.clubs.length > 0 ? (
              <UserClubsTable data={clubsData.clubs} />
            ) : (
              <Text>No Clubs found</Text>
            )}
          </Col>
        </Grid>
      </Container>
    </>
  );
};

interface UserInfoActionProps {
  avatar: string;
  name: string;
  email: string;
  links: {
    variant:
      | "filled"
      | "outline"
      | "light"
      | "white"
      | "default"
      | "subtle"
      | "gradient";
    href?: string;
    onClick?: () => void;
    label: string;
  }[];
}

export const UserInfoAction = ({
  avatar,
  name,
  email,
  links,
}: UserInfoActionProps) => (
  <Paper
    radius="md"
    withBorder
    p="lg"
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
      {email}
    </Text>

    {links.map((link) => {
      if (link.href) {
        return (
          <Button
            variant={link.variant}
            fullWidth
            key={link.label}
            mt="md"
            component={Link}
            href={link.href}
          >
            {link.label}
          </Button>
        );
      }

      if (link.onClick) {
        return (
          <Button
            variant={link.variant}
            fullWidth
            key={link.label}
            mt="md"
            onClick={link.onClick}
          >
            {link.label}
          </Button>
        );
      }
    })}
  </Paper>
);

interface UsersClubTablesProps {
  data: IClub[];
}

export function UserClubsTable({ data }: UsersClubTablesProps) {
  const rows = data.map((item) => (
    <tr key={item.name}>
      <td>
        <Group spacing="sm">
          <Avatar
            size={40}
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${item.profilePic}`}
            radius={40}
            sx={{ objectFit: "cover" }}
          />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
          </div>
        </Group>
      </td>

      <td>
        <Link href={`/clubs/${item._id}/dashboard`}>View Dashboard</Link>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table miw={"100%"} verticalSpacing="sm">
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

export default Index;
