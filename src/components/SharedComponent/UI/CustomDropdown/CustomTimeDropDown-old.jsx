import { useState } from "react";
import Select from "react-select";
import { FaChevronDown } from "react-icons/fa";

const timeOptions = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

// const customStyles = {
//   control: (base) => ({
//     ...base,
//     width: "70px",
//     height: "32px",
//     backgroundColor: "#00b26b",
//     border: "none",
//     borderRadius: "6px",
//     boxShadow: "none",
//     cursor: "pointer",
//     '&:hover': {
//       backgroundColor: "#00b26b",
//     },
//   }),
//   valueContainer: (base) => ({
//     ...base,
//     padding: "0 8px",
//     color: "#ffffff",
//     justifyContent: "center",
//   }),
//   singleValue: (base) => ({
//     ...base,
//     color: "#ffffff",
//     fontWeight: 600,
//     fontSize: "12px",
//   }),
//   dropdownIndicator: (base) => ({
//     ...base,
//     padding: 0,
//     color: "#ffffff",
//   }),
//   indicatorSeparator: () => ({
//     display: "none",
//   }),
//   menu: (base) => ({
//     ...base,
//     backgroundColor: "#ffffff",
//     borderRadius: "6px",
//     boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
//     zIndex: 10,
//   }),
//   option: (base, { isSelected }) => ({
//     ...base,
//     fontSize: "13px",
//     padding: "8px 12px",
//     backgroundColor: isSelected ? "#00b26b" : "#ffffff",
//     color: isSelected ? "#ffffff" : "#000000",
//     cursor: "pointer",
//   }),
// };

function CustomTimeDropdown({ options = [], value, onChange, placeholder = "Select Option", }) {
  const [startMeridiem, setStartMeridiem] = useState(timeOptions[0]);
  const [endMeridiem, setEndMeridiem] = useState(timeOptions[1]);

  return (
    // <div style={{
    //     width: "320px",
    //     // border: "2px solid #00b26b",
    //     borderRadius: "12px",
    //     padding: "16px",
    //     backgroundColor: "#fff",
    //     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    //     fontFamily: "Arial, sans-serif",
    //   }}
    // >
    //   {/* Header */}
    //   <div
    //     style={{
    //       display: "flex",
    //       justifyContent: "space-between",
    //       alignItems: "center",
    //       marginBottom: "12px",
    //     }}
    //   >
    //     <span style={{ fontSize: "18px", fontWeight: "600", color: "#1e1e1e" }}>
    //       Select Time
    //     </span>
    //     <FaChevronDown style={{ color: "#1e1e1e" }} />
    //   </div>

    //   {/* Label */}
    //   <div
    //     style={{
    //       fontSize: "12px",
    //       color: "#777",
    //       marginBottom: "6px",
    //     }}
    //   >
    //     Enter Time
    //   </div>

    //   {/* Time input row */}
    //   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    //     <span style={{ fontSize: "14px", fontWeight: "500" }}>00:00</span>
    //     <Select
    //       options={timeOptions}
    //       value={startMeridiem}
    //       onChange={setStartMeridiem}
    //       styles={customStyles}
    //       isSearchable={false}
    //     />
    //     <span style={{ fontSize: "14px", fontWeight: "500" }}>to</span>
    //     <span style={{ fontSize: "14px", fontWeight: "500" }}>00:00</span>
    //     <Select
    //       options={timeOptions}
    //       value={endMeridiem}
    //       onChange={setEndMeridiem}
    //       styles={customStyles}
    //       isSearchable={false}
    //     />
    //   </div>
    // </div>

    <Select options={options} value={value} onChange={onChange} placeholder={placeholder} isClearable={false} styles={customStyles}
    //   formatOptionLabel={(e, { context }) => {
    //     const isSelected = value?.value === e.value;

    //     if (context === "menu") {
    //       return (
    //         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
    //           <span style={{ flexGrow: 1 }}>{e.label}</span>
    //           <span style={{ width: "18px", height: "18px", border: "2px solid #00b26b", borderRadius: "50%", backgroundColor: isSelected ? "#00b26b" : "#f9f9f9",
    //               boxShadow: isSelected ? "inset 0 0 0 3px white" : "none", marginLeft: "12px", flexShrink: 0 }} />
    //         </div>
    //       );
    //     }
    //     return e.label;
    //   }}
    />
  );
}

export default CustomTimeDropdown;

