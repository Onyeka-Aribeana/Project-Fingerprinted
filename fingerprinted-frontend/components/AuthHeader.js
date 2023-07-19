import React from "react";
import { Text, Spacer } from "@nextui-org/react";

const AuthHeader = ({ heading, subtext }) => {
  return (
    <>
      <Text h2 size={28} css={{ my: "$0"}}>
        {heading}
      </Text>
      <Text weight="normal">
        {subtext}
      </Text>
    </>
  );
};

export default AuthHeader;
