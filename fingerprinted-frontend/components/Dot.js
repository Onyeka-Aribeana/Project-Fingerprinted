import { styled } from "@nextui-org/react";

const Dot = styled("div", {
  boxSizing: "border-box",
  borderRadius: "50%",
  width: "6px",
  height: "6px",
  mt: "0.2rem",
  paddingLeft: "2px",
  variants: {
    type: {
      primary: {
        bg: "$primary",
      },
      secondary: {
        bg: "$secondary",
      },
    },
  },
});

export default Dot;
