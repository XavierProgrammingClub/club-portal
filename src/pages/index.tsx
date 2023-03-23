import {
  Button,
  Overlay,
  Badge,
  Group,
  Text,
  Card,
  SimpleGrid,
  Image,
  Container,
  Title,
  createStyles,
  rem,
  ActionIcon,
} from "@mantine/core";
import {
  IconGauge,
  IconUser,
  IconCookie,
  IconHeart,
} from "@tabler/icons-react";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import React from "react";

import { BlogCard } from "@/components/BlogCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Blog, { IBlog } from "@/models/blog";
import Club, { IClub } from "@/models/club";
import { connectDatabase } from "@/lib/db";

const inter = Inter({ subsets: ["latin"] });

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  return (
    <>
      <Head>
        <title>Portal</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <Navbar />
        <HeroSection />
        <FeaturesCards />
        <ClubsSection clubs={props.clubs} />
        <BlogsSection blogs={props.blogs} />
        <WhatAreYouThinkingSection />
        <Footer />
      </main>
    </>
  );
}

export const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: rem(180),
    paddingBottom: rem(130),
    backgroundImage:
      "url(https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&dl=helena-lopes-e3OUQGT9bWU-unsplash.jpg&w=640&q=80&fm=jpg&crop=entropy&cs=tinysrgb)",
    backgroundSize: "cover",
    backgroundPosition: "center",

    [theme.fn.smallerThan("xs")]: {
      paddingTop: rem(80),
      paddingBottom: rem(50),
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
  },

  title: {
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: rem(-1),
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    color: theme.white,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  highlight: {
    color: theme.colors[theme.primaryColor][4],
  },

  description: {
    color: theme.colors.gray[0],
    textAlign: "center",

    [theme.fn.smallerThan("xs")]: {
      fontSize: theme.fontSizes.md,
      textAlign: "left",
    },
  },

  controls: {
    marginTop: `calc(${theme.spacing.xl} * 1.5)`,
    display: "flex",
    justifyContent: "center",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  control: {
    height: rem(42),
    fontSize: theme.fontSizes.md,

    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    [theme.fn.smallerThan("xs")]: {
      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },

  secondaryControl: {
    color: theme.white,
    backgroundColor: "rgba(255, 255, 255, .4)",

    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, .45) !important",
    },
  },

  featuresTitle: {
    fontSize: rem(34),
    fontWeight: 900,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(24),
    },
  },

  featuresDescription: {
    maxWidth: 600,
    margin: "auto",

    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  card: {
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },

  clubsWrapper: {
    paddingTop: rem(80),
    paddingBottom: rem(80),
  },

  item: {
    display: "flex",
  },

  itemIcon: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.md,
  },

  itemTitle: {
    marginBottom: `calc(${theme.spacing.xs} / 2)`,
  },

  supTitle: {
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: 800,
    fontSize: theme.fontSizes.sm,
    color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
      .color,
    letterSpacing: rem(0.5),
  },

  clubsTitle: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    marginBottom: theme.spacing.md,
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  clubsDescription: {
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      textAlign: "left",
    },
  },

  clubsHighlight: {
    backgroundColor: theme.fn.variant({
      variant: "light",
      color: theme.primaryColor,
    }).background,
    padding: rem(5),
    paddingTop: 0,
    borderRadius: theme.radius.sm,
    display: "inline-block",
    color: theme.colorScheme === "dark" ? theme.white : "inherit",
  },

  clubCard: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  clubSection: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },

  thinkWrapper: {
    position: "relative",
    paddingTop: rem(80),
    paddingBottom: rem(80),

    [theme.fn.smallerThan("sm")]: {
      paddingTop: rem(80),
      paddingBottom: rem(60),
    },
  },

  thinkInner: {
    position: "relative",
    zIndex: 1,
  },

  thinkDots: {
    position: "absolute",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[1],

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  thinkDotsLeft: {
    left: 0,
    top: 0,
  },

  thinkTitle: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: rem(40),
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    marginBottom: theme.spacing.xs,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  thinkHighlight: {
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6],
  },

  thinkDescription: {
    textAlign: "center",

    [theme.fn.smallerThan("xs")]: {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  thinkControls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  thinkControl: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    [theme.fn.smallerThan("xs")]: {
      height: rem(42),
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },
}));

