import style from "../sidenavbar.module.css";

import SidebarDropdownItem from "./SidebarDropdownItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";

function SidebarDropdown({ menuName, menuItems, openDropdown, handleItemClick, toggleDropdown, checkedItems }) {
  return (
    <div className={style.menuItemDiv}>
      <li className={style.menuItemdropdown} onClick={() => toggleDropdown(menuName)}>
        {menuName}
        {openDropdown === menuName ? <FontAwesomeIcon icon={faChevronDown} className={style.arrow} /> : <FontAwesomeIcon icon={faChevronRight} className={style.arrow} />}
      </li>

      {openDropdown === menuName && (
        <ul className={style.subMenu}>
          {menuItems.map((item) => (
            <SidebarDropdownItem key={item.id} item={item} checkedItems={checkedItems} handleItemClick={handleItemClick} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default SidebarDropdown;
