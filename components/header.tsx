import { useEffect, useState } from "react";
import {
  Text,
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  rem,
  Title,
  Avatar,
  Flex,
  Box,
  Center,
  Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getCookie } from "cookies-next";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

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

interface HeaderSimpleProps {
  links: { link: string; label: string }[];
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, cx } = useStyles();

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={cx(classes.link, {
        [classes.linkActive]: active === link.link,
      })}
      onClick={(event) => {
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  const [address, setAddress] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  useEffect(() => {
    if (getCookie("address")) {
      // @ts-expect-error
      setAddress(getCookie("address"));
      // @ts-expect-error
      setProfilePicture(getCookie("profilePicture"));
    }
  }, []);

  return (
    <Header height={60} mb={120}>
      <Container className={classes.header}>
        {/* <MantineLogo size={28} /> */}
        {/* <Title>(LOGO HERE)</Title> */}
        <Center>
          <Image
            width={40}
            src={`https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/300px-Bitcoin.svg.png`}
          />
          <Title ml={5} sx={{ fontWeight: 500 }}>
            Fake BTC
          </Title>
        </Center>
        <Group spacing={5} className={classes.links}>
          {address ? (
            <Center
              sx={{ flexDirection: "column", justifyContent: "flex-end" }}
            >
              <Avatar radius="xl" src={profilePicture} />
              <Text size="xs">{address}</Text>
            </Center>
          ) : (
            items
          )}
        </Group>
      </Container>
    </Header>
  );
}
