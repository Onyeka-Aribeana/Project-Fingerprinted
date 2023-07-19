import React from "react";
import Box from "./Box";
import { Text } from "@nextui-org/react";

const PageHeader = ({ heading, subtext }) => {
  return (
    <>
      <Box css={{mb: "1.5rem"}}>
        <Text h2 weight="semibold" css={{color: "$text", fs: "2rem", my: "$0"}}>{heading}</Text>
        <Text css={{color: "$accents6", fs: "1rem", my: "$0"}}>{subtext}</Text>
      </Box>
    </>
  );
};

export default PageHeader;
