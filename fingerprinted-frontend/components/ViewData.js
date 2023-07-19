import React, { useState, useEffect } from "react";
import Box from "./Box";
import Meta from "./Meta";
import { makeAPIRequest } from "./utils";
import { Badge, Text } from "@nextui-org/react";

const ViewData = ({ id }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (id) => {
    const response = await makeAPIRequest(
      "http://localhost/fingerprinted/api/students/get_student_data.php",
      { id: id }
    );
    setData(response);
  };

  return (
    <>
      <Meta title="Student Information" desc="View student information" />
      <Box>
        {data && !data.error && (
          <Box>
            <Text
              css={{ m: 0, px: "0.8rem", fs: "1.8rem", fontWeight: "bold" }}
            >
              Student Information
            </Text>
            <hr />
            <Box css={{ p: "0.8rem" }}>
              <Text>
                <b>Name:&nbsp;</b> {data.first_name} {data.last_name}
              </Text>
              <Text>
                <b>Email:&nbsp;</b> {data.email}
              </Text>
              <Text>
                <b>Matric No.:&nbsp;</b> {data.matric_no}
              </Text>
              <Text>
                <b>Gender:&nbsp;</b> {data.gender}
              </Text>
              {data.courses && data.courses.length > 0 && (
                <>
                  <Text css={{ m: 0, fs: "1.2rem", fontWeight: "bold" }}>
                    Enrolled courses:
                  </Text>
                  {data.courses.map((course) => (
                    <Box key={course.course_code}>
                      {course.course_code}: &nbsp;
                      <Badge
                        color={
                          course.average_attendance >= 0.7 ? "success" : "error"
                        }
                        variant="flat"
                        size="sm"
                        isSquared
                      >
                        {Math.round(course.average_attendance * 100)}%
                      </Badge>{" "}
                      attendance rate
                    </Box>
                  ))}
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ViewData;
