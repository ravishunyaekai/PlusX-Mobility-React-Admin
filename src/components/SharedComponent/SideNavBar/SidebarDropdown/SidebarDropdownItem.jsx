import { NavLink } from "react-router-dom";
import style from "../sidenavbar.module.css";

function SidebarDropdownItem({ item, checkedItems, handleItemClick }) {
  return (
    <NavLink key={item.id} to={item.path} className={`${style.dropdownMenuItem} ${ checkedItems[item.id] ? style.activeItem : style.inactiveItem }`} onClick={(e) => handleItemClick(item.id, e)}>
      <li>
        <input className={style.checkboxInput} type="checkbox" id={item.id} checked={checkedItems[item.id]} onChange={(e) => handleItemClick(item.id, e)} />
        <label htmlFor={item.id} className={style.checkmark}></label>
        {item.label}
      </li>
    </NavLink>
  );
}

export default SidebarDropdownItem;
