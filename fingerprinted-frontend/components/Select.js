import { Dropdown, Text } from "@nextui-org/react";
import Box from "./Box";

const Select = ({
  selectedValue,
  selected,
  setSelected,
  items,
  type,
  multiple,
}) => {
  return (
    <Box
      css={{
        dflex: "flex-start",
        ai: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
        mb: "0.5rem",
      }}
    >
      <Text color="secondary">
        {type !== "Enrolled Courses" ? "Select" : ""} {type}{":"}
      </Text>
      <Dropdown>
        <Dropdown.Button
          auto
          color="secondary"
          css={{ tt: "capitalize" }}
          ripple={false}
          size="sm"
        >
          {selectedValue}
        </Dropdown.Button>
        <Dropdown.Menu
          solid
          aria-label="Filter selection"
          color="secondary"
          disallowEmptySelection
          selectionMode={multiple ? "multiple" : "single"}
          selectedKeys={selected}
          onSelectionChange={setSelected}
          items={items}
        >
          {(item) => <Dropdown.Item key={item.name}>{item.name}</Dropdown.Item>}
        </Dropdown.Menu>
      </Dropdown>
    </Box>
  );
};

export default Select;
