import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthCard from "../../components/AuthCard";
import Box from "../../components/Box";
import { makeAPIRequest } from "../../components/utils";
import LoadingPoints from "../../components/Loading";
import { Loading } from "@nextui-org/react";
import ViewData from "@/components/ViewData";

const Student = () => {
  const router = useRouter();
  const matric_no = router.query.matric_no;
  const [id, setId] = useState(null);

  useEffect(() => {
    if (matric_no) {
      fetchID(matric_no);
    }
  }, [matric_no]);

  const fetchID = async (matric) => {
    const response = await makeAPIRequest(
      "http://localhost/fingerprinted/api/students/get_id.php",
      { matric_no: matric }
    );
    setId(response);
  };

  return (
    <AuthCard>
      {id && !id.error && (
        <Box
          css={{
            borderRadius: "$md",
            py: "0.8rem",
            bg: "$backgroundContrast",
            boxShadow: "$md",
            mw: "400px",
            w: "100%",
            mr: "auto",
            ml: "auto",
          }}
        >
          <ViewData id={id} />
        </Box>
      )}
      {id && id.error && (
        <Box
          css={{
            borderRadius: "$md",
            p: "0.8rem",
            bg: "$backgroundContrast",
            boxShadow: "$md",
            mw: "400px",
            w: "100%",
            mr: "auto",
            ml: "auto",
          }}
        >
          {id.error}
        </Box>
      )}
    </AuthCard>
  );
};

export default Student;
