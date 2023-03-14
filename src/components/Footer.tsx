import {
  createStyles,
  Container,
  Group,
  Anchor,
  rem,
  Text,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: rem(20),
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  links: {
    [theme.fn.smallerThan("xs")]: {
      marginTop: theme.spacing.md,
    },
  },
}));

const links = [
  {
    link: "/",
    label: "Home",
  },
  {
    link: "/about",
    label: "About",
  },
  {
    link: "/contact",
    label: "Contact Us",
  },
];

export const Footer = () => {
  const { classes } = useStyles();
  const items = links.map((link) => (
    <Anchor<"a">
      color="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container size="xl" className={classes.inner}>
        <Text fw={500}>Club Portal</Text>{" "}
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  );
};
