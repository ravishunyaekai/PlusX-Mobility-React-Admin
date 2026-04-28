import { Outlet } from "react-router-dom";

import MobilityHeader from "./Header/MobilityHeader";
import PlusxHeader from "./Header/PlusxHeader";
import SideNavbar from "./SideNavBar/SideNavbar";

function Layout() {
  const selectedApp = sessionStorage.getItem("selectedApp");
  return (
    <>
      <div className="d-flex">
        <div>
          <SideNavbar />
        </div>
        <div className="d-flex flex-column w-100">
          <div>
            {selectedApp === "mobility" && <MobilityHeader />}
            {selectedApp === "electric" && <PlusxHeader />}
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
