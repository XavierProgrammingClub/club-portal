import {
  createStyles,
  Card,
  Text,
  Avatar,
  Badge,
  rem,
  Flex,
  Button,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import React from "react";
import TimeAgo from "react-timeago";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  footer: {
    padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
}));

type BlogCardProps = {
  image: string;
  status?: string;
  title: string;
  author: {
    name: string;
    image: string;
  };
  createdAt: Date;
  href: string;
  showActions?: boolean;
  editUrl?: string;
  onDelete?: () => void;
};

export const BlogCard = ({
  image,
  status,
  title,
  author,
  createdAt,
  href,
  onDelete,
  editUrl,
  showActions,
}: BlogCardProps) => {
  const { classes, theme } = useStyles();

  return (
    <Card withBorder padding="lg" radius="md" className={classes.card}>
      <Card.Section mb="sm">
        <CldImage
          src={image}
          alt={title}
          height={720}
          width={1080}
          {...{
            style: {
              height: "200px",
              width: "100%",
              objectFit: "cover",
            },
          }}
        />
      </Card.Section>

      {status ? <Badge>{status}</Badge> : null}

      <Text
        component={Link}
        href={href}
        fw={700}
        className={classes.title}
        mt="xs"
        display={"block"}
      >
        {title}
      </Text>

      <Flex mt="sm" gap="md">
        <div style={{ marginTop: "5px" }}>
          <Avatar
            src={`https://res.cloudinary.com/dmixkq1uo/image/upload/w_200/${author.image}`}
            radius="sm"
          />
        </div>
        <div>
          <Text fw={500}>{author.name}</Text>

          <Text fz="xs" c="dimmed" size="xs">
            Posted <TimeAgo live={false} date={createdAt} />
          </Text>
        </div>
      </Flex>

      <Card.Section className={classes.footer}>
        <Group position="apart">
          <Button
            variant={"outline"}
            component={Link}
            href={href}
            radius="md"
            style={{ flex: 1 }}
          >
            View details
          </Button>

          {showActions ? (
            <Group spacing={0}>
              {editUrl ? (
                <ActionIcon component={Link} href={editUrl}>
                  <IconEdit
                    size="1.2rem"
                    color={theme.colors.blue[6]}
                    stroke={1.5}
                  />
                </ActionIcon>
              ) : null}
              <ActionIcon onClick={onDelete}>
                <IconTrash
                  size="1.2rem"
                  color={theme.colors.red[6]}
                  stroke={1.5}
                />
              </ActionIcon>
            </Group>
          ) : null}
        </Group>
      </Card.Section>
    </Card>
  );
};
