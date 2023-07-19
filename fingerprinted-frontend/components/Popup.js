import { Modal, Text, Button } from "@nextui-org/react";

const Popup = ({ header, onClick, modal, children }) => {
  return (
    <Modal
      closeButton
      {...modal.bindings}
      aria-labelledby={`${header.toLowerCase()} modal`}
      css={{
        h: "auto",
        "& .nextui-c-iDzHRq": {
          overflowY: "initial",
        },
      }}
    >
      <Modal.Header>
        <Text css={{ color: "$text" }} size={18} h3>
          {header.toUpperCase()}
        </Text>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button auto flat color="error" onPress={() => modal.setVisible(false)}>
          Close
        </Button>
        <Button auto color="secondary" onPress={onClick}>
          {header}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Popup;