const HeroSection = () => {
  const { classes, cx } = useStyles();

  return (
    <div className={classes.wrapper} style={{ marginTop: "-1rem" }}>
      <Overlay color="#000" opacity={0.65} zIndex={1} />

      <div className={classes.inner}>
        <Title className={classes.title}>
          Explore Thriving Clubs at{" "}
          <Text component="span" inherit className={classes.highlight}>
            Xavier International College
          </Text>
        </Title>

        <Container size={640}>
          <Text size="lg" className={classes.description}>
            Discover the diverse range of clubs available at Xavier
            International College and join a community that shares your
            interests and passions.
          </Text>
        </Container>

        <div className={classes.controls}>
          <Button
            component={Link}
            href="/#clubs"
            className={classes.control}
            variant="white"
            size="lg"
          >
            View All Clubs
          </Button>
          <Button
            component={Link}
            href="/about"
            className={cx(classes.control, classes.secondaryControl)}
            size="lg"
          >
            About Us
          </Button>
        </div>
      </div>
    </div>
  );
};

const mockdata = [
  {
    title: "Explore Your Interests",
    description:
      "With a diverse range of clubs available at Xavier International College, there's something for everyone. Discover new passions and meet like-minded individuals through our thriving club community.",
    icon: IconGauge,
  },
  {
    title: "Build Connections",
    description:
      "Joining a club is a great way to meet new people and build meaningful connections. Whether you're new to campus or looking to expand your social circle, our clubs provide a welcoming space to connect with others.",
    icon: IconUser,
  },
  {
    title: "Achieve Your Goals",
    description:
      "Our clubs are dedicated to helping members achieve their goals, whether that's through academic pursuits, career development, or personal interests. Join a club and take your skills and passions to the next level.",
    icon: IconCookie,
  },
];

export function FeaturesCards() {
  const { classes, theme } = useStyles();
  const features = mockdata.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      padding="xl"
    >
      <feature.icon size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="xl" py="xl" my="5rem">
      <Group position="center">
        <Badge variant="filled" size="lg">
          Engage Yourself
        </Badge>
      </Group>

      <Title order={2} className={classes.featuresTitle} ta="center" mt="sm">
        Join a Thriving Club Community Today
      </Title>

      <Text
        c="dimmed"
        className={classes.featuresDescription}
        ta="center"
        mt="md"
      >
        Discover a diverse range of clubs at Xavier International College and
        explore your passions, build connections, and achieve your goals with
        like-minded individuals.
      </Text>

      <SimpleGrid
        cols={3}
        spacing="xl"
        mt={50}
        breakpoints={[{ maxWidth: "md", cols: 1 }]}
      >
        {features}
      </SimpleGrid>
    </Container>
  );
}

export const ClubsSection = (props: { clubs: IClub[] }) => {
  const { classes } = useStyles();

  return (
    <Container id="clubs" size="xl" className={classes.clubsWrapper}>
      <Title className={classes.clubsTitle}>All Clubs</Title>

      <Container size={560} p={0}>
        <Text size="sm" className={classes.clubsDescription}>
          Explore our diverse range of clubs and organizations at Xavier
          International College, catering to a wide range of interests,
          passions, and pursuits. Discover your community today.{" "}
        </Text>
      </Container>

      <SimpleGrid
        mt="2rem"
        cols={4}
        breakpoints={[
          { maxWidth: "lg", cols: 4 },
          { maxWidth: "md", cols: 3 },
          { maxWidth: "sm", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
        sx={{
          alignItems: "center",
        }}
      >
        {props.clubs.map((club) => (
          <ClubCard
            key={club._id}
            _id={club._id}
            image={club.profilePic}
            title={club.name}
            description={club.shortDescription}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};

interface ClubCardProps {
  _id: string;
  image: string;
  title: string;
  description: string;
}

export function ClubCard({ _id, image, title, description }: ClubCardProps) {
  const { classes } = useStyles();

  return (
    <Card withBorder radius="md" p="md" className={classes.clubCard}>
      <Card.Section>
        <CldImage
          width="1080"
          height="720"
          style={{ objectFit: "cover", width: "100%", height: rem(250) }}
          src={image}
          alt="Description of my image"
        />
      </Card.Section>

      <Card.Section className={classes.clubSection} mt="md">
        <Group position="apart">
          <Text fz="lg" fw={500}>
            {title}
          </Text>
        </Group>
        <Text fz="sm" mt="xs" lineClamp={3}>
          {description}
        </Text>
      </Card.Section>

      <Group mt="xs">
        <Button
          variant={"outline"}
          component={Link}
          href={`/clubs/${_id}`}
          radius="md"
          style={{ flex: 1 }}
        >
          View details
        </Button>
      </Group>
    </Card>
  );
}

export function WhatAreYouThinkingSection() {
  const { classes } = useStyles();

  return (
    <Container className={classes.thinkWrapper} size="xl">
      <Dots className={classes.thinkDots} style={{ left: 0, top: 0 }} />
      <Dots className={classes.thinkDots} style={{ left: 60, top: 0 }} />
      <Dots className={classes.thinkDots} style={{ left: 0, top: 140 }} />
      <Dots className={classes.thinkDots} style={{ right: 0, top: 60 }} />

      <div className={classes.thinkInner}>
        <Title className={classes.thinkTitle}>
          Get Involved:{" "}
          <Text component="span" className={classes.thinkHighlight} inherit>
            Join
          </Text>{" "}
          a Club Today
        </Title>

        <Container p={0} size={620}>
          <Text size="lg" color="dimmed" className={classes.thinkDescription}>
            Joining a club is a great way to connect with like-minded
            individuals, explore your passions, and enhance your college
            experience. Discover your community and get involved today!
          </Text>
        </Container>

        <div className={classes.thinkControls}>
          <Button
            className={classes.thinkControl}
            size="lg"
            variant="default"
            color="gray"
            component={Link}
            href="/about"
          >
            Want to know more?
          </Button>
          <Button
            component={Link}
            href="/contact"
            className={classes.thinkControl}
            size="lg"
          >
            Have doubts?
          </Button>
        </div>
      </div>
    </Container>
  );
}

export const BlogsSection = (props: { blogs: IBlog[] }) => {
  const { classes } = useStyles();

  return (
    <Container id="clubs" size="xl" className={classes.clubsWrapper}>
      <Title className={classes.clubsTitle}>Blogs</Title>

      <Container size={560} p={0}>
        <Text size="sm" className={classes.clubsDescription}>
          Explore our diverse range of clubs and organizations at Xavier
          International College, catering to a wide range of interests,
          passions, and pursuits. Discover your community today.
        </Text>
      </Container>

      <SimpleGrid
        mt="2rem"
        cols={4}
        breakpoints={[
          { maxWidth: "lg", cols: 4 },
          { maxWidth: "md", cols: 3 },
          { maxWidth: "sm", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
        sx={{
          alignItems: "center",
        }}
      >
        {props.blogs.map((blog) => (
          <BlogCard
            key={blog._id}
            image={blog.featuredImage}
            title={blog.title}
            createdAt={new Date(blog.createdAt)}
            href={`/blogs/${blog._id}`}
            author={{
              name: (blog.author.club as any).name,
              image: (blog.author.club as any).profilePic,
            }}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};

interface DotsProps extends React.ComponentPropsWithoutRef<"svg"> {
  size?: number;
  radius?: number;
}

function Dots({ size = 185, radius = 2.5, ...others }: DotsProps) {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 185 185"
      width={size}
      height={size}
      {...others}
    >
      <rect width="5" height="5" rx={radius} />
      <rect width="5" height="5" x="60" rx={radius} />
      <rect width="5" height="5" x="120" rx={radius} />
      <rect width="5" height="5" x="20" rx={radius} />
      <rect width="5" height="5" x="80" rx={radius} />
      <rect width="5" height="5" x="140" rx={radius} />
      <rect width="5" height="5" x="40" rx={radius} />
      <rect width="5" height="5" x="100" rx={radius} />
      <rect width="5" height="5" x="160" rx={radius} />
      <rect width="5" height="5" x="180" rx={radius} />
      <rect width="5" height="5" y="20" rx={radius} />
      <rect width="5" height="5" x="60" y="20" rx={radius} />
      <rect width="5" height="5" x="120" y="20" rx={radius} />
      <rect width="5" height="5" x="20" y="20" rx={radius} />
      <rect width="5" height="5" x="80" y="20" rx={radius} />
      <rect width="5" height="5" x="140" y="20" rx={radius} />
      <rect width="5" height="5" x="40" y="20" rx={radius} />
      <rect width="5" height="5" x="100" y="20" rx={radius} />
      <rect width="5" height="5" x="160" y="20" rx={radius} />
      <rect width="5" height="5" x="180" y="20" rx={radius} />
      <rect width="5" height="5" y="40" rx={radius} />
      <rect width="5" height="5" x="60" y="40" rx={radius} />
      <rect width="5" height="5" x="120" y="40" rx={radius} />
      <rect width="5" height="5" x="20" y="40" rx={radius} />
      <rect width="5" height="5" x="80" y="40" rx={radius} />
      <rect width="5" height="5" x="140" y="40" rx={radius} />
      <rect width="5" height="5" x="40" y="40" rx={radius} />
      <rect width="5" height="5" x="100" y="40" rx={radius} />
      <rect width="5" height="5" x="160" y="40" rx={radius} />
      <rect width="5" height="5" x="180" y="40" rx={radius} />
      <rect width="5" height="5" y="60" rx={radius} />
      <rect width="5" height="5" x="60" y="60" rx={radius} />
      <rect width="5" height="5" x="120" y="60" rx={radius} />
      <rect width="5" height="5" x="20" y="60" rx={radius} />
      <rect width="5" height="5" x="80" y="60" rx={radius} />
      <rect width="5" height="5" x="140" y="60" rx={radius} />
      <rect width="5" height="5" x="40" y="60" rx={radius} />
      <rect width="5" height="5" x="100" y="60" rx={radius} />
      <rect width="5" height="5" x="160" y="60" rx={radius} />
      <rect width="5" height="5" x="180" y="60" rx={radius} />
      <rect width="5" height="5" y="80" rx={radius} />
      <rect width="5" height="5" x="60" y="80" rx={radius} />
      <rect width="5" height="5" x="120" y="80" rx={radius} />
      <rect width="5" height="5" x="20" y="80" rx={radius} />
      <rect width="5" height="5" x="80" y="80" rx={radius} />
      <rect width="5" height="5" x="140" y="80" rx={radius} />
      <rect width="5" height="5" x="40" y="80" rx={radius} />
      <rect width="5" height="5" x="100" y="80" rx={radius} />
      <rect width="5" height="5" x="160" y="80" rx={radius} />
      <rect width="5" height="5" x="180" y="80" rx={radius} />
      <rect width="5" height="5" y="100" rx={radius} />
      <rect width="5" height="5" x="60" y="100" rx={radius} />
      <rect width="5" height="5" x="120" y="100" rx={radius} />
      <rect width="5" height="5" x="20" y="100" rx={radius} />
      <rect width="5" height="5" x="80" y="100" rx={radius} />
      <rect width="5" height="5" x="140" y="100" rx={radius} />
      <rect width="5" height="5" x="40" y="100" rx={radius} />
      <rect width="5" height="5" x="100" y="100" rx={radius} />
      <rect width="5" height="5" x="160" y="100" rx={radius} />
      <rect width="5" height="5" x="180" y="100" rx={radius} />
      <rect width="5" height="5" y="120" rx={radius} />
      <rect width="5" height="5" x="60" y="120" rx={radius} />
      <rect width="5" height="5" x="120" y="120" rx={radius} />
      <rect width="5" height="5" x="20" y="120" rx={radius} />
      <rect width="5" height="5" x="80" y="120" rx={radius} />
      <rect width="5" height="5" x="140" y="120" rx={radius} />
      <rect width="5" height="5" x="40" y="120" rx={radius} />
      <rect width="5" height="5" x="100" y="120" rx={radius} />
      <rect width="5" height="5" x="160" y="120" rx={radius} />
      <rect width="5" height="5" x="180" y="120" rx={radius} />
      <rect width="5" height="5" y="140" rx={radius} />
      <rect width="5" height="5" x="60" y="140" rx={radius} />
      <rect width="5" height="5" x="120" y="140" rx={radius} />
      <rect width="5" height="5" x="20" y="140" rx={radius} />
      <rect width="5" height="5" x="80" y="140" rx={radius} />
      <rect width="5" height="5" x="140" y="140" rx={radius} />
      <rect width="5" height="5" x="40" y="140" rx={radius} />
      <rect width="5" height="5" x="100" y="140" rx={radius} />
      <rect width="5" height="5" x="160" y="140" rx={radius} />
      <rect width="5" height="5" x="180" y="140" rx={radius} />
      <rect width="5" height="5" y="160" rx={radius} />
      <rect width="5" height="5" x="60" y="160" rx={radius} />
      <rect width="5" height="5" x="120" y="160" rx={radius} />
      <rect width="5" height="5" x="20" y="160" rx={radius} />
      <rect width="5" height="5" x="80" y="160" rx={radius} />
      <rect width="5" height="5" x="140" y="160" rx={radius} />
      <rect width="5" height="5" x="40" y="160" rx={radius} />
      <rect width="5" height="5" x="100" y="160" rx={radius} />
      <rect width="5" height="5" x="160" y="160" rx={radius} />
      <rect width="5" height="5" x="180" y="160" rx={radius} />
      <rect width="5" height="5" y="180" rx={radius} />
      <rect width="5" height="5" x="60" y="180" rx={radius} />
      <rect width="5" height="5" x="120" y="180" rx={radius} />
      <rect width="5" height="5" x="20" y="180" rx={radius} />
      <rect width="5" height="5" x="80" y="180" rx={radius} />
      <rect width="5" height="5" x="140" y="180" rx={radius} />
      <rect width="5" height="5" x="40" y="180" rx={radius} />
      <rect width="5" height="5" x="100" y="180" rx={radius} />
      <rect width="5" height="5" x="160" y="180" rx={radius} />
      <rect width="5" height="5" x="180" y="180" rx={radius} />
    </svg>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  await connectDatabase();

  const clubs = (await Club.find()) as IClub[];

  const blogs = (await Blog.find({ status: "public" })
    .limit(8)
    .populate("author.club", "name profilePic")) as IBlog[];

  return {
    props: {
      clubs: JSON.parse(JSON.stringify(clubs)),
      blogs: JSON.parse(JSON.stringify(blogs)),
    },
    revalidate: 100,
  };
};
