export const menuItems = {
    //Electric Routes
    homeCharger: [
        // { id: "homeChargerList",    label: "Charger List",      path: "/electric/mobile-ev-charging/charger-list" },
        { id: "homeChargerBooking", label: "Bookings",   path: "/electric/mobile-ev-charging/charging-booking-list" },
        { id: "invoiceList",        label: "Invoice List",      path: "/electric/mobile-ev-charging/charging-invoice-list" },
        { id: "timeSlot",           label: "Time Slot",         path: "/electric/mobile-ev-charging/charging-time-slot-list" },
        { id: "chargingpackage",    label: "Charging Packages", path: "/electric/mobile-ev-charging/charging-package-list" },
        { id: "deviceList",         label: "Charging Van List",       path: "/electric/mobile-ev-charging/charging-van-list" },
        // { id: "areaList",           label: "Area List",         path: "/electric/mobile-ev-charging/area-list" },
        { id: "failedList",         label: "Failed Bookings",    path: "/electric/mobile-ev-charging/charging-failed-booking-list" },
    ],
    evRoadAssistance: [
        { id: "bookingList",        label: "Bookings",   path: "/electric/ev-road-assistance/booking-list" },
        { id: "timeSlot",           label: "Time Slot",      path: "/electric/ev-road-assistance/time-slot-list" },
        { id: "invoiceList",        label: "Invoice List",   path: "/electric/ev-road-assistance/invoice-list" },
        // { id: "rsaOfflineLeads",    label: "RSA Offline Leads",   path: "/electric/ev-road-assistance/rsa-offline-leads" },
        { id: "failedBookingList",  label: "Failed Bookings", path: "/electric/ev-road-assistance/failed-booking-list" },
    ],
    chargerInstallation: [
        { id: "purchaseCustomerList",   label: "EV Products Installation",      path: "/electric/charger-installation/purchase-customer-list" },
        { id: "chargerList",            label: "EV Chargers",                   path: "/electric/charger-installation/ev-charger-list" },
        { id: "chargerBookingList",     label: "EV Chargers Booking",           path: "/electric/charger-installation/ev-charging-booking-list" },
        // { id: "productList",            label: "EV Accessories",                path: "/electric/charger-installation/accessories-list" },
        // { id: "productBookingList",     label: "EV Accessories Booking",        path: "/electric/charger-installation/accessories-booking-list" },
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
        { id: "refundList",     label: "Refund Request",       path: "/mobility/ride/refund-requests-list" },
    ],
    universities: [
        { id: "universitiesList",  label: "List of Universities",   path: "/mobility/universities/university-list" },
        { id: "studentList",       label: "List of Students",       path: "/mobility/universities/student-list" },
    ],
     coupon: [
        { id: "couponList",       label: "List of Coupon",           path: "/coupon/coupon-list/coupon-list" },
    ],
};
