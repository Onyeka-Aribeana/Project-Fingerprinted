import { styled } from "@nextui-org/react";

const NumberButton = styled("button", {
  w: "1rem",
  h: "1rem",
  p: "1.2rem",
  my: "0.3rem",
  dflex: "center",
  border: "none",
  br: "$xl",
  outline: "none",
  cursor: "pointer",
  bg: "transparent",
  transition: "$default",
  variants: {
    type: {
      today: {
        color: "$secondary",
      },
      notToday: {
        color: "$accents9",
      },
      todaySelected: {
        bg: "$secondary",
        color: "$accents0",
        "&:hover": {
          bg: "$secondary",
        },
      },
      notTodaySelected: {
        bg: "$accents9",
        color: "$accents0",
        "&:hover": {
          bg: "$accents9",
        },
      },
    },
  },
  "&:hover": {
    bg: "$accents2",
  },
});

export default NumberButton;
