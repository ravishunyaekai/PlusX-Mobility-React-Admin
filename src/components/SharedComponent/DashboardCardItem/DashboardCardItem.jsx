import { NavLink } from "react-router-dom";
import style from "./DashboardCardItem.module.css";

const DashboardCardItem = (props) => {
  const { title, icon, count, route, isActive, onClick } = props;

  return (
    <NavLink to={route} className={`${style.card} ${isActive ? style.cardActive : ""}`} onClick={onClick} >
      <div className={style.cardWrapper}>
        <img className={style.cardIcon} src={icon} alt={title} />
        <div className={style.cardCount}>{count}</div>
      </div>
      <div className={style.cardTitle}>{title}</div>
    </NavLink>
  );
};

export default DashboardCardItem;
