import { styled } from "@nextui-org/react";

const IconButton = styled("button", {
  dflex: "center",
  border: "none",
  br: "$xs",
  outline: "none",
  cursor: "pointer",
  padding: "0.4rem",
  margin: "0",
  bg: "transparent",
  transition: "$default",
  variants: {
    type: {
      neutral: {
        color: "$neutral",
      },
      primary: {
        color: "$primary",
      },
      error: {
        color: "$error",
      },
      normal: {
        color: "$accents6",
        "&:hover": {
          color: "$accents9",
        },
      },
    },
  },
  "&:hover": {
    opacity: "0.8",
    bg: "$accents0",
    p: "0.4rem",
  },
  "&:active": {
    opacity: "0.6",
  },
});

export default IconButton;
