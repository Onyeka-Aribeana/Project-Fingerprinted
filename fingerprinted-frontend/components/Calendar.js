import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
  parse,
  parseISO,
  startOfToday,
} from "date-fns";
import {
  Button,
  Card,
  Text,
  useInput,
  useModal,
  Dropdown,
  Badge,
} from "@nextui-org/react";
import React, { useState, useMemo, useEffect } from "react";
import { BsChevronLeft, BsChevronRight, BsThreeDots } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import Box from "./Box";
import IconButton from "./IconButton";
import NumberButton from "./NumberButton";
import Popup from "./Popup";
import InputField from "./InputField";
import Select from "./Select";
import Dot from "./Dot";
import useSWR from "swr";
import { makeAPIRequest, showNotification, fetchCourses } from "./utils";
import "react-toastify/dist/ReactToastify.css";

let colStartClasses = ["1", "2", "3", "4", "5", "6", "7"];
let daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

export const fetchEvents = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/events/read.php"
  );
  const data = await response.json();
  return data;
};

export default function Calendar() {
  const { data, error } = useSWR("events", fetchEvents, {
    refreshInterval: 5000,
  });

  const courses = useSWR("courses", fetchCourses, {
    refreshInterval: 1000,
  });

  let events = data?.data;

  const desc = useInput("");
  const startDateInput = useInput("");
  const endDateInput = useInput("");
  const startTimeInput = useInput("");
  const endTimeInput = useInput("");

  const [header, setHeader] = useState("");
  const [id, setID] = useState(null);
  const [deleteText, setDeleteText] = useState(null);
  const deleteEventModal = useModal();

  const normalState = {
    text: "",
    color: "secondary",
  };
  const [descHelper, setDescHelper] = useState(normalState);
  const [dateHelper, setDateHelper] = useState(normalState);
  const [timeHelper, setTimeHelper] = useState(normalState);
  const [errorHelper, setErrorHelper] = useState(normalState);

  const eventModal = useModal();

  const [event, setEvent] = useState(new Set(["Event Type"]));
  const selectedValue = useMemo(
    () => Array.from(event).join(", ").replaceAll("_", " "),
    [event]
  );

  const [course, setCourse] = useState(new Set(["None"]));
  const selectedCourse = useMemo(
    () => Array.from(course).join(", ").replaceAll("_", " "),
    [course]
  );

  const [courseOptions, setCourseOptions] = useState(null);

  let today = startOfToday();
  let [selectedDay, setSelectedDay] = useState(today);
  let [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  let selectedDayMeetings = events?.filter(
    (event) =>
      (event.type == "Daily" &&
        isWithinInterval(selectedDay, {
          start: parseISO(event.startDatetime),
          end: parseISO(event.endDatetime),
        })) ||
      isSameDay(parseISO(event.startDatetime), selectedDay) ||
      (event.type === "Weekly" &&
        isWithinInterval(selectedDay, {
          start: parseISO(event.startDatetime),
          end: parseISO(event.endDatetime),
        }) &&
        getDay(parseISO(event.startDatetime)) === getDay(selectedDay))
  );

  const typeOptions = [
    {
      id: 1,
      name: "Daily",
    },
    {
      id: 2,
      name: "Weekly",
    },
  ];

  useEffect(() => {
    setCourseOptions(courses.data?.data);
  }, [courses.data]);

  const showAddModal = () => {
    resetFields();
    setHeader("Add Event");
    eventModal.setVisible(true);
  };

  const resetToNormal = () => {
    setDescHelper(normalState);
    setDateHelper(normalState);
    setTimeHelper(normalState);
    setErrorHelper(normalState);
  };

  const resetFields = () => {
    resetToNormal();
    desc.setValue("");
    startDateInput.setValue("");
    startTimeInput.setValue("");
    endDateInput.setValue("");
    endTimeInput.setValue("");
    setEvent(new Set(["Event Type"]));
    setCourse(new Set(["None"]));
  };

  const validateFields = () => {
    let valid = true;
    if (desc.value === "") {
      setDescHelper({ text: "Please enter event description", color: "error" });
      valid = false;
    }
    if (startDateInput.value === "" || endDateInput.value === "") {
      setDateHelper({ text: "Please enter dates", color: "error" });
      setErrorHelper({ text: "", color: "error" });
      valid = false;
    }
    if (startTimeInput.value === "" || endTimeInput.value === "") {
      setTimeHelper({
        text: "Please enter times",
        color: "error",
      });
      setErrorHelper({ text: "", color: "error" });
      valid = false;
    }

    if (startDateInput.value > endDateInput.value) {
      setDateHelper({
        text: "Start date greater than end date",
        color: "error",
      });
      setErrorHelper({ text: "", color: "error" });
      valid = false;
    }

    if (startTimeInput.value > endTimeInput.value) {
      setTimeHelper({
        text: "Start time greater than end time",
        color: "error",
      });
      setErrorHelper({ text: "", color: "error" });
      valid = false;
    }
    return valid;
  };

  const addEvent = async () => {
    resetToNormal();
    const [type] = event;
    const [courseCode] = course;
    let pass = validateFields();

    if (pass && type != "Event Type") {
      let course_id = courseOptions.filter((c) => c.name === courseCode)[0][
        "id"
      ];
      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/events/add_event.php",
        {
          description: desc.value,
          startDate: startDateInput.value,
          endDate: endDateInput.value,
          startTime: startTimeInput.value,
          endTime: endTimeInput.value,
          type: type,
          course: course_id,
        }
      );

      showNotification(data);
      if (data["success"]) {
        resetFields();
        eventModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const showUpdateModal = (event) => {
    resetToNormal();
    setHeader("Update Event");
    let startDateTime = event.startDatetime.split("T");
    let endDateTime = event.endDatetime.split("T");
    desc.setValue(event.description);
    startDateInput.setValue(startDateTime[0]);
    startTimeInput.setValue(startDateTime[1]);
    endDateInput.setValue(endDateTime[0]);
    endTimeInput.setValue(endDateTime[1]);
    setEvent(new Set([event.type]));
    setCourse(new Set([event.course]));
    setID(event.id);
    eventModal.setVisible(true);
  };

  const updateEvent = async () => {
    resetToNormal();
    const [type] = event;
    const [courseCode] = course;
    let pass = validateFields();

    if (pass && type != "Event Type") {
      let course_id = courseOptions.filter((c) => c.name === courseCode)[0][
        "id"
      ];

      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/events/update_event.php",
        {
          id: id,
          description: desc.value,
          startDate: startDateInput.value,
          endDate: endDateInput.value,
          startTime: startTimeInput.value,
          endTime: endTimeInput.value,
          type: type,
          course: course_id,
        }
      );

      showNotification(data);
      if (data["success"]) {
        resetFields();
        setID(null);
        eventModal.setVisible(false);
      }
    } else {
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const showDeleteModal = (id, desc) => {
    setID(id);
    setDeleteText("Are you sure you want to delete event: " + desc);
    deleteEventModal.setVisible(true);
  };

  const deleteEvent = async () => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/events/delete_event.php",
      {
        id: id,
      }
    );
    showNotification(data);
    if (data["success"]) {
      setID(null);
      deleteEventModal.setVisible(false);
    }
  };

  return (
    <Box css={{ my: "1.4rem" }}>
      <Text h3 css={{ m: "0", mb: "0.8rem" }}>
        Schedule
      </Text>
      <Box
        css={{
          d: "grid",
          gridTemplateColumns: "auto",
          gap: "1rem",
          "@xs": {
            gridTemplateColumns: "auto auto",
          },
        }}
      >
        <Box css={{ justifySelf: "center", w: "100%" }}>
          <Card css={{ w: "100%" }}>
            <Box css={{ p: "1rem" }}>
              <Box css={{ d: "flex", justifyContent: "space-between" }}>
                <Text b>{format(firstDayCurrentMonth, "MMMM yyyy")}</Text>
                <Box css={{ d: "flex", gap: "1rem" }}>
                  <IconButton onClick={previousMonth} type="normal">
                    <BsChevronLeft />
                  </IconButton>
                  <IconButton onClick={nextMonth} type="normal">
                    <BsChevronRight />
                  </IconButton>
                </Box>
              </Box>
              <Box
                css={{
                  mt: "1rem",
                  d: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  justifyItems: "center",
                }}
              >
                {daysOfWeek.map((day, id) => (
                  <Text key={id} css={{ color: "$accents6" }}>
                    {day}
                  </Text>
                ))}
              </Box>
              <Box
                css={{
                  mt: "1rem",
                  d: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  justifyItems: "center",
                }}
              >
                {days.map((day, dayIdx) => (
                  <Box
                    key={day.toString()}
                    css={{
                      gridColumnStart:
                        dayIdx === 0 ? colStartClasses[getDay(day)] : "",
                    }}
                  >
                    <NumberButton
                      onClick={() => setSelectedDay(day)}
                      type={
                        isEqual(day, selectedDay) && isToday(day)
                          ? "todaySelected"
                          : !isEqual(day, selectedDay) && isToday(day)
                          ? "today"
                          : !isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            isSameMonth(day, firstDayCurrentMonth)
                          ? "notToday"
                          : "notTodaySelected"
                      }
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </NumberButton>
                    <Box
                      css={{ width: "8px", height: "8px", margin: "0 auto" }}
                    >
                      {events?.some(
                        (event) =>
                          (event.type == "Daily" &&
                            isWithinInterval(day, {
                              start: parseISO(event.startDatetime),
                              end: parseISO(event.endDatetime),
                            })) ||
                          isSameDay(parseISO(event.startDatetime), day) ||
                          (event.type === "Weekly" &&
                            isWithinInterval(day, {
                              start: parseISO(event.startDatetime),
                              end: parseISO(event.endDatetime),
                            }) &&
                            getDay(parseISO(event.startDatetime)) ===
                              getDay(day))
                      ) && <Dot type="primary" />}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Box>
        <Box css={{ justifySelf: "center", w: "100%", h: "100%" }}>
          <Card
            css={{
              w: "100%",
              p: "0.8rem",
              h: "100%",
              d: "flex",
              flexDirection: "column",
            }}
          >
            <Box css={{ dflex: "space-between", alignItems: "center" }}>
              <Text b>
                Schedule for{" "}
                <time dateTime={format(selectedDay, "yyyy-MM-dd")}>
                  {format(selectedDay, "MMM dd, yyy")}
                </time>
              </Text>
              <Button
                color="secondary"
                auto
                size="sm"
                icon={<FaPlus fill="currentColor" />}
                onPress={showAddModal}
              >
                Add Event
              </Button>
            </Box>
            <Box
              css={{
                mt: "1rem",
                p: "0.6rem 0.6rem 0",
                "@xs": {
                  overflowY: "auto",
                  flexBasis: "0px",
                  flexGrow: "1",
                },
              }}
            >
              {selectedDayMeetings?.length > 0 ? (
                selectedDayMeetings?.map((event) => (
                  <Event
                    key={event.id}
                    event={event}
                    updateModal={() => showUpdateModal(event)}
                    deleteModal={() =>
                      showDeleteModal(event.id, event.description)
                    }
                  />
                ))
              ) : (
                <Text css={{ color: "$accents6" }}>No events for today</Text>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
      <Popup
        header={header}
        onClick={header === "Add Event" ? addEvent : updateEvent}
        modal={eventModal}
      >
        <InputField
          input={desc}
          aria={`${header} desc`}
          placeholder="Description"
          helper={descHelper}
        />
        <Box css={{ d: "flex", gap: "0.5rem" }}>
          <InputField
            input={startDateInput}
            aria={`${header} start date`}
            placeholder="Start date"
            helper={dateHelper}
            type="date"
          />
          <InputField
            input={endDateInput}
            aria={`${header} end date`}
            placeholder="End date"
            helper={errorHelper}
            type="date"
          />
        </Box>
        <Box css={{ d: "flex", gap: "0.5rem", alignItems: "center" }}>
          <InputField
            input={startTimeInput}
            aria={`${header} start time`}
            placeholder="Start time"
            helper={timeHelper}
            type="time"
          />
          <InputField
            input={endTimeInput}
            aria={`${header} end time`}
            placeholder="End time"
            helper={errorHelper}
            type="time"
          />
        </Box>
        <Box>
          <Select
            selectedValue={selectedValue}
            selected={event}
            setSelected={setEvent}
            items={typeOptions}
            type="Event"
          />
          <Select
            selectedValue={selectedCourse}
            selected={course}
            setSelected={setCourse}
            items={courseOptions}
            type="Course"
          />
        </Box>
      </Popup>
      <Popup
        header="Delete Event"
        onClick={deleteEvent}
        modal={deleteEventModal}
      >
        <Text>{deleteText}</Text>
      </Popup>
    </Box>
  );
}

const Event = ({ event, updateModal, deleteModal }) => {
  let startDateTime = parseISO(event.startDatetime);
  let endDateTime = parseISO(event.endDatetime);

  const handleAction = (key) => {
    if (key === "edit") updateModal();
    else if (key === "delete") deleteModal();
  };

  return (
    <>
      <Box
        css={{
          dflex: "space-between",
          bg: "$accents0",
          p: "0.8rem",
          br: "$sm",
          mb: "0.5rem",
        }}
      >
        <Box>
          <Box
            css={{
              d: "flex",
              gap: "0.6rem",
              alignItems: "center",
              mb: "0.4rem",
            }}
          >
            <Dot type="secondary" />
            <Text css={{ color: "$accents6" }}>
              <time dateTime={event.startDatetime}>
                {format(startDateTime, "h:mm a")}
              </time>{" "}
              -{" "}
              <time dateTime={event.endDatetime}>
                {format(endDateTime, "h:mm a")}
              </time>
            </Text>
          </Box>
          <Text b size={18}>
            {event.description}
          </Text>
          {event.course !== "None" && (
            <Box
              css={{
                d: "flex",
                mt: "2px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Badge
                isSquared
                color="secondary"
                variant="flat"
                css={{ textTransform: "uppercase" }}
              >
                {event.type} class
              </Badge>
              <Text>&nbsp; for Course - {event.course}</Text>
            </Box>
          )}
        </Box>
        <Dropdown css={{ alignSelf: "start", d: "flex" }}>
          <Dropdown.Trigger css={{ alignSelf: "start" }}>
            <IconButton type="normal">
              <BsThreeDots size={18} />
            </IconButton>
          </Dropdown.Trigger>
          <Dropdown.Menu
            aria-label="event options"
            css={{ maxWidth: "100px", minWidth: "100px" }}
            onAction={(key) => handleAction(key)}
          >
            <Dropdown.Item key="edit">Edit</Dropdown.Item>
            <Dropdown.Item key="delete" color="error">
              Delete
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Box>
    </>
  );
};
