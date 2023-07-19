import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import Popup from "./Popup";
import DataTable from "./DataTable";
import Box from "./Box";
import IconButton from "./IconButton";
import LoadingPoints from "./Loading";
import NotFound from "./NotFound";
import InputField from "./InputField";
import SearchBar from "./SearchBar";
import { makeAPIRequest, showNotification } from "./utils";
import {
  Input,
  Button,
  useModal,
  Text,
  useInput,
  Col,
  Tooltip,
  Dropdown,
} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import { BiTrash, BiEditAlt } from "react-icons/bi";
import { GoSearch } from "react-icons/go";

export const fetchDevices = async () => {
  // function to fetch device list from database
  const response = await fetch(
    "http://localhost/fingerprinted/api/devices/read.php"
  );
  const data = await response.json();
  return data;
};

const Devices = () => {
  // client-side fetching method using swr
  const { data, error } = useSWR("devices", fetchDevices, {
    refreshInterval: 5000,
  });

  const [header, setHeader] = useState("");
  const deviceModal = useModal();
  const deleteDeviceModal = useModal();
  const deviceName = useInput("");
  const [deviceID, setDeviceID] = useState(null);
  const [deleteText, setDeleteText] = useState(null);
  const [nameHelper, setNameHelper] = useState({
    text: "",
    color: "secondary",
  });

  const [selected, setSelected] = useState(new Set(["all"]));
  const selectedValue = useMemo(
    () => "Mode: " + Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(null);

  // defining the table columns
  const columns = [
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "uid",
      label: "UNIQUE-ID",
    },
    {
      key: "mode",
      label: "MODE",
    },
    {
      key: "actions",
      label: "ACTIONS",
    },
  ];

  useEffect(() => {
    setFilteredData(data?.data);
    if (selected.currentKey) {
      handleFilterChange(data?.data, selected.currentKey);
    }
  }, [data]);

  const showAddModal = () => {
    setNameHelper({ text: "", color: "secondary" });
    setHeader("Add Device");
    deviceName.setValue("");
    deviceModal.setVisible(true);
  };

  const showUpdateModal = (id, name) => {
    setNameHelper({ text: "", color: "secondary" });
    setHeader("Update Device");
    deviceName.setValue(name);
    deviceModal.setVisible(true);
    setDeviceID(id);
  };

  const showDeleteModal = (id, name) => {
    setDeleteText("Are you sure you want to empty database of " + name);
    deleteDeviceModal.setVisible(true);
    setDeviceID(id);
  };

  const addDevice = async () => {
    // function to add device to the database
    if (deviceName.value !== "") {
      setNameHelper({ text: "", color: "secondary" });

      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/devices/add_device.php",
        {
          name: deviceName.value,
        }
      );
      showNotification(data);
      if (data["success"]) {
        deviceName.setValue("");
        deviceModal.setVisible(false);
      }
    } else {
      setNameHelper({ text: "Please enter device name", color: "error" });
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const deleteDevice = async () => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/devices/delete_device.php",
      {
        id: deviceID,
      }
    );
    showNotification(data);
    if (data["success"]) {
      setDeviceID(null);
      setDeleteText(null);
      deleteDeviceModal.setVisible(false);
    }
  };

  const updateDevice = async () => {
    if (deviceName.value !== "") {
      setNameHelper({ text: "", color: "secondary" });

      const data = await makeAPIRequest(
        "http://localhost/fingerprinted/api/devices/update_device.php",
        {
          id: deviceID,
          name: deviceName.value,
        }
      );
      showNotification(data);
      if (data["success"]) {
        setDeviceID(null);
        deviceName.setValue("");
        deviceModal.setVisible(false);
      }
    } else {
      setNameHelper({ text: "Please enter device name", color: "error" });
      showNotification({ error: "Please fill all required fields" });
    }
  };

  const switchMode = async (id, mode) => {
    const data = await makeAPIRequest(
      "http://localhost/fingerprinted/api/devices/switch_mode.php",
      {
        id: id,
        mode: mode,
      }
    );
    showNotification(data);
  };

  const renderCell = (data, columnKey) => {
    const cellValue = data[columnKey];

    switch (columnKey) {
      case "mode":
        return (
          <Col css={{ d: "flex", ai: "center" }}>
            <Tooltip content={data.mode !== 0 ? "Switch to Attendance" : ""}>
              <Button
                bordered={data.mode !== 0}
                size="sm"
                color="primary"
                auto
                css={{
                  borderTopRightRadius: "0",
                  borderBottomRightRadius: "0",
                  outline: "none",
                }}
                onPress={() => {
                  if (data.mode !== 0) {
                    switchMode(data.key, data.mode);
                  }
                }}
              >
                Att.
              </Button>
            </Tooltip>
            <Tooltip content={data.mode !== 1 ? "Switch to Enrollment" : ""}>
              <Button
                bordered={data.mode !== 1}
                size="sm"
                color="primary"
                auto
                css={{
                  borderTopLeftRadius: "0",
                  borderBottomLeftRadius: "0",
                  outline: "none",
                }}
                onPress={() => {
                  if (data.mode !== 1) {
                    switchMode(data.key, data.mode);
                  }
                }}
              >
                Enrol.
              </Button>
            </Tooltip>
          </Col>
        );

      case "actions":
        return (
          <Col css={{ d: "flex", ai: "center", gap: "0.8rem" }}>
            <Tooltip content="Edit device">
              <IconButton
                type="primary"
                onClick={() => showUpdateModal(data.key, data.name)}
              >
                <BiEditAlt size={22} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Empty Database" contentColor="error">
              <IconButton
                type="error"
                onClick={() => showDeleteModal(data.key, data.name)}
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

  const handleFilterChange = (data, mode) => {
    let newFilteredData = "";
    if (mode === "attendance") {
      newFilteredData = data.filter((item) => item.mode == "0");
    } else if (mode === "enrollment") {
      newFilteredData = data.filter((item) => item.mode == "1");
    } else {
      newFilteredData = data;
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
          Device List
        </Text>
        <Button
          color="secondary"
          auto
          size="sm"
          icon={<FaPlus fill="currentColor" />}
          onPress={showAddModal}
        >
          Add a new device
        </Button>
      </Box>
      <Box
        css={{
          d: "flex",
          justifyContent: "space-between",
          mb: "1rem",
          ai: "center",
          gap: "1rem",
        }}
      >
        <Dropdown>
          <Dropdown.Button
            auto
            color="secondary"
            css={{ tt: "capitalize" }}
            ripple={false}
          >
            {selectedValue}
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
            <Dropdown.Section title="Mode">
              <Dropdown.Item key="all">All</Dropdown.Item>
              <Dropdown.Item key="attendance">Attendance</Dropdown.Item>
              <Dropdown.Item key="enrollment">Enrollment</Dropdown.Item>
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
              : item.name.toLowerCase().includes(search.toLowerCase()) ||
                  item.uid.toLowerCase().includes(search.toLowerCase());
          })}
          renderCell={renderCell}
        />
      )}
      {data?.error && <NotFound error={data["error"]} />}
      {!filteredData && !data?.error && <LoadingPoints />}
      <div>
        <Popup
          header="Empty Database"
          onClick={deleteDevice}
          modal={deleteDeviceModal}
        >
          <Text css={{ mb: "0.5rem" }}>{deleteText}</Text>
          <Text small color="error">
            * Emptying database for this device empties all fingerprints stored.
          </Text>
        </Popup>
        <Popup
          header={header}
          onClick={header === "Add Device" ? addDevice : updateDevice}
          modal={deviceModal}
        >
          <InputField
            input={deviceName}
            aria={`${header} Name`}
            placeholder="Device name"
            helper={nameHelper}
          />
        </Popup>
      </div>
    </>
  );
};

export default Devices;
