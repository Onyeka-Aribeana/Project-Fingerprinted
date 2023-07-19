import Box from "./Box";

import Nav from "./Nav";

const Layout = ({ children }) => {
  return (
    <Box css={{ position: "relative", bg: "$backgroundContrast" }}>
      <Nav />
      <Box
        css={{
          w: "100%",
          minHeight: "90vh",
          position: "relative",
          m: "0 auto",
          maxWidth: "1280px",
          p: "1rem",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
