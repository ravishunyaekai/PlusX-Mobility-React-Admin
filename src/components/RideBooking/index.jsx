import styles from './RideList/RideList.module.css';
import { Outlet } from "react-router-dom";

const index = () => {
  return (
    <div className={styles.portableChargerContainer}>
      <Outlet />
    </div>
  );
};

export default index;
