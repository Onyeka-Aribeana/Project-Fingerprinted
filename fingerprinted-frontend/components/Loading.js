import Box from "./Box";
import { Loading } from "@nextui-org/react";

const LoadingPoints = () => {
  return (
    <Box
      css={{
        p: "$8",
        bg: "$backgroundContrast",
        boxShadow: "$md",
        textAlign: "center",
        br: "$base",
        color: "$accents6",
        fs: "0.9rem",
      }}
    >
      <Loading type="points" size="xl" color="secondary" />
    </Box>
  );
}

export default LoadingPoints;