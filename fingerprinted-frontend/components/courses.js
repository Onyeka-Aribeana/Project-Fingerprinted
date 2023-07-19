import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import Popup from "./Popup";
import DataTable from "./DataTable";
import Box from "./Box";
import IconButton from "./IconButton";
import LoadingPoints from "./Loading";
import NotFound from "./NotFound";
import Select from "./Select";
import SearchBar from "./SearchBar";
import { makeAPIRequest, showNotification } from "./utils";
import {
  Button,
  useModal,
  Text,
  useInput,
  Col,
  Tooltip,
  Dropdown,
  Spacer,
} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import { BiTrash, BiEditAlt } from "react-icons/bi";
import InputField from "./InputField";
import "react-toastify/dist/ReactToastify.css";

const fetcher = async () => {
  // function to fetch device list from database
  const response = await fetch(
    "http://localhost/fingerprinted/api/courses/read.php"
  );
  const data = await response.json();
  return data;
};

const Courses = () => {
  // client-side fetching method using swr
  const { data, error } = useSWR("classes", fetcher, { refreshInterval: 5000 });

  const [header, setHeader] = useState("");
  const courseModal = useModal();
  const deleteCourseModal = useModal();
  const courseName = useInput("");
  const courseCode = useInput("");
  const [courseID, setCourseID] = useState(null);
  const [deleteText, setDeleteText] = useState(null);
  const [nameHelper, setNameHelper] = useState({
    text: "",
    color: "secondary",
  });
  const [codeHelper, setCodeHelper] = useState({
    text: "",
    color: "secondary",
  });

  // search bar
  const [search, setSearch] = useState("");

  // dropdown in form
  const [dept, setDept] = useState(new Set(["Department"]));
  const selectedValue = useMemo(
    () => Array.from(dept).join(", ").replaceAll("_", " "),
    [dept]
  );

  //dropdown filter
  const [selected, setSelected] = useState(new Set(["all"]));
  const selectedDeptValue = useMemo(
    () => "Dept: " + Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );

  // filtered dropdown data
  const [filteredData, setFilteredData] = useState(null);

  const columns = [
    {
      key: "course_code",
      label: "COURSE CODE",
    },
    {
      key: "course_name",
      label: "COURSE NAME",
    },
    {
      key: "dept",
      label: "DEPARTMENT",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ];

  const options = [
    {
      id: 1,
      name: "Electrical/Electronics",
    },
    {
      id: 2,
      name: "Computer",
    },
  ];

  useEffect(() => {
    setFilteredData(data?.data);
    if (selected.currentKey) {
      handleFilterChange(data?.data, selected.currentKey);
    }
  }, [data]);

  const resetFields = () => {
    setNameHelper({ text: "", color: "secondary" });
    setCodeHelper({ text: "", color: "secondary" });
    courseName.setValue("");
    courseCode.setValue("");
    setDept(new Set(["Department"]));
  };

  const validateFields = () => {
    let valid = true;
    if (courseName.value === "") {
      setNameHelper({ text: "Please enter course name", color: "error" });
      valid = false;
    }
    if (courseCode.value === "") {
      setCodeHelper({ text: "Please enter course code", color: "error" });
      valid = false;
    }
    return valid;
  };

  const showAddModal = () => {
    resetFields();
    setHeader("Add Course");
    courseModal.setVisible(true);
  };

  const showUpdateModal = (id, name, code, dept) => {
    setNameHelper({ text: "", color: "secondary" });
    setCodeHelper({ text: "", color: "secondary" });
    setHeader("Update Course");
    courseName.setValue(name);
    courseCode.setValue(code);
    setDept(new Set([dept]));
    courseModal.setVisible(true);
    setCourseID(id);
  };

  const showDeleteModal = (id, name) => {
    setDeleteText("Are you sure you want to delete course: " + name);
    setCourseID(id);
    deleteCourseModal.setVisible(true);
  };

  const addCourse = async () => {
    // function to add device to the database
    const [addDept] = dept;
    let pass = validateFields();

    if (pass && addDept !== "Department") {
      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/courses/add_course.php",
        {
          name: courseName.value,
          code: courseCode.value,
          dept: addDept,
        }
      );
      showNotification(data);
      if (data["success"]) {
        resetFields();
        courseModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const deleteCourse = async () => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/courses/delete_course.php",
      {
        id: courseID,
      }
    );
    showNotification(data);
    if (data["success"]) {
      setCourseID(null);
      deleteCourseModal.setVisible(false);
    }
  };

  const updateCourse = async () => {
    const [updatedDept] = dept;

    let pass = validateFields();
    if (pass && updatedDept !== "Department") {
      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/courses/update_course.php",
        {
          id: courseID,
          name: courseName.value,
          code: courseCode.value,
          dept: updatedDept,
        }
      );
      showNotification(data);
      if (data["success"]) {
        resetFields();
        setCourseID(null);
        courseModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const renderCell = (data, columnKey) => {
    const cellValue = data[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <Col css={{ d: "flex", ai: "center", gap: "0.8rem" }}>
            <Tooltip content="Edit course">
              <IconButton
                type="primary"
                onClick={() =>
                  showUpdateModal(
                    data.key,
                    data.course_name,
                    data.course_code,
                    data.dept
                  )
                }
              >
                <BiEditAlt size={22} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete course" contentColor="error">
              <IconButton
                type="error"
                onClick={() => showDeleteModal(data.key, data.course_name)}
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

  const handleFilterChange = (data, dept) => {
    let newFilteredData = "";
    if (dept === "all") {
      newFilteredData = data;
    } else {
      newFilteredData = data.filter((item) => item.dept.toLowerCase() === dept);
    }
    setFilteredData(newFilteredData);
  };

  return (
    <>
      <Box
        css={{
          d: "flex",
          justifyContent: "space-between",
          ai: "center",
          my: "1.4rem",
        }}
      >
        <Text h3 css={{ m: "0" }}>
          Course List
        </Text>
        <Button
          color="secondary"
          auto
          size="sm"
          icon={<FaPlus fill="currentColor" />}
          onPress={showAddModal}
        >
          Add a new course
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
            onAction={
              data?.data ? (key) => handleFilterChange(data?.data, key) : ""
            }
          >
            <Dropdown.Section title="Department">
              <Dropdown.Item key="all">All</Dropdown.Item>
              {options.map((option) => (
                <Dropdown.Item
                  key={option.name.toLowerCase()}
                  css={{ textTransform: "capitalize" }}
                >
                  {option.name}
                </Dropdown.Item>
              ))}
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
              : item.course_name.toLowerCase().includes(search.toLowerCase()) ||
                  item.course_code
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  item.dept.toLowerCase().includes(search.toLowerCase());
          })}
          renderCell={renderCell}
        />
      )}
      {data?.error && <NotFound error={data["error"]} />}
      {!filteredData && !data?.error && <LoadingPoints />}
      <div>
        <Popup
          header={header}
          onClick={header === "Add Course" ? addCourse : updateCourse}
          modal={courseModal}
        >
          <InputField
            input={courseName}
            aria={`${header} Name`}
            placeholder="Course name"
            helper={nameHelper}
          />
          <InputField
            input={courseCode}
            aria={`${header} Code`}
            placeholder="Course code"
            helper={codeHelper}
          />
          <Select
            selectedValue={selectedValue}
            selected={dept}
            setSelected={setDept}
            items={options}
            type="Department"
          />
        </Popup>
        <Popup
          header="Delete Course"
          onClick={deleteCourse}
          modal={deleteCourseModal}
        >
          <Text>{deleteText}</Text>
        </Popup>
      </div>
    </>
  );
};

export default Courses;
