import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./sidenavbar.module.css";
import CompanyLogo from "../CompanyLogo";
import SideBarLinkItem from "./SideBarLinkItem";
import SidebarDropdown from "./SidebarDropdown/SidebarDropdown";
import { menuItems } from "./DropdownMenu";

const SideNavbar = () => {
    const [selectedApp, setSelectedApp] = useState(() => { return sessionStorage.getItem("selectedApp") || null});
    const navigate                          = useNavigate();
    const location                          = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openDropdown, setOpenDropdown]   = useState(null);
    const [checkedItems, setCheckedItems]   = useState({
        homeCharger  : { 
            homeChargerList    : false, 
            homeChargerBooking : false, 
            invoiceList        : false, 
            timeSlot   : false, 
            deviceList : false, 
            areaList   : false, 
            failedList : false 
        },
        chargerInstallation : { 
            chargerBooking     : false, 
            chargerBookingList : false, 
            productList        : false, 
            brandList          : false, 
            chargerList        : false, 
            productBookingList : false  
        },
        evRoadAssistance : { bookingList      : false, invoiceList       : false, failedBookingList : false },
        userList         : { activeUserList   : false, deletedUserList   : false },
        signupList       : { activeUser       : false, deletedUser       : false },
        mobilityStation  : { staionList       : false, cycleList         : false },
        universities     : { universitiesList : false, studentList       : false },
        riderList        : { rideList : false, failedRiding : false, invoiceList : false, issueList: false },
        // evCharger           : { chargerBookingList  : false, evCharger        : false, evAccessories: false },
    });
    const handleItemClicked = (menu, id, e) => {
        e.stopPropagation();
        setCheckedItems((prevState) => ({
            ...prevState,
            [menu]: {
                ...prevState[menu],
                [id]: true,
                ...Object.fromEntries(
                    Object.keys(prevState[menu]).map((key) =>
                        key !== id ? [key, false] : [key, true]
                    )
                ),
            },
        }));
    };

    useEffect(() => {
        const storedCheckedItems = sessionStorage.getItem("checkedItems");
        if (storedCheckedItems) {
            const parsedData = JSON.parse(storedCheckedItems);
            setCheckedItems(parsedData.checkedItems);
            setOpenDropdown(parsedData.dropdown);
        }
    }, []);

    useEffect(() => {
        const obj = {
            dropdown: openDropdown,
            checkedItems: checkedItems,
        };
        if (obj.dropdown) {
            sessionStorage.setItem("checkedItems", JSON.stringify(obj));
        }
    }, [checkedItems, openDropdown]);

    useEffect(() => {
        setCheckedItems((prevState) => ({
            homeCharger: location.pathname.includes("/electric/home-charger")
                ? prevState.homeCharger : { homeChargerList: false, homeChargerBooking: false, invoiceList: false, timeSlot: false, deviceList: false, areaList: false, failedList: false },
            evRoadAssistance: location.pathname.includes("/electric/ev-road-assistance")
                ? prevState.evRoadAssistance : { bookingList: false, invoiceList: false, failedBookingList: false },
            chargerInstallation: location.pathname.includes("/electric/charger-installation")
                ? prevState.chargerInstallation : { chargerBooking: false, chargerBookingList: false, productList: false, brandList: false, chargerList: false, productBookingList: false  },
            // evCharger: location.pathname.includes("/electric/ev-charger")
            //     ? prevState.evCharger : { chargerBookingList : false, evCharger : false, evAccessories : false },
            userList: location.pathname.includes("/mobility/user")
                ? prevState.userList : { activeUserList: false, deletedUserList: false },
            signupList: location.pathname.includes("/mobility/app-signup")
                ? prevState.signupList : { activeUser: false, deletedUser: false },
            mobilityStation: location.pathname.includes("/mobility/mobility-station")
                ? prevState.mobilityStation : { staionList: false, cycleList : false },
            // riderList: location.pathname.includes("/mobility/ride") 
            //     ? prevState.riderList : { rideList : false, failedRiding : false, invoiceList : false, issueList : false },
            riderList: location.pathname.includes("/mobility/ride")
                ? {
                    rideList      : location.pathname.includes("/mobility/ride/ride-booking-list"),
                    failedRiding  : location.pathname.includes("/mobility/ride/ride-incomplete-booking-list"),
                    invoiceList   : location.pathname.includes("/mobility/ride/ride-invoice-list"),
                    issueList     : location.pathname.includes("/mobility/ride/support-request-list"),
                }
                : {
                    rideList: false,
                    failedRiding: false,
                    invoiceList: false,
                    issueList: false,
                },

             universities: location.pathname.includes("/mobility/universities") 
                ? prevState.universities : { universitiesList : false, studentList : false },
        }));
        const dropdownPaths = [
            "/electric/home-charger",
            "/electric/ev-road-assistance",
            "/electric/charger-installation",
            // "/electric/ev-charger",
            "/mobility/user",
            "/mobility/app-signup",
            "/mobility/mobility-station",
            "/mobility/ride",
            "/mobility/universities",
        ];
        if (!dropdownPaths.some((path) => location.pathname.includes(path))) {
            sessionStorage.removeItem("checkedItems");
            setOpenDropdown(null);
        }
    }, [location]);

    const toggleDropdown = (menu) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    // const isActive = (route) => location.pathname.startsWith(route);
    // const isActive = (route) => location.pathname === route || location.pathname.startsWith(route + "/");
    const isActive = (route) => {
        if (route === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(route);
    };

    // if (!selectedApp) {
    //     return (
    //         <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`} >
    //             <div className={styles.hamburger} onClick={toggleSidebar}>
    //                 {isSidebarOpen ? "✖" : "☰"}
    //             </div>
    //             <div className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.show : ""}`} >
    //                 <div className={styles.logo}>
    //                     <NavLink onClick={handleClick}><CompanyLogo /></NavLink>
    //                 </div>
    //                 <ul className={styles.menuList}>
    //                     <li onClick={() => navigateToDashboard("electric")} className={styles.menuItem}>PlusX Electric</li>
    //                     <li onClick={() => navigateToDashboard("mobility")} className={styles.menuItem}>PlusX Mobility</li>
    //                 </ul>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`} >
            <div className={styles.hamburger} onClick={toggleSidebar}>
                {isSidebarOpen ? "✖" : "☰"}
            </div>
            <div className={`${styles.sidebarContainer} ${isSidebarOpen ? styles.show : ""}`} >
                <div className={styles.logo}>
                    <NavLink to={`/${selectedApp}/dashboard`}><CompanyLogo /></NavLink>
                </div>
                <ul className={styles.menuList}>
                    {/* {selectedApp && <li onClick={() => setSelectedApp(null)} className={`${styles.menuItem} ${styles.backButton}`}> ⬅ Back</li>} */}

                    {selectedApp === "electric" && (
                        <>
                            <SideBarLinkItem label="Dashboard" path="/electric/dashboard" isActive={isActive("/electric/dashboard")} />
                            <SideBarLinkItem label="Drivers" path="/electric/drivers/driver-list" isActive={isActive("/electric/drivers")} />
                            <SidebarDropdown
                                menuName="Home Charger"
                                menuItems={menuItems.homeCharger}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("homeCharger", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.homeCharger}
                            />
                            <SidebarDropdown
                                menuName="EV Road Assistance"
                                menuItems={menuItems.evRoadAssistance}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("evRoadAssistance", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.evRoadAssistance}
                            />
                            <SideBarLinkItem label="Public Chargers Station" path="/electric/public-charger-station/public-charger-station-list" isActive={isActive("/electric/public-charger-station")} />
                            {/* <SidebarDropdown
                                menuName="EV Charger"
                                menuItems={menuItems.evCharger}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("evCharger", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.evCharger}
                            /> */}
                            <SidebarDropdown
                                menuName="Charger Installation"
                                menuItems={menuItems.chargerInstallation}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("chargerInstallation", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.chargerInstallation}
                            />
                            
                            <SideBarLinkItem label="Charge Share Listings" path="/electric/charge-share/charge-share-list" isActive={isActive("/electric/charge-share/charge-share-list")} />

                            {/* <SideBarLinkItem label="EV Insurance" path="/electric/ev-insurance/ev-insurance-list" isActive={isActive("/electric/ev-insurance/ev-insurance-list")} /> */}
                            <SideBarLinkItem label="Offer" path="/electric/offer/offer-list" isActive={isActive("/electric/offer")} />
                            <SideBarLinkItem label="Coupon" path="/electric/coupon/coupon-list" isActive={isActive("/electric/coupon")} />
                        </>
                    )}

                    {selectedApp === "mobility" && (
                        <>
                            <SideBarLinkItem label="Dashboard" path="/mobility/dashboard" isActive={isActive("/mobility/dashboard")} />
                            {/* <SidebarDropdown
                                menuName="Users List"
                                menuItems={menuItems.userList}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("userList", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.userList}
                            /> */}
                            <SidebarDropdown
                                menuName="App Sign Up List"
                                menuItems={menuItems.signupList}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("signupList", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.signupList}
                            />
                            <SidebarDropdown
                                menuName="Mobility Stations"
                                menuItems={menuItems.mobilityStation}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("mobilityStation", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.mobilityStation}
                            />
                            {/* <SideBarLinkItem label="Bookings" path="/mobility/ride/ride-booking-list" isActive={isActive("/mobility/coupon")} /> */}
                            <SidebarDropdown
                                menuName="Ride Bookings"
                                menuItems={menuItems.riderList}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("riderList", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.riderList}
                            />
                            <SidebarDropdown
                                menuName="Universities/Student"
                                menuItems={menuItems.universities}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("universities", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.universities}
                            />
                            {/* <SidebarDropdown
                                menuName="Coupon"
                                menuItems={menuItems.coupon}
                                openDropdown={openDropdown}
                                handleItemClick={(id, e) => handleItemClicked("coupon", id, e)}
                                toggleDropdown={toggleDropdown}
                                checkedItems={checkedItems.coupon}
                            /> */}
                            {/* <SideBarLinkItem label="Coupon" path="/mobility/coupon" isActive={isActive("/mobility/coupon")} /> */}
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SideNavbar;
