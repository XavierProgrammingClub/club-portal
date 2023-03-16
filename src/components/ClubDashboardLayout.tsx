import {
  AppShell,
  createStyles,
  Burger,
  Group,
  Header,
  ActionIcon,
  MediaQuery,
  useMantineColorScheme,
  useMantineTheme,
  Navbar,
  UnstyledButton,
  Avatar,
  Text,
  Box,
  Menu,
  ThemeIcon,
  LoadingOverlay,
  Button,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconSun,
  IconMoonStars,
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconCheck,
  IconHome,
  IconUsers,
  IconUser,
  IconFile,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { CldImage } from "next-cloudinary";
import React, { ReactNode, useState } from "react";

import { useSingleClub } from "@/hooks/useClub";
import { useUser, useUserClubDetails } from "@/hooks/useUser";
import { queryClient } from "@/pages/_app";

export const ClubDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading: isClubLoading } = useSingleClub({
    id: id as string,
  });
  const { data: userData, isLoading: isUserLoading } = useUser();
  const { isUserInClub, isSuperUser } = useUserClubDetails();

  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);

  if (isUserLoading || isClubLoading)
    return <LoadingOverlay visible={true} overlayBlur={2} />;

  if (!(isSuperUser || isUserInClub) || !data || !userData) {
    router.push("/").catch();
    return null;
  }

  const toggleNavbar = () => setOpened(!opened);

  return (
    <>
      <AppShell
        padding="md"
        navbarOffsetBreakpoint="sm"
        navbar={<AppNavbar opened={opened} />}
        header={
          <AppHeader
            links={[
              { href: "/", children: "Home" },
              { href: `/clubs/${id}`, children: "Club's Page" },
            ]}
            opened={opened}
            logo={<Logo />}
            onToggle={toggleNavbar}
          />
        }
        className={classes.main}
      >
        {children}
      </AppShell>
    </>
  );
};

export const Logo = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data } = useSingleClub({ id: id as string });

  if (data) {
    return (
      <Group>
        <Link href={`/clubs/${id}/dashboard`}>
          <CldImage
            width="30"
            height="30"
            src={data.club.profilePic}
            alt="Description of my image"
          />
        </Link>

        <Text component={Link} href={`/clubs/${id}/dashboard`} fw={500}>
          {data.club.name}
        </Text>
      </Group>
    );
  }

  return null;
};

export const data = [
  {
    icon: <IconHome size={16} />,
    color: "blue",
    label: "Home",
    href: "",
  },
  {
    icon: <IconFile size={16} />,
    color: "red",
    label: "Blogs",
    href: "blogs",
  },
  {
    icon: <IconUsers size={16} />,
    color: "teal",
    label: "Members",
    href: "members",
  },
];

export const MainLinks = () => {
  const { isSuperUser, isUserInClub } = useUserClubDetails();
  const links = data.map((link) => <MainLink {...link} key={link.label} />);

  return (
    <>
      {links}
      {isSuperUser || isUserInClub?.permissions.canManageClubSettings ? (
        <MainLink
          href="settings"
          color="yellow"
          label="Settings"
          icon={<IconSettings size={16} />}
        />
      ) : null}
    </>
  );
};

interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  href: string;
}

export const MainLink = ({ icon, color, label, href }: MainLinkProps) => {
  const router = useRouter();
  const { classes, cx } = useStyles();

  const { id } = router.query;

  const linkPath = `/clubs/${id}/dashboard${href ? `/${href}` : ""}`;

  return (
    <>
      <UnstyledButton
        component={Link}
        href={linkPath}
        className={cx(classes.linkButton, {
          [classes.linkActive]: linkPath === router.asPath,
        })}
      >
        <Group>
          <ThemeIcon color={color} variant="light">
            {icon}
          </ThemeIcon>

          <Text size="sm">{label}</Text>
        </Group>
      </UnstyledButton>
    </>
  );
};

export const User = () => {
  const { classes } = useStyles();

  const router = useRouter();
  const { data } = useUser();

  const onLogout = async () => {
    await signOut({ redirect: false });
    showNotification({
      icon: <IconCheck size={16} />,
      color: "teal",
      title: "Logged out successfully",
      message: "You can login again if you wish to!",
    });
    await queryClient.refetchQueries(["current-user"]);

    await router.push("/");
  };

  const renderUserDetails = () => {
    return (
      <>
        <Avatar
          src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_120/${data?.user.profilePic}`}
          color="red"
          radius="xl"
        />
        <Box sx={{ flex: 1 }}>
          <Text size="sm" weight={500}>
            {data?.user.name}
          </Text>
          <Text color="dimmed" size="xs">
            {data?.user.email}
          </Text>
        </Box>
      </>
    );
  };

  return (
    <Box className={classes.userBox}>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <UnstyledButton className={classes.userButton}>
            <Group>
              {renderUserDetails()}
              <IconChevronRight size={18} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            component={Link}
            href={`/profile`}
            icon={<IconUser size={14} />}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            color="red"
            onClick={onLogout}
            icon={<IconLogout size={14} />}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
};

interface AppNavbarProps {
  opened: boolean;
}

export const AppNavbar = (props: AppNavbarProps) => {
  return (
    <Navbar
      width={{ sm: 300, md: 300, lg: 300 }}
      hiddenBreakpoint="sm"
      p="md"
      hidden={!props.opened}
    >
      <Navbar.Section grow mt="xs">
        <MainLinks />
      </Navbar.Section>
      <Navbar.Section>
        <User />
      </Navbar.Section>
    </Navbar>
  );
};

interface AppHeaderProps {
  opened: boolean;
  onToggle: () => void;
  links?: { children: string; href: string }[];
  logo: React.ReactNode;
}

export const AppHeader = (props: AppHeaderProps) => {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Header height={60}>
      <Group sx={{ height: "100%" }} px={20} position="apart">
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={props.opened}
            onClick={props.onToggle}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>
        {props.logo}
        <Group>
          <>
            {props.links?.map((link) => (
              <Button
                variant={"subtle"}
                component={Link}
                {...link}
                key={link.href}
              />
            ))}
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size={30}
            >
              {colorScheme === "dark" ? (
                <IconSun size={16} />
              ) : (
                <IconMoonStars size={16} />
              )}
            </ActionIcon>
          </>
        </Group>
      </Group>
    </Header>
  );
};

export const useStyles = createStyles((theme) => ({
  main: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[8]
        : theme.colors.gray[0],
  },
  userBox: {
    paddingTop: theme.spacing.sm,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },
  userButton: {
    display: "block",
    width: "100%",
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
  linkButton: {
    display: "block",
    width: "100%",
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));
