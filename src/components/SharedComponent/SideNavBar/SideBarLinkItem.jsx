import { NavLink } from "react-router-dom";
import style from "./sidenavbar.module.css";

function SideBarLinkItem({ path, label, isActive }) {
  return (
    <NavLink to={path} className={`${style.menuItem} ${isActive ? style.active : ""}`}>
      <li>{label}</li>
    </NavLink>
  );
}

export default SideBarLinkItem;

