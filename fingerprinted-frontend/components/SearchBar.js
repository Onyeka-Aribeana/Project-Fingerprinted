import React from "react";
import {Input} from "@nextui-org/react";
import { GoSearch } from "react-icons/go";

const SearchBar = ({ onChange }) => {
  return (
    <Input
      aria-label="Search"
      type="search"
      color="secondary"
      placeholder="Search"
      contentLeft={<GoSearch fill="currentColor" size={18} />}
      onChange={onChange}
    />
  );
};

export default SearchBar;
