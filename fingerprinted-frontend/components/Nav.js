import { Navbar, Dropdown, Text, Avatar, Link } from "@nextui-org/react";
import Logo from "./Logo";
import { links } from "../data/dummy";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

const Nav = () => {
  const { data, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signIn");
    }
  }, [status]);

  const handleClick = (e, path) => {
    e.preventDefault();
    router.push(path);
  };

  return (
    <Navbar variant="static">
      <Navbar.Toggle showIn="xs" />
      <Navbar.Brand>
        <Logo size="1.5rem" />
      </Navbar.Brand>
      <Navbar.Content
        enableCursorHighlight
        activeColor="secondary"
        hideIn="xs"
        variant="underline-rounded"
      >
        {links.map((link) => (
          <Navbar.Link
            key={link.name}
            isActive={router.asPath === link.path}
            href={link.path}
            onClick={(e) => handleClick(e, link.path)}
          >
            {link.name}
          </Navbar.Link>
        ))}
      </Navbar.Content>
      <Navbar.Content
        css={{
          "@xs": {
            w: "12%",
            jc: "flex-end",
          },
        }}
      >
        <Dropdown placement="bottom-right">
          <Navbar.Item>
            <Dropdown.Trigger>
              <Avatar
                bordered
                as="button"
                color="secondary"
                size="md"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </Dropdown.Trigger>
          </Navbar.Item>
          <Dropdown.Menu aria-label="User menu actions" color="secondary">
            <Dropdown.Item key="profile" css={{ height: "$18" }}>
              {status === "authenticated" && (
                <Text>Signed in as {data.user.email}</Text>
              )}
            </Dropdown.Item>
            <Dropdown.Item key="logout" withDivider color="error">
              <Link
                color="inherit"
                css={{
                  minWidth: "100%",
                }}
                href="/auth/signIn"
                onClick={(e) => {
                  e.preventDefault();
                  signOut({
                    callbackUrl: "/auth/signIn",
                  });
                }}
              >
                Logout
              </Link>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Content>
      <Navbar.Collapse>
        {links.map((item, index) => (
          <Navbar.CollapseItem
            key={index}
            activeColor="secondary"
            isActive={router.asPath === item.link}
          >
            <Link
              color="inherit"
              css={{
                minWidth: "100%",
              }}
              href={item.link}
              onClick={(e) => handleClick(e, item.path)}
            >
              {item.name}
            </Link>
          </Navbar.CollapseItem>
        ))}
        <Navbar.CollapseItem key={"logout"} css={{ color: "$error" }}>
          <Link
            color="inherit"
            css={{
              minWidth: "100%",
            }}
            href="/auth/signIn"
            onClick={(e) => {
              e.preventDefault();
              signOut({ callbackUrl: "/auth/signIn" });
            }}
          >
            Logout
          </Link>
        </Navbar.CollapseItem>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Nav;
