import React from "react";
import Box from "./Box";
import { Text } from "@nextui-org/react";
import Link from "next/link";
import { MdFingerprint } from "react-icons/md";

const Logo = ({ size }) => {
  return (
    <Link href="/">
      <Box
        css={{
          d: "flex",
          gap: "0.4rem",
          ai: "center",
        }}
      >
        <MdFingerprint fontSize={size} />
        <Text
          css={{ color: "$text", fs: size, mt: "0.6rem" }}
          h1
        >
          Finger
          <Text color="secondary" span>
            Printed
          </Text>
        </Text>
      </Box>
    </Link>
  );
};

Logo.defaultProps = {
  size: "lg",
};

export default Logo;
