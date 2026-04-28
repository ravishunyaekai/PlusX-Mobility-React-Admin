import Select from "react-select";
import { useState } from "react";

function CustomMultipleSelectionDropDown({ options = [], placeholder = "Select Option", onSelectionChange,isAlwaysOpen=false }) {
  const [selectedValues, setSelectedValues] = useState([]);
  const allSelected = selectedValues.length === options.length - 1;

  // const handleSelect = (selectedOption) => {
  //   let updatedSelections = [];
  //   if (selectedOption.value === "__all__") {
  //     updatedSelections = allSelected ? [] : options;
  //   } else {
  //     const alreadySelected = selectedValues.find(
  //       (v) => v.value === selectedOption.value
  //     );
  //     if (alreadySelected) {
  //       updatedSelections = selectedValues.filter(
  //         (v) => v.value !== selectedOption.value
  //       );
  //     } else {
  //       updatedSelections = [...selectedValues, selectedOption];
  //     }
  //   }

  //   setSelectedValues(updatedSelections);
  //   onSelectionChange?.(updatedSelections);
  // };
  const handleSelect = (selectedOption) => {
  let updatedSelections = [];

  if (selectedOption.value === "all ev's") {
    const isAllSelected = selectedValues.some((v) => v.value === "all ev's");

    if (isAllSelected) {
      updatedSelections = [];
    } else {
      updatedSelections = [...options];
    }
  } else {
    const alreadySelected = selectedValues.find(
      (v) => v.value === selectedOption.value
    );

    if (alreadySelected) {
      updatedSelections = selectedValues.filter(
        (v) => v.value !== selectedOption.value
      );
    } else {
      updatedSelections = [...selectedValues, selectedOption];
    }

    // If user manually selects every brand → auto include "all ev's"
    const allExceptAllEvs = options.filter((o) => o.value !== "all ev's");
    const allOtherSelected = allExceptAllEvs.every((o) =>
      updatedSelections.some((sel) => sel.value === o.value)
    );

    if (allOtherSelected) {
      updatedSelections = [...options]; // add "all ev's" too
    } else {
      // If user deselects something, ensure "all ev's" is removed
      updatedSelections = updatedSelections.filter(
        (o) => o.value !== "all ev's"
      );
    }
  }

  setSelectedValues(updatedSelections);
  onSelectionChange?.(updatedSelections);
};

  // const customOptions = [
  //   { value: "__all__", label: allSelected ? "Deselect All" : "Select All" },
  //   ...options,
  // ];

  return (
    <Select options={options} placeholder={placeholder} onChange={handleSelect} controlShouldRenderValue={false} isClearable={false} styles={customStyles} isDisabled={isAlwaysOpen}
      formatOptionLabel={(e, { context }) => {
        const isSelected = e.value === "__all__" ? allSelected : selectedValues.some((val) => val.value === e.value);

        if (context === "menu") {
          return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span style={{ flexGrow: 1 }}>{e.label}</span>
              <span style={{ width: "18px", height: "18px", border: "2px solid #00b26b", borderRadius: "50%", backgroundColor: isSelected ? "#00b26b" : "#f9f9f9",
                  boxShadow: isSelected ? "inset 0 0 0 3px white" : "none", marginLeft: "12px", flexShrink: 0 }} />
            </div>
          );
        }

        return e.label;
      }}
    />
  );
}

export default CustomMultipleSelectionDropDown;


const customStyles = {
  control: (base, state) => ({
    ...base,
    border: "2px solid #00b26b",
    borderBottom: state.menuIsOpen ? "0" : "2px solid #00b26b",
    borderRadius: state.menuIsOpen ? "10px 10px 0 0" : "10px",
    backgroundColor: state.isDisabled ? "#e0e0e0" : "#f9f9f9",
    padding: "9px 0px",
    // boxShadow: state.menuIsOpen ? "none" : "2px 4px 10px rgba(0, 0, 0, 0.322)",
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.322)",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    pointerEvents: state.isDisabled ? "none" : "auto",
    outline: "none",
    '&:hover': {
      borderColor: "#00b26b",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),
  menu: (base) => ({
    ...base,
    border: "2px solid #00b26b",
    backgroundColor: "#F9F9F9",
    borderTop: "none",
    borderRadius: "0 0 10px 10px",
    boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.322)",
    marginTop: "-5px",
    padding: "4px 0",
    zIndex: 20,
    outline: "none",
  }),
  menuList: (base) => ({
    ...base,
    paddingTop: 0,
    paddingBottom: 0,
    outline: "none",
  }),
  option: (base, /*{ isSelected, isFocused }*/) => ({
    ...base,
    // backgroundColor: isSelected ? '#F9F9F9' : isFocused ? '#F9F9F9' : 'transparent',
    backgroundColor: "#F9F9F9",
    color: "#000",
    outline: "none",
    padding: "5px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // fontWeight: isSelected ? "600" : "400",
    fontSize: "14px",
    cursor: "pointer",
    '&:hover': {
      backgroundColor: "#F9F9F9",
    },
    '&:active': {
      backgroundColor: "#F9F9F9",
    },
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#242424b6",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#000",
  }),
};