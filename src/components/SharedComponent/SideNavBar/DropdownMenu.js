export const menuItems = {
    //Electric Routes
    homeCharger: [
        // { id: "homeChargerList",    label: "Charger List",      path: "/electric/home-charger/charger-list" },
        { id: "homeChargerBooking", label: "Charger Bookings",   path: "/electric/home-charger/charger-booking-list" },
        { id: "invoiceList",        label: "Invoice List",      path: "/electric/home-charger/charger-booking-invoice-list" },
        { id: "timeSlot",           label: "Time Slot",         path: "/electric/home-charger/charger-booking-time-slot-list" },
        { id: "deviceList",         label: "Device List",       path: "/electric/home-charger/device-list" },
        // { id: "areaList",           label: "Area List",         path: "/electric/home-charger/area-list" },
        { id: "failedList",         label: "Failed Booking",    path: "/electric/home-charger/failed-booking-list" },
    ],
    evRoadAssistance: [
        { id: "bookingList",        label: "Booking List",   path: "/electric/ev-road-assistance/booking-list" },
        { id: "timeSlot",           label: "Time Slot",      path: "/electric/ev-road-assistance/time-slot-list" },
        { id: "invoiceList",        label: "Invoice List",   path: "/electric/ev-road-assistance/invoice-list" },
        { id: "failedBookingList",  label: "Failed Booking", path: "/electric/ev-road-assistance/failed-booking-list" },
    ],
    chargerInstallation: [
        { id: "purchaseCustomerList",   label: "EV Products Installation",      path: "/electric/charger-installation/purchase-customer-list" },
        { id: "chargerList",            label: "EV Chargers",                   path: "/electric/charger-installation/ev-charger-list" },
        { id: "chargerBookingList",     label: "EV Chargers Booking",           path: "/electric/charger-installation/ev-charger-booking-list" },
        { id: "productList",            label: "EV Accessories",                path: "/electric/charger-installation/accessories-list" },
        { id: "productBookingList",     label: "EV Accessories Booking",        path: "/electric/charger-installation/accessories-booking-list" },
        { id: "chargerBooking",         label: "Charger Installation Booking",  path: "/electric/charger-installation/charger-installation-list" },
        { id: "brandList",              label: "Brands",                        path: "/electric/charger-installation/ev-charger-brand-list" },
    ],    

    //Mobility Routes
    userList: [
        { id: "activeUserList",  label: "Users List", path: "/mobility/user/user-list" },
        // { id: "deletedUserList", label: "Deleted User List",  path: "/mobility/user/delete-users-list" },
    ],
    signupList: [
        { id: "activeUser",  label: "App Sign Up List", path: "/mobility/app-signup/app-signup-list" },
        { id: "deletedUser", label: "Deleted Account",  path: "/mobility/app-signup/deleted-account" },
    ],
    mobilityStation: [
        { id: "stationList",  label: "List of Stations",   path: "/mobility/mobility-station/station-list" },
        { id: "cycleList",    label: "List of Cycles",      path: "/mobility/mobility-station/cycle-list" },
    ],
    riderList: [
        { id: "rideList",       label: "Bookings",       path: "/mobility/ride/ride-booking-list" },
        { id: "failedRiding",   label: "Incomplete Bookings", path: "/mobility/ride/ride-incomplete-booking-list" },
        { id: "invoiceList",    label: "Invoices",    path: "/mobility/ride/ride-invoice-list" },
        { id: "issueList",      label: "Support Request",      path: "/mobility/ride/support-request-list" },
    ],
    universities: [
        { id: "universitiesList",  label: "List of Universities",   path: "/mobility/universities/university-list" },
        { id: "studentList",       label: "List of Students",       path: "/mobility/universities/student-list" },
    ],
};
