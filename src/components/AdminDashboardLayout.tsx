import {
  AppShell,
  Group,
  LoadingOverlay,
  Navbar,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { IconHome, IconSettings, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactNode, useState } from "react";

import { AppHeader, User, useStyles } from "@/components/ClubDashboardLayout";
import { useUser } from "@/hooks/useUser";

export const AdminDashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: userData } = useUser();

  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  if (!userData) return <LoadingOverlay visible={true} overlayBlur={2} />;

  if (!userData.user || userData.user.role !== "superuser") {
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
        header={<AppHeader opened={opened} onToggle={toggleNavbar} />}
        className={classes.main}
      >
        {children}
      </AppShell>
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

  const linkPath = `/admin${href ? `/${href}` : ""}`;

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

export const data = [
  {
    icon: <IconUsers size={16} />,
    color: "teal",
    label: "Users",
    href: "users",
  },
  {
    icon: <IconUsers size={16} />,
    color: "yellow",
    label: "Clubs",
    href: "clubs",
  },
];

export const MainLinks = () => {
  const links = data.map((link) => <MainLink {...link} key={link.label} />);

  return <>{links}</>;
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
