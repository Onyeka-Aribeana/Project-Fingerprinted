import React from 'react'
import Box from './Box';

const NotFound = ({error}) => {
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
      {error}
    </Box>
  );
}

export default NotFound