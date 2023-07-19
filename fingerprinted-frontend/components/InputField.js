import { Input } from "@nextui-org/react";

const InputField = ({ input, aria, placeholder, helper, type }) => {
  return (
    <Input
      {...input.bindings}
      onClearClick={input.reset}
      aria-label={aria}
      fullWidth
      bordered
      label={placeholder}
      placeholder={placeholder}
      status={helper.color === "secondary" ? "$text" : helper.color}
      color={helper.color}
      helperColor={helper.color}
      helperText={helper.text}
      type={type ? type : "text"}
    />
  );
};

export default InputField;
