import useSWR from "swr";
import { useState, useMemo, useEffect } from "react";
import DataTable from "../components/DataTable";
import Box from "../components/Box";
import LoadingPoints from "../components/Loading";
import NotFound from "../components/NotFound";
import Layout from "../components/Layout";
import IconButton from "../components/IconButton";
import Popup from "../components/Popup";
import Select from "../components/Select";
import InputField from "../components/InputField";
import LineChart from "../components/LineChart";
import { BsDownload } from "react-icons/bs";
import {
  Button,
  Text,
  useInput,
  Card,
  Tooltip,
  useModal,
  Row,
  Badge,
  Loading,
  Col,
  Table,
} from "@nextui-org/react";
import {
  makeAPIRequest,
  showNotification,
  fetchValidCourses,
  fetchStudentPercentages,
} from "../components/utils";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import BarChart from "../components/BarChart";

const fetcher = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/attendance/read.php"
  );
  const data = await response.json();
  return data;
};

const recent_fetcher = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/attendance/recent_reports.php"
  );

  const data = await response.json();
  return data;
};

const fetch_rates = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/attendance/generate_rates.php"
  );

  const data = await response.json();
  return data;
};

const Attendance = () => {
  // client-side fetching method using swr
  const { data, error } = useSWR("attendance_list", fetcher, {
    refreshInterval: 1000,
  });
  const recent_reports = useSWR("recent_reports", recent_fetcher);
  const courses = useSWR("courses", fetchValidCourses);
  const attendance_rates = useSWR("rates", fetch_rates);
  const student_percentages = useSWR(
    "student_percentages",
    fetchStudentPercentages
  );

  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const generateReportModal = useModal();
  const generateRatesModal = useModal();
  const dateInput = useInput("");
  const normalState = {
    text: "",
    color: "secondary",
  };

  const [dateHelper, setDateHelper] = useState(normalState);

  const [course, setCourse] = useState(new Set(["none"]));
  const selectedCourse = useMemo(
    () => Array.from(course).join(", ").replaceAll("_", " "),
    [course]
  );
  const [courseOptions, setCourseOptions] = useState(null);

  const [rate, setRate] = useState(new Set([20]));
  const selectedRate = useMemo(
    () => Array.from(rate).join(", ").replaceAll("_", " "),
    [rate]
  );

  const rateOptions = [
    {
      id: 1,
      name: 20,
    },
    {
      id: 2,
      name: 40,
    },
    {
      id: 3,
      name: 60,
    },
    {
      id: 4,
      name: 80,
    },
    {
      id: 5,
      name: 100,
    },
  ];

  const columns = [
    {
      key: "fullname",
      label: "NAME",
    },
    {
      key: "matric_no",
      label: "MATRIC. NO.",
    },
    {
      key: "device_name",
      label: "DEVICE ID",
    },
    {
      key: "lecture",
      label: "LECTURE",
    },
    {
      key: "checkInTime",
      label: "CHECK IN TIME",
    },
    {
      key: "checkInDate",
      label: "DATE",
    },
  ];

  const student_column = [
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "course_code",
      label: "LECTURE",
    },
    {
      key: "average_attendance",
      label: "ATTENDANCE %",
    },
  ];

  const renderStudentCell = (data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <Col>
            <Text>
              {data.first_name} {data.last_name}
            </Text>
          </Col>
        );

      case "course_code":
        return (
          <Col>
            <Text>{data.course_code}</Text>
          </Col>
        );

      case "average_attendance":
        return (
          <Col>
            <Badge
              color={data.average_attendance >= 0.7 ? "success" : "error"}
              variant="flat"
              size="md"
              isSquared
            >
              {Math.round(data.average_attendance * 100)}%
            </Badge>
          </Col>
        );

      default:
        return cellValue;
    }
  };

  useEffect(() => {
    if (courses.data && courses.data?.data?.length > 0) {
      setCourseOptions(courses.data?.data);
      setActiveTab(courses.data?.data[0]["id"]);
    }
  }, [courses.data]);

  const renderCell = (user, columnKey) => {
    const cellValue = user[columnKey];
    return cellValue;
  };

  const resetToNormal = () => {
    setDateHelper(normalState);
  };

  const validateFields = () => {
    let valid = true;
    if (dateInput.value === "") {
      setDateHelper({ text: "Please enter event description", color: "error" });
      valid = false;
    }

    return valid;
  };

  const showGenerate = () => {
    if (courseOptions?.length === 0 || !courseOptions) {
      showNotification({
        error: "Cannot generate report: No courses available.",
      });
      return;
    }
    dateInput.setValue("");
    setCourse(new Set(["none"]));
    generateReportModal.setVisible(true);
  };

  const showRate = () => {
    if (courseOptions?.length === 0 || !courseOptions) {
      showNotification({
        error: "Cannot generate report: No courses available.",
      });
      return;
    }
    setCourse(new Set(["none"]));
    setRate(new Set([20]));
    generateRatesModal.setVisible(true);
  };

  const generateRates = async () => {
    const [courseCode] = course;
    const [attendance_rate] = rate;
    if (courseCode != "none") {
      let id = courseOptions.filter((course) => course.name == courseCode)[0][
        "id"
      ];

      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/attendance/attendance_rates.php",
        {
          course: id,
          attendance_rate: attendance_rate,
          course_code: courseCode,
        }
      );

      showNotification(data);
      if (data["data"]) {
        downloadRates(data["data"]);
        generateRatesModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please select course" });
    }
  };

  const generateReport = async () => {
    resetToNormal();
    const [courseCode] = course;
    let pass = validateFields();

    if (pass && courseCode != "none") {
      let id = courseOptions.filter((course) => course.name == courseCode)[0][
        "id"
      ];

      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/attendance/generate_report.php",
        {
          date: dateInput.value,
          course: id,
          course_code: courseCode,
        }
      );

      showNotification(data);
      if (data["data"]) {
        for (const lecture of data["data"]) {
          downloadReport(lecture[1], lecture[0]);
        }
        generateReportModal.setVisible(false);
      }
    } else {
      if (dateInput.value == "") {
        showNotification({ error: "Please fill all required fields" });
      } else {
        showNotification({ error: "Please select course" });
      }
    }
  };

  const downloadReport = (data, details) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    const heading = [
      [
        "No.",
        "Fullname",
        "Matric. No.",
        "Device Name",
        "Check In Time",
        "Check In Date",
        "Lecture",
      ],
    ];
    XLSX.utils.sheet_add_aoa(worksheet, heading, { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(
      workbook,
      details["course_code"] +
        "-" +
        details["lecture_id"] +
        "-" +
        details["checkInDate"] +
        ".xlsx"
    );
  };

  const downloadRates = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    const heading = [
      ["No.", "Fullname", "Matric. No.", "Lecture", "Attendance %"],
    ];
    XLSX.utils.sheet_add_aoa(worksheet, heading, { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, data[0]["lecture"] + ".xlsx");
  };

  const downloadRecentReport = async (lecture) => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/attendance/export_to_excel.php",
      lecture
    );
    downloadReport(data["data"], lecture);
  };

  return (
    <>
      <Layout>
        <Box
          css={{
            d: "flex",
            justifyContent: "space-between",
            ai: "center",
            my: "1.4rem",
          }}
        >
          <Text h3 css={{ m: "0" }}>
            Attendance Reports
          </Text>
          <Button color="secondary" auto size="sm" onPress={showGenerate}>
            Generate Report
          </Button>
        </Box>
        {attendance_rates.data?.rates && (
          <>
            <BarChart rates={attendance_rates.data.rates} />
            {courseOptions?.length !== 0 && courseOptions && (
              <Box
                css={{
                  p: "0.5rem",
                  bg: "$backgroundContrast",
                  boxShadow: "$md",
                  textAlign: "center",
                  br: "$base",
                  color: "$accents6",
                  fs: "0.9rem",
                }}
              >
                <Box
                  css={{
                    dflex: "center",
                    overflowX: "auto",
                    ai: "center",
                    gap: "0.8rem",
                    mb: "0.8rem",
                    flexWrap: "wrap",
                    px: "1rem",
                  }}
                >
                  <Text h5 css={{ m: 0 }}>
                    Attendance rates by lecture
                  </Text>
                  <Button.Group color="secondary" ghost size="sm">
                    {courseOptions.map((course) => (
                      <Button
                        key={course.id}
                        onPress={() => handleTabClick(course.id)}
                      >
                        {course.name}
                      </Button>
                    ))}
                  </Button.Group>
                </Box>
                {courseOptions.map((course) => (
                  <Box key={course.id}>
                    {activeTab == course.id && (
                      <LineChart
                        rates={attendance_rates.data.rates}
                        id={course.id}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
        <Text h3 css={{ m: "0", mb: "0.5rem", mt: "1rem" }}>
          Attendance Today
        </Text>
        {data?.data &&
          data.data.map((lecture, id) => (
            <Box key={lecture["lecture_id"]} css={{ mb: "0.5rem" }}>
              {id === 0 && (
                <>
                  <Box
                    css={{
                      d: "flex",
                      justifyContent: "space-between",
                      ai: "center",
                      mb: "1rem",
                    }}
                  >
                    <Text h4 css={{ mb: "0.5rem" }}>
                      {lecture[0]["course_code"]} lecture
                    </Text>
                    <Button
                      color="secondary"
                      auto
                      size="sm"
                      onPress={() => downloadReport(lecture[1], lecture[0])}
                    >
                      Download Report
                    </Button>
                  </Box>
                  <DataTable
                    columns={columns}
                    data={lecture[1]}
                    renderCell={renderCell}
                  />
                </>
              )}
              {/* {id !== 0 && (
                <Card css={{ m: "0" }}>
                  <Card.Body css={{ p: "0.5rem" }}>
                    <Box css={{ dflex: "space-between" }}>
                      <Text css={{ mb: "0" }}>
                        {lecture[0]["course_code"]} lecture attendance report
                        for {lecture[0]["checkInDate"]}
                      </Text>
                      <Tooltip content="Download Report">
                        <IconButton
                          type="normal"
                          onClick={() => downloadReport(lecture[1], lecture[0])}
                        >
                          <BsDownload size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card.Body>
                </Card>
              )} */}
            </Box>
          ))}
        {data?.error && <NotFound error={data["error"]} />}
        {!data && <LoadingPoints />}
        <Box
          css={{
            my: "1.4rem",
          }}
        >
          <Box
            css={{
              d: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "300px",
              gridAutoRows: "350px",
              gap: "1rem",
              "@xs": {
                gridTemplateColumns: "repeat(2, 1fr)",
              },
            }}
          >
            <Box
              css={{
                mt: "1rem",
                p: "0.5rem",
                borderRadius: "$md",
                boxShadow: "$md",
                bg: "$backgroundContrast",
                d: "flex",
                flexDirection: "column",
              }}
            >
              <Text h4 css={{ m: "0", mb: "0.5rem" }}>
                Recent Reports
              </Text>
              <Box
                css={{
                  overflowY: "auto",
                  flexBasis: "0px",
                  flexGrow: "1",
                }}
              >
                {recent_reports.data?.data &&
                  recent_reports.data?.data.map((lecture) => (
                    <Box
                      key={lecture["lecture_id"]}
                      css={{
                        dflex: "space-between",
                        bg: "$accents1",
                        padding: "0.5rem",
                        borderRadius: "$sm",
                        mb: "0.3rem",
                      }}
                    >
                      <Text css={{ mb: "0" }}>
                        {lecture["course_code"]} lecture attendance report for{" "}
                        {lecture["checkInDate"]}
                      </Text>
                      <Box>
                        <Tooltip content="Download Report">
                          <IconButton
                            type="normal"
                            onClick={() => downloadRecentReport(lecture)}
                          >
                            <BsDownload size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                 {!recent_reports.data && (
                  <Box css={{ textAlign: "center" }}>
                    <Loading color="secondary" type="points" size="xl" />
                  </Box>
                )}
                {recent_reports?.data?.error && (
                  <Box css={{ textAlign: "center" }}>
                    <Text css={{ color: "$accents6" }}>
                      {recent_reports.data["error"]}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
            <Box
              css={{
                mt: "1rem",
                p: "0.5rem",
                borderRadius: "$md",
                boxShadow: "$md",
                bg: "$backgroundContrast",
                d: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                css={{
                  d: "flex",
                  justifyContent: "space-between",
                  ai: "center",
                }}
              >
                <Text h4 css={{ m: "0", mb: "0.5rem" }}>
                  Top 10 attendees
                </Text>
                <Button color="secondary" auto size="sm" onPress={showRate}>
                  Generate Rates
                </Button>
              </Box>
              {!student_percentages.data && (
                <Box css={{ textAlign: "center" }}>
                  <Loading color="secondary" type="points" size="xl" />
                </Box>
              )}
              {student_percentages.data?.data && (
                <Box
                  css={{
                    overflowY: "auto",
                    flexBasis: "0px",
                    flexGrow: "1",
                  }}
                >
                  <DataTable
                    columns={student_column}
                    data={student_percentages.data.data.slice(0, 10)}
                    renderCell={renderStudentCell}
                  />
                </Box>
              )}
              {student_percentages.data?.error && (
                <Box css={{ textAlign: "center" }}>
                  <Text css={{ color: "$accents6" }}>
                    No student attendance rates found
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Popup
          header="Generate Report"
          onClick={generateReport}
          modal={generateReportModal}
        >
          <InputField
            input={dateInput}
            aria={`Date`}
            placeholder="Date"
            helper={dateHelper}
            type="date"
          />
          <Select
            selectedValue={selectedCourse}
            selected={course}
            setSelected={setCourse}
            items={courseOptions}
            type="Course"
          />
        </Popup>
        <Popup
          header="Generate Rates"
          onClick={generateRates}
          modal={generateRatesModal}
        >
          <Select
            selectedValue={selectedCourse}
            selected={course}
            setSelected={setCourse}
            items={courseOptions}
            type="Course"
          />
          <Select
            selectedValue={selectedRate}
            selected={rate}
            setSelected={setRate}
            items={rateOptions}
            type="Attendance Rates in %"
          />
        </Popup>
      </Layout>
    </>
  );
};

export default Attendance;
