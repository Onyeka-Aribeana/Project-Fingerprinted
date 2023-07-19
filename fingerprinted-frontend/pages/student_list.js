import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import Popup from "../components/Popup";
import DataTable from "../components/DataTable";
import Box from "../components/Box";
import IconButton from "../components/IconButton";
import LoadingPoints from "../components/Loading";
import NotFound from "../components/NotFound";
import Select from "../components/Select";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import ViewData from "../components/ViewData";
import {
  makeAPIRequest,
  showNotification,
  validateEmail,
  fetchValidCourses,
  fetchStudentPercentages,
} from "../components/utils";
import {
  Button,
  Modal,
  useModal,
  Text,
  useInput,
  Col,
  Tooltip,
  Row,
  Loading,
  Dropdown,
} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import { BiTrash, BiEditAlt } from "react-icons/bi";
import { MdFingerprint } from "react-icons/md";
import { AiOutlineEye } from "react-icons/ai";
import "react-toastify/dist/ReactToastify.css";

const fetcher = async () => {
  // function to fetch device list from database
  const response = await fetch(
    "http://localhost/fingerprinted/api/students/read.php"
  );
  const data = await response.json();
  return data;
};

const Students = () => {
  // client-side fetching method using swr
  const { data, error } = useSWR("student_list", fetcher, {
    refreshInterval: 5000,
  });
  const all_courses = useSWR("courses", fetchValidCourses, {
    refreshInterval: 1000,
  });

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const [header, setHeader] = useState("");
  const studentModal = useModal();
  const addFingerModal = useModal();
  const viewStudent = useModal();
  const deleteStudentModal = useModal();
  const firstName = useInput("");
  const lastName = useInput("");
  const email = useInput("");
  const matricNo = useInput("");
  const [studentID, setStudentID] = useState(null);
  const [deleteText, setDeleteText] = useState(null);
  const normalState = {
    text: "",
    color: "secondary",
  };
  const [firstHelper, setFirstHelper] = useState(normalState);
  const [lastHelper, setLastHelper] = useState(normalState);
  const [emailHelper, setEmailHelper] = useState(normalState);
  const [matricHelper, setMatricHelper] = useState(normalState);

  const [device, setDevice] = useState(new Set(["Devices"]));
  const selectedDeviceValue = useMemo(
    () => Array.from(device).join(", ").replaceAll("_", " "),
    [device]
  );
  const [courses, setCourses] = useState("");
  const selectedCourseValue = useMemo(
    () => Array.from(courses).join(", ").replaceAll("_", " "),
    [courses]
  );
  const [gender, setGender] = useState(new Set(["F"]));
  const selectedGenderValue = useMemo(
    () => Array.from(gender).join(", ").replaceAll("_", " "),
    [gender]
  );

  // filtered dropdown data
  const [filteredData, setFilteredData] = useState(null);

  //dropdown filter
  const [selected, setSelected] = useState(new Set(["Filters"]));
  const selectedDeptValue = useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );
  const [search, setSearch] = useState("");
  const [deviceOptions, setDeviceOptions] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [flag, setFlag] = useState();

  const columns = [
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "matric_no",
      label: "MATRIC. NO.",
    },
    {
      key: "gender",
      label: "GENDER",
    },
    {
      key: "device",
      label: "DEVICE",
    },
    {
      key: "status",
      label: "STATUS",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ];

  const genderOptions = [
    {
      id: 1,
      name: "F",
    },
    {
      id: 2,
      name: "M",
    },
  ];

  useEffect(() => {
    async function fetchDevices() {
      // Creating an async function for fetching
      const response = await fetch(
        "http://localhost/fingerprinted/api/devices/read_all.php"
      );
      const data = await response.json();
      setDeviceOptions(data.data);
    }

    // Function call
    fetchDevices();
    setCourseOptions(all_courses.data?.data);
  }, [all_courses.data]);
  useEffect(() => {
    setFilteredData(data?.data);
    if (selected.currentKey) {
      handleFilterChange(data?.data, selected.currentKey);
    }
  }, [data]);

  const fetchSingleStudent = async (id) => {
    const res = await fetch(
      `http://localhost/fingerprinted/api/students/read_single.php?id=${id}`
    );
    return res.json();
  };

  const resetToNormal = () => {
    setFirstHelper(normalState);
    setLastHelper(normalState);
    setEmailHelper(normalState);
    setMatricHelper(normalState);
  };

  const resetFields = () => {
    resetToNormal();
    firstName.setValue("");
    lastName.setValue("");
    email.setValue("");
    matricNo.setValue("");
    setGender(new Set(["F"]));
    setDevice(new Set(["Devices"]));
    courseOptions?.length === 0 || !courseOptions
      ? ""
      : setCourses(new Set([courseOptions[0]["name"]]));
  };

  const validateFields = () => {
    let valid = true;
    if (firstName.value === "") {
      setFirstHelper({ text: "Please enter first name", color: "error" });
      valid = false;
    }
    if (lastName.value === "") {
      setLastHelper({ text: "Please enter last name", color: "error" });
      valid = false;
    }
    if (!validateEmail(email.value)) {
      setEmailHelper({ text: "Please enter valid email", color: "error" });
      valid = false;
    }
    if (isNaN(matricNo.value) || matricNo.value === "") {
      setMatricHelper({
        text: "Please enter valid matric. no.",
        color: "error",
      });
      valid = false;
    }
    return valid;
  };

  const showAddModal = () => {
    if (deviceOptions?.length === 0 || !deviceOptions) {
      showNotification({
        error: "Cannot add student: No device available.",
      });
      return;
    }
    resetFields();
    setHeader("Add Student");
    studentModal.setVisible(true);
  };

  const addStudent = async () => {
    // function to add device to the database
    const [addGender] = gender;
    const [addDevice] = device;
    const addCourses = [...courses];
    let pass = validateFields();

    if (pass && addGender !== "Gender" && addDevice !== "Devices") {
      let device_id = deviceOptions.filter((d) => d.name === addDevice)[0][
        "key"
      ];
      let enrolled_courses = [];
      if (courseOptions) {
        enrolled_courses = courseOptions
          .filter((course) => addCourses.includes(course.name))
          .filter((course) => course.id);
      }

      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/students/add_student.php",
        {
          first_name: firstName.value,
          last_name: lastName.value,
          email: email.value,
          matric_no: matricNo.value,
          gender: addGender,
          device_id: device_id,
          enrolled_courses: enrolled_courses,
        }
      );
      showNotification(data);
      if (data["success"]) {
        resetFields();
        studentModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const handleViewClick = (id) => {
    setStudentID(id);
    viewStudent.setVisible(true);
  };
  const showDeleteModal = (id, name) => {
    setStudentID(id);
    setDeleteText("Are you sure you want to delete student: " + name);
    deleteStudentModal.setVisible(true);
  };

  const deleteStudent = async () => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/students/delete_student.php",
      {
        id: studentID,
      }
    );
    showNotification(data);
    if (data["success"]) {
      setStudentID(null);
      deleteStudentModal.setVisible(false);
    }
  };

  const showUpdateModal = (
    id,
    firstname,
    lastname,
    emailAdd,
    matric,
    device,
    gender,
    courses
  ) => {
    let c = courses.map((course) => course.course_id);
    let d = courseOptions
      ?.filter((course) => c.includes(course.id))
      .map((course) => course.name);
    resetToNormal();
    setStudentID(id);
    setHeader("Update Student");
    firstName.setValue(firstname);
    lastName.setValue(lastname);
    email.setValue(emailAdd);
    matricNo.setValue(matric);
    setGender(new Set([gender]));
    setDevice(new Set([device]));
    if (courseOptions) {
      setCourses(new Set(d));
    }
    studentModal.setVisible(true);
  };

  const updateStudent = async () => {
    const [addGender] = gender;
    const [addDevice] = device;
    const addCourses = [...courses];
    let pass = validateFields();

    if (pass && addGender !== "Gender" && addDevice !== "Devices") {
      let device_id = deviceOptions.filter((d) => d.name === addDevice)[0][
        "key"
      ];
      let enrolled_courses = [];
      if (courseOptions) {
        enrolled_courses = courseOptions
          .filter((course) => addCourses.includes(course.name))
          .filter((course) => course.id);
      }
      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/students/update_student.php",
        {
          id: studentID,
          first_name: firstName.value,
          last_name: lastName.value,
          email: email.value,
          matric_no: matricNo.value,
          gender: addGender,
          device_id: device_id,
          enrolled_courses: enrolled_courses,
        }
      );
      showNotification(data);
      if (data["success"]) {
        resetFields();
        setStudentID(null);
        studentModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const addFinger = async (id) => {
    setStudentID(id);
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/students/add_fingerprint.php",
      {
        id: id,
      }
    );

    if (data["success"]) {
      addFingerModal.setVisible(true);
      let isAdded = 1;

      while (isAdded == 1) {
        const student = await fetchSingleStudent(id);
        isAdded = student["add_fingerid"];
        sleep(20000);
      }

      if (flag) {
        showNotification(data);
      }
      addFingerModal.setVisible(false);
    }
  };

  const cancelAddFinger = async (id) => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/students/cancel_add.php",
      {
        id: id,
      }
    );
  };

  const renderCell = (data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <Col>
            <Row>
              <Text>
                {data.first_name} {data.last_name}
              </Text>
            </Row>
            <Row>
              <Text size={14} color="$accents6">
                {data.email}
              </Text>
            </Row>
          </Col>
        );

      case "device":
        return <Text>{data.name}</Text>;

      case "status":
        return (
          <Col>
            <Text>
              {data.fingerprint_id === 0 && data.add_fingerid === 0
                ? "Not added"
                : data.fingerprint_id >= 0 && data.add_fingerid === 1
                ? "Adding"
                : "Added"}
            </Text>
          </Col>
        );

      case "actions":
        return (
          <Col css={{ dflex: "space-evenly", ai: "center" }}>
            <Tooltip content="View Student">
              <IconButton
                type="normal"
                onClick={() => handleViewClick(data.id)}
              >
                <AiOutlineEye size={22} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Add Print">
              <IconButton type="normal" onClick={() => addFinger(data.id)}>
                <MdFingerprint size={22} />
              </IconButton>
            </Tooltip>

            <Tooltip content="Edit student">
              <IconButton
                type="primary"
                onClick={() =>
                  showUpdateModal(
                    data.id,
                    data.first_name,
                    data.last_name,
                    data.email,
                    data.matric_no,
                    data.name,
                    data.gender,
                    data.courses
                  )
                }
              >
                <BiEditAlt size={22} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete student" contentColor="error">
              <IconButton
                type="error"
                onClick={() =>
                  showDeleteModal(
                    data.id,
                    data.first_name + " " + data.last_name
                  )
                }
              >
                <BiTrash size={22} />
              </IconButton>
            </Tooltip>
          </Col>
        );

      default:
        return cellValue;
    }
  };

  const handleFilterChange = (data, filter) => {
    let newFilteredData = "";
    if (filter === "female") {
      newFilteredData = data.filter((item) => item.gender == "F");
    } else if (filter === "male") {
      newFilteredData = data.filter((item) => item.gender == "M");
    } else if (filter === "added") {
      newFilteredData = data.filter((item) => item.fingerprint_id > 0);
    } else if (filter === "not added") {
      newFilteredData = data.filter((item) => item.fingerprint_id == 0);
    } else {
      newFilteredData = data;
    }
    setFilteredData(newFilteredData);
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
            Student List
          </Text>
          <Button
            color="secondary"
            auto
            size="sm"
            icon={<FaPlus fill="currentColor" />}
            onPress={showAddModal}
          >
            Add a new student
          </Button>
        </Box>
        <Box
          css={{
            d: "flex",
            justifyContent: "space-between",
            mb: "1rem",
          }}
        >
          <Dropdown>
            <Dropdown.Button
              auto
              color="secondary"
              css={{ tt: "capitalize" }}
              ripple={false}
            >
              {selectedDeptValue}
            </Dropdown.Button>
            <Dropdown.Menu
              solid
              aria-label="Filter selection"
              color="secondary"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selected}
              onSelectionChange={setSelected}
              onAction={(key) =>
                data?.data ? handleFilterChange(data?.data, key) : ""
              }
            >
              <Dropdown.Item key="all">All</Dropdown.Item>
              <Dropdown.Section title="Gender">
                <Dropdown.Item key="female">Female</Dropdown.Item>
                <Dropdown.Item key="male">Male</Dropdown.Item>
              </Dropdown.Section>
              <Dropdown.Section title="Fingerprint Status">
                <Dropdown.Item key="added">Added</Dropdown.Item>
                <Dropdown.Item key="not added">Not Added</Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown>
          <SearchBar onChange={(e) => setSearch(e.target.value)} />
        </Box>
        {filteredData && (
          <DataTable
            columns={columns}
            data={filteredData.filter((item) => {
              return search.toLowerCase() === ""
                ? item
                : item.matric_no.toLowerCase().includes(search.toLowerCase()) ||
                    item.first_name
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    item.last_name
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    item.email.toLowerCase().includes(search.toLowerCase());
            })}
            renderCell={renderCell}
          />
        )}
        {data?.error && <NotFound error={data["error"]} />}
        {!filteredData && !data?.error && <LoadingPoints />}
        <div>
          <Popup
            header={header}
            onClick={header === "Add Student" ? addStudent : updateStudent}
            modal={studentModal}
          >
            <Box css={{ d: "flex", gap: "0.8rem" }}>
              <InputField
                input={firstName}
                aria={`${header} Name`}
                placeholder="First Name"
                helper={firstHelper}
              />
              <InputField
                input={lastName}
                aria={`${header} Name`}
                placeholder="Last name"
                helper={lastHelper}
              />
            </Box>
            <InputField
              input={email}
              aria={`${header} Email`}
              placeholder="Email"
              helper={emailHelper}
            />
            <InputField
              input={matricNo}
              aria={`${header} Matric No`}
              placeholder="Matric. no."
              helper={matricHelper}
            />
            <Select
              selectedValue={selectedGenderValue}
              selected={gender}
              setSelected={setGender}
              items={genderOptions}
              type="Gender"
            />
            {courseOptions?.length !== 0 && courseOptions && (
              <Select
                selectedValue={selectedCourseValue}
                selected={courses}
                setSelected={setCourses}
                items={courseOptions}
                type="Enrolled Courses"
                multiple={true}
              />
            )}
            <Select
              selectedValue={selectedDeviceValue}
              selected={device}
              setSelected={setDevice}
              items={deviceOptions}
              type="Device"
            />
          </Popup>
          <Modal
            preventClose
            {...addFingerModal.bindings}
            aria-labelledby={`add fingerprint modal`}
          >
            <Modal.Header>
              <Text css={{ color: "$text" }} size={18} h3>
                ADDING FINGERPRINT
              </Text>
            </Modal.Header>
            <Modal.Body>
              <Loading type="points" size="xl" color="secondary" />
              <Text css={{ textAlign: "center" }}>
                Communicating with device
              </Text>
            </Modal.Body>
            <Modal.Footer css={{ m: "0", p: "0", px: "1rem", pb: "0.5rem" }}>
              <Button
                auto
                flat
                color="error"
                onPress={() => cancelAddFinger(studentID)}
              >
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
          <Popup
            header="Delete Student"
            onClick={deleteStudent}
            modal={deleteStudentModal}
          >
            <Text>{deleteText}</Text>
          </Popup>
          {studentID && (
            <Modal
              closeButton
              {...viewStudent.bindings}
              aria-labelledby={`student info modal`}
            >
              <Modal.Body>
                <ViewData id={studentID} />
              </Modal.Body>
            </Modal>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Students;
