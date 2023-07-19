import { Table } from "@nextui-org/react";

const DataTable = ({ columns, data, renderCell }) => {
  return (
    <Table
      compact
      aria-label="Table of Devices"
      css={{ minWidth: "100%" }}
      selectionMode="none"
      color="secondary"
    >
      <Table.Header columns={columns}>
        {(column) => (
          <Table.Column key={column.key}>{column.label}</Table.Column>
        )}
      </Table.Header>
      <Table.Body
        items={data}
        css={{
          "& .nextui-c-PJLV-iiQewsr-css": {
            height: 0,
          },
        }}
      >
        {(item) => (
          <Table.Row>
            {(columnKey) => (
              <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
            )}
          </Table.Row>
        )}
      </Table.Body>
      {data.length > 10 && <Table.Pagination align="center" rowsPerPage={10} />}
    </Table>
  );
};

export default DataTable;
