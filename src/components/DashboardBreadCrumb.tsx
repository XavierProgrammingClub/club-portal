import { Anchor, Breadcrumbs } from "@mantine/core";
import Link from "next/link";

type BreadcrumbItem = {
  title: string;
  href: string;
};

interface IProps {
  items: BreadcrumbItem[];
}

export const DashboardBreadCrumb = (props: IProps) => {
  const items = props.items.map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return <Breadcrumbs>{items}</Breadcrumbs>;
};
