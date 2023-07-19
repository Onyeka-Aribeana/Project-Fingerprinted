import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import Meta from "../../components/Meta";
import Logo from "../../components/Logo";
import AuthCard from "../../components/AuthCard";
import AuthHeader from "../../components/AuthHeader";
import React from "react";
import { Card, Input, Button, Spacer, useInput } from "@nextui-org/react";
import "react-toastify/dist/ReactToastify.css";
import { signIn, useSession } from "next-auth/react";
import { showNotification, validateEmail } from "../../components/utils";

const Login = () => {
  const route = useRouter();
  const { status } = useSession();
  const email = useInput("");
  const password = useInput("");

  useEffect(() => {
    if (status === "authenticated") {
      route.push("/");
    }
  });

  const emailhelper = useMemo(() => {
    if (!email.value) {
      return {
        text: "",
        color: "secondary",
      };
    }
    const isValid = validateEmail(email.value);
    return {
      text: isValid ? "" : "Please enter a valid email address",
      color: isValid ? "secondary" : "error",
    };
  }, [email.value]);

  const loginUser = async () => {
    if (!email.value || !password.value) {
      showNotification({ error: "Please fill all required fields" });
      return;
    }

    if (emailhelper.color === "error") {
      showNotification({ error: "Please enter a valid email address" });
      return;
    }

    const res = await signIn("credentials", {
      email: email.value,
      password: password.value,
      redirect: false,
    });

    if (res["error"] && !res.ok) {
      showNotification(res);
      return;
    }
  };

  return (
    <>
      <Meta title="Login" desc="Login in to Biodance" />
      <AuthCard>
        <Card css={{ mw: "400px", w: "100%", mr: "auto", ml: "auto" }}>
          <Card.Header>
            <Logo size={28} />
          </Card.Header>
          <Card.Divider />
          <Card.Body>
            <AuthHeader
              heading="Welcome Back!"
              subtext="Please enter your email and password."
            />
            <Spacer y={0.4} />
            <Input
              {...email.bindings}
              bordered
              color={emailhelper.color}
              helperColor={emailhelper.color}
              helperText={emailhelper.text}
              label="Email"
              placeholder="hi@example.com"
            />
            <Spacer y={1} />
            <Input.Password
              {...password.bindings}
              bordered
              color="secondary"
              label="Password"
              placeholder="Enter password"
            />
            <Spacer y={1.5} />
            <Button auto color="secondary" shadow onPress={loginUser}>
              Sign in
            </Button>
          </Card.Body>
        </Card>
      </AuthCard>
    </>
  );
};

export default Login;
