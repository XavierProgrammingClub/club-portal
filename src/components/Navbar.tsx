// export const Navbar = () => {
//   const { data, isLoading, isError } = useUser();
//

//
//   const renderAuthLinks = () => {
//     if (!data?.user || isError)
//       return (
//         <>
//           <Link href="/auth/signin">Sign In</Link>
//         </>
//       );
//
//     const linksForAuthenticatedUsers = (
//       <>
//         <Link href="/profile">Profile</Link>
//         <button onClick={handleLogout}>Logout</button>
//       </>
//     );
//
//     if (data?.user.role === "superuser") {
//       return (
//         <>
//           <Link href="/admin">Admin</Link>
//           {linksForAuthenticatedUsers}
//         </>
//       );
//     }
//     return linksForAuthenticatedUsers;
//   };
//
//   return (
//     <nav>
//       <Link href="/">Home </Link>
//       <Link href="/clubs">Clubs </Link>
//       {renderAuthLinks()}
//     </nav>
//   );
// };

import {
  createStyles,
  Header,
  HoverCard,
  Group,
  Button,
  UnstyledButton,
  Text,
  SimpleGrid,
  ThemeIcon,
  Anchor,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  Container,
  Switch,
  useMantineColorScheme,
  Menu,
  Avatar,
  useMantineTheme,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconNotification,
  IconCode,
  IconBook,
  IconChartPie3,
  IconFingerprint,
  IconCoin,
  IconChevronDown,
  IconSun,
  IconMoonStars,
  IconLogout,
  IconChevronRight,
  IconEdit,
} from "@tabler/icons-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { useClubs } from "@/hooks/useClub";
import { useUser } from "@/hooks/useUser";
import { queryClient } from "@/pages/_app";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: rem(42),
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
}));

export const Navbar = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes, theme } = useStyles();

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data, isLoading, isError } = useUser();

  const { data: clubsData } = useClubs();

  const links = clubsData?.clubs.slice(0, 6).map((item) => (
    <UnstyledButton
      component={Link}
      href={`/clubs/${item._id}`}
      className={classes.subLink}
      key={item._id}
      onClick={closeDrawer}
    >
      <Group noWrap align="flex-start">
        <Avatar
          radius="xl"
          size={"sm"}
          src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${item.profilePic}`}
        />
        <div>
          <Text size="sm" fw={500}>
            {item.name}
          </Text>
          <Text lineClamp={2} size="xs" color="dimmed">
            {item.shortDescription}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box mb={"md"} pos={"sticky"} top={0} sx={{ zIndex: 999 }}>
      <Header height={60} px="md">
        <Container size="xl">
          <Group position="apart" sx={{ height: 60 }}>
            <Anchor component={Link} href="/">
              Club Portal
            </Anchor>
            <Group
              sx={{ height: "100%" }}
              spacing={0}
              className={classes.hiddenMobile}
            >
              <Link href="/" className={classes.link}>
                Home
              </Link>
              <HoverCard
                width={600}
                position="bottom"
                radius="md"
                shadow="md"
                withinPortal
              >
                <HoverCard.Target>
                  <Link href="/#clubs" className={classes.link}>
                    <Center inline>
                      <Box component="span" mr={5}>
                        Clubs
                      </Box>
                      <IconChevronDown
                        size={16}
                        color={theme.fn.primaryColor()}
                      />
                    </Center>
                  </Link>
                </HoverCard.Target>

                <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                  <Group position="apart" px="md">
                    <Text fw={500}>Clubs</Text>
                    <Anchor component={Link} href="/#clubs" fz="xs">
                      View all
                    </Anchor>
                  </Group>

                  <Divider
                    my="sm"
                    mx="-md"
                    color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                  />

                  <SimpleGrid cols={2} spacing={0}>
                    {links}
                  </SimpleGrid>
                </HoverCard.Dropdown>
              </HoverCard>
              <Link href="/about" className={classes.link}>
                About
              </Link>
              <Link href="/contact" className={classes.link}>
                Contact
              </Link>
            </Group>
            <Group className={classes.hiddenMobile}>
              <Switch
                checked={colorScheme === "dark"}
                onChange={() => toggleColorScheme()}
                size="md"
                onLabel={
                  <IconSun color={theme.white} size="1.15rem" stroke={1.5} />
                }
                offLabel={
                  <IconMoonStars
                    color={theme.colors.gray[6]}
                    size="1.15rem"
                    stroke={1.5}
                  />
                }
              />
              {!isLoading && isError ? (
                <>
                  <Button
                    component={Link}
                    href="/auth/signin"
                    variant="default"
                  >
                    Log in
                  </Button>
                </>
              ) : null}

              {!isLoading && data ? (
                <>
                  {data.user.role === "superuser" ? (
                    <Button component={Link} href="/admin/users">
                      Admin
                    </Button>
                  ) : null}

                  <UserMenu />
                </>
              ) : null}
            </Group>
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              className={classes.hiddenDesktop}
            />
          </Group>
        </Container>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Link onClick={closeDrawer} href="/" className={classes.link}>
            Home
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Clubs
              </Box>
              <IconChevronDown size={16} color={theme.fn.primaryColor()} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>
            <div style={{ marginLeft: "1rem" }}>{links}</div>
          </Collapse>
          <Link onClick={closeDrawer} href="/about" className={classes.link}>
            About
          </Link>
          <Link onClick={closeDrawer} href="/contact" className={classes.link}>
            Contact
          </Link>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Group position="center" grow pb="xl" px="md">
            {!isLoading && isError ? (
              <>
                <Button
                  onClick={closeDrawer}
                  component={Link}
                  href="/auth/signin"
                  variant="default"
                >
                  Log in
                </Button>
              </>
            ) : null}

            {!isLoading && data ? (
              <>
                {data.user.role === "superuser" ? (
                  <Button
                    component={Link}
                    href="/admin/users"
                    onClick={closeDrawer}
                  >
                    Admin
                  </Button>
                ) : null}

                <Button
                  variant={"outline"}
                  component={Link}
                  href="/profile"
                  onClick={closeDrawer}
                >
                  Profile
                </Button>
              </>
            ) : null}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

const UserMenu = () => {
  const theme = useMantineTheme();

  const { data } = useUser();

  if (!data) return null;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    await queryClient.refetchQueries(["current-user"]);
  };

  return (
    <Group position="center">
      <Menu
        withArrow
        width={300}
        position="bottom"
        transitionProps={{ transition: "pop" }}
        withinPortal
      >
        <Menu.Target>
          <ActionIcon>
            <Avatar
              radius="xl"
              size={"sm"}
              src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${data.user.profilePic}`}
            />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            component={Link}
            href="/profile"
            rightSection={<IconChevronRight size="0.9rem" stroke={1.5} />}
          >
            <Group>
              <Avatar
                radius="xl"
                src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_50/${data.user.profilePic}`}
              />

              <div>
                <Text weight={500}>{data.user.name}</Text>
                <Text size="xs" color="dimmed">
                  {data.user.email}
                </Text>
              </div>
            </Group>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            component={Link}
            href="/profile/edit"
            icon={
              <IconEdit
                size="0.9rem"
                stroke={1.5}
                color={theme.colors.green[6]}
              />
            }
          >
            Edit Profile
          </Menu.Item>

          <Menu.Item
            color="red"
            onClick={handleLogout}
            icon={<IconLogout size="0.9rem" stroke={1.5} />}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};
