import { MultiSelect } from "react-multi-select-component";
import "./MultiSelectDropdown.css";

function MultiSelectDropdown({ options = [], value = [], onChange, labelledBy = "Select Option", enableSelectAll = false, closeOnSelect = false, closeOnChangedValue = false,
  selectAllValue = "__all__", allSelectedLabel = "Select All" }) {

  const isSelectAll = (opt) => enableSelectAll && opt?.value === selectAllValue;

  const handleChange = (selected) => {
    if (!enableSelectAll) {
      onChange(selected);
      return;
    }

    if (selected.some(isSelectAll)) {
      const allSelected = value.length === options.length;
      onChange(allSelected ? [] : options);
      return;
    }

    onChange(selected.filter((o) => !isSelectAll(o)));
  };

  const effectiveOptions = enableSelectAll && options.length > 0 ? [{ value: selectAllValue, label: allSelectedLabel }, ...options] : options;

  return (
    <MultiSelect options={effectiveOptions} value={value} onChange={handleChange} labelledBy={labelledBy} hasSelectAll={false} className="custom-multi-select" //disableSearch
      closeOnChangedValue={closeOnChangedValue} closeOnSelect={closeOnSelect} ItemRenderer={({ option, checked, onClick }) => (
        <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 10px", cursor: "pointer",  backgroundColor: "#f9f9f9", color: checked ? "#00b26b" : "#000" }} >
          <span>{option.label}</span>
          <span style={{ width: 18, height: 18, border: "2px solid #00b26b", borderRadius: "50%", backgroundColor: checked ? "#00b26b" : "#f9f9f9", boxShadow: checked ? "inset 0 0 0 3px white" : "none" }} />
        </div>
      )}
      ValueRenderer={(selected) => {
        if (selected.length === 0) return labelledBy;
        if (selected.length === options.length) return allSelectedLabel;
        return selected.map((s) => s.label).join(", ");
      }}
    />
  );
}

export default MultiSelectDropdown;


// OldOne
// import { MultiSelect } from "react-multi-select-component";
// import './MultiSelectDropdown.css';

// function MultiSelectDropdown({ options = [], value, onChange, labelledBy = "Select Option", closeOnChangedValue = false, closeOnSelect = false }) {
//   return (
//     <MultiSelect options={options} value={value} onChange={onChange} labelledBy={labelledBy} hasSelectAll={false} disableSearch className="custom-multi-select"
//       ItemRenderer={({ option, checked, onClick }) => (
//         <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "6px 10px", cursor: "pointer", backgroundColor: checked ? "#f9f9f9" : "#f9f9f9", color: checked ? "#00b26b" : "#000" }}>
//           <span>{option.label}</span>
//           <span style={{ width: "18px", height: "18px", border: "2px solid #00b26b", borderRadius: "50%", backgroundColor: checked ? "#00b26b" : "#f9f9f9", boxShadow: checked ? "inset 0 0 0 3px white" : "none" }}/>
//         </div>
//       )}
//       ValueRenderer={(selected) => {
//         if (selected.length === 0) return labelledBy;
//         if (selected.find((s) => s.value === "all ev's")) {
//           return "Works with all EV's";
//         }
//         return selected.map((s) => s.label).join(", ");
//       }}
//     />
//   );
// }

// export default MultiSelectDropdown;