import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../store/store.js";
// Login, Layout & Others
import Login from "../components//SharedComponent/Login/index.jsx";
import Layout from "../components/SharedComponent/Layout.jsx";
import Error from "../components/SharedComponent/Error/Error.jsx";
import MobilityNotificationList from "../components/Notification/NotificationList.jsx";
import PlusxNotificationList from "../components/PlusxElectric/Notification/NotificationList.jsx";
import Profile from "../components/Profile/index.jsx"

// Dashboard
import LandingPage from "../components/LandingPage/LandingPage.jsx";
import Dashboard from "../components/Dashboard/index.jsx";

// Users List
import UserList from "../components/AdminUsers/UserList/UsersList.jsx";
import AddNewUser from "../components/AdminUsers/AddUsers/AddUser.jsx";
import DeletedUsersList from "../components/AdminUsers/UserList/DeletedUsersList.jsx";

// App Signup
import AppSignUp from "../components/AppSignUp/index.jsx";
import AppSignupList from "../components/AppSignUp/AppSignupList/AppSignupList.jsx";
import DeletedSignupList from "../components/AppSignUp/AppSignupList/DeletedSignupList.jsx";
import AppSignupDetails from "../components/AppSignUp/AppSignupDetails/AppSignupDetails.jsx";

// Mobility Stations
import MobilityStations from "../components/MobilityStations/index.jsx";
import AddMobilityStation from "../components/MobilityStations/Station/AddMobilityStation/AddMobilityStation.jsx";
import EditMobilityStation from "../components/MobilityStations/Station/EditMobilityStation/EditMobilityStation.jsx";
import MobilityStationsList from "../components/MobilityStations/Station/MobilityStationList/MobilityStationsList.jsx";
import MobilityStationsDetails from "../components/MobilityStations/Station/MobilityStationsDetails/MobilityStationsDetails.jsx";

// Cycle
import AddCycle from "../components/MobilityStations/Cycle/AddCycle/AddCycle.jsx";
import EditCycle from "../components/MobilityStations/Cycle/EditCycle/EditCycle.jsx";
import CycleList from "../components/MobilityStations/Cycle/CycleList/CycleList.jsx";
import CycleDetails from "../components/MobilityStations/Cycle/CycleDetails/CycleDetails.jsx";

// Ride Bookings
import RideBooking from "../components/RideBooking/index.jsx";
import RideList from "../components/RideBooking/RideList/RideList.jsx";
import RideDetails from "../components/RideBooking/RideDetails/RideDetails.jsx";
import FailedRideList from "../components/RideBooking/RideList/FailedRideList.jsx";
import FailedRideDetails from "../components/RideBooking/RideDetails/FailedRideDetails.jsx";
import InvoiceList from "../components/RideBooking/RideList/InvoiceList.jsx";
import RideInvoiceDetails from "../components/RideBooking/Invoice/InvoiceDetails.jsx";
import SupportRequestList from "../components/RideBooking/RideList/SupportRequestList.jsx"; 
import SupportRequestDetails from "../components/RideBooking/RideDetails/SupportRequestDetails.jsx";
import RefundRequestList from "../components/RideBooking/RideList/RefundRequestList.jsx"; 
import RefundRequestDetails from "../components/RideBooking/RideDetails/RefundRequestDetails.jsx";



// University
import University from "../components/University/index.jsx";
import AddUniversity from "../components/University/University/AddUniversity/AddUniversity.jsx";
import EditUniversity from "../components/University/University/EditUniversity/EditUniversity.jsx"
import UniversityList from "../components/University/University/UniversityList/UniversityList.jsx";
import UniversityDetails from "../components/University/University/UniversityDetails/UniversityDetails.jsx";
import UniversityRiderDetails from "../components/University/University/UniversityDetails/UniversityRiderDetails.jsx";

//Student
import AddStudent from "../components/University/Student/AddStudent/AddStudent.jsx";
import EditStudent from "../components/University/Student/EditStudent/EditStudent.jsx"
import StudentList from "../components/University/Student/StudentList/StudentList.jsx";
import StudentDetails from "../components/University/Student/StudentDetails/StudentDetails.jsx";

// PlusX Electric Routes
// Dashboard
import ElectricDashboard from "../components/PlusxElectric/Dashboard/index.jsx";

// Drivers
import Riders from "../components/PlusxElectric/Riders/index.jsx";
import RiderList from "../components/PlusxElectric/Riders/RiderList.jsx";
import RiderDetails from "../components/PlusxElectric/Riders/RiderDetails/Details.jsx";
import AddDriver from "../components/PlusxElectric/Riders/AddDriver.jsx";
import EditDriver from "../components/PlusxElectric/Riders/EditDriver.jsx";
// import TruckList from "../components/Truck/truckList.jsx";
// import AddTruck from "../components/Truck/addTruck.jsx";
// import EditTruck from "../components/Truck/EditTruck.jsx";
// import TruckDetails from "../components/Truck/TruckDetails.jsx";

// EV RoadSide Assistance
import EvRoadAssistance from "../components/PlusxElectric/EvRoadAssistance/index.jsx";
import RoadAssistanceBookingList from "../components/PlusxElectric/EvRoadAssistance/Booking/BookingList.jsx";
import RoadAssistanceBookingDetails from "../components/PlusxElectric/EvRoadAssistance/Booking/BookingDetails.jsx";
import RoadAssistanceInvoiceList from "../components/PlusxElectric/EvRoadAssistance/Invoice/InvoiceList.jsx";
import RoadAssistanceInvoiceDetails from "../components/PlusxElectric/EvRoadAssistance/Invoice/InvoiceDetails.jsx";
import RoadAssistanceTimeSlotList from "../components/PlusxElectric/EvRoadAssistance/TimeSlotLIst/RoadAssistanceTimeSlotList.js";
import AddRSATimeSlot from "../components/PlusxElectric/EvRoadAssistance/TimeSlotLIst/AddTimeSlot.jsx";
import EditRSATimeSlotList from "../components/PlusxElectric/EvRoadAssistance/TimeSlotLIst/EditTimeSlot.jsx";
import FailedRSABookingList from "../components/PlusxElectric/EvRoadAssistance/Booking/FailedBookingList.js";
import FailedRSABookingDetails from "../components/PlusxElectric/EvRoadAssistance/Booking/FailedBookingDetails.js";

// Public Charger Station
import PublicChargeStation from "../components/PlusxElectric/PublicChargerStation/index.jsx";
import PublicChargerStationList from "../components/PlusxElectric/PublicChargerStation/StationList.jsx";
import PublicChargerStationDetails from "../components/PlusxElectric/PublicChargerStation/StationDetails.jsx";
import AddChargerStation from "../components/PlusxElectric/PublicChargerStation/AddChargerStation.jsx";
import EditPublicChargerStation from "../components/PlusxElectric/PublicChargerStation/EditPublicChargerStation.jsx";

// Charger Installation
import ChargerInstallation from "../components/PlusxElectric/ChargerInstallation/index.jsx";
import ChargerInstallationList from "../components/PlusxElectric/ChargerInstallation/ChargerInstallationList.jsx";
import ChargerInstallationDetails from "../components/PlusxElectric/ChargerInstallation/ChargerInstallationDetails.jsx";
import EvChargerList from "../components/PlusxElectric/ChargerInstallation/EvCharger/EvChargerList.jsx";
import EvChargerBookingList from "../components/PlusxElectric/ChargerInstallation/EvCharger/EvChargerBookingList.jsx";
import AddEVCharger from "../components/PlusxElectric/ChargerInstallation/EvCharger/AddEVCharger.jsx";
import EditEVCharger from "../components/PlusxElectric/ChargerInstallation/EvCharger/EditEVCharger.jsx";
import EvChargerBrandList from "../components/PlusxElectric/ChargerInstallation/EvCharger/BrandList/BrandList.jsx";
import EvChargerDetails from "../components/PlusxElectric/ChargerInstallation/EvCharger/EvChargerDetails.jsx";
import EvChargerBookingDetails from "../components/PlusxElectric/ChargerInstallation/EvCharger/EvChargerBookingDetails.jsx";
import AccessoriesList from "../components/PlusxElectric/ChargerInstallation/Accessories/ProductList.jsx";
import AccessoriesDetails from "../components/PlusxElectric/ChargerInstallation/Accessories/ProductDetails.jsx";
import AccessoriesBookingList from "../components/PlusxElectric/ChargerInstallation/Accessories/EvAccessoriesBookingList.jsx";
import AccessoriesBookingDetails from "../components/PlusxElectric/ChargerInstallation/Accessories/EvAccessoriesBookingDetails.jsx";
import AddAccessory from "../components/PlusxElectric/ChargerInstallation/Accessories/AddProduct.jsx";
import EditAccessory from "../components/PlusxElectric/ChargerInstallation/Accessories/EditProduct.jsx";
import PurchaseCustomerList from "../components/PlusxElectric/ChargerInstallation/purchaseHistory/PurchaseHistoryList.jsx";
import PurchaseCustomerDetails from "../components/PlusxElectric/ChargerInstallation/purchaseHistory/PurchaseHistoryDetails.jsx";
import AddCustomer from "../components/PlusxElectric/ChargerInstallation/purchaseHistory/AddPurchase.jsx";
import EditCustomer from "../components/PlusxElectric/ChargerInstallation/purchaseHistory/EditPurchase.jsx";
// charge share listings
import ChargeShareListings from "../components/PlusxElectric/PublicChargerStation/index.jsx";
// Offer
import Offer from "../components/PlusxElectric/Offer/index.jsx";
import AddOffer from "../components/PlusxElectric/Offer/AddOffer.jsx";
import EditOffer from "../components/PlusxElectric/Offer/EditOffer.jsx";
import OfferList from "../components/PlusxElectric/Offer/OfferList.jsx";
import OfferDetails from "../components/PlusxElectric/Offer/OfferDetails.jsx";

//Coupon
import Coupon from "../components/PlusxElectric/Coupon/index.jsx";
import AddCoupon from "../components/PlusxElectric/Coupon/AddCoupon.jsx";
import EditCoupon from "../components/PlusxElectric/Coupon/EditCoupon.jsx";
import CouponList from "../components/PlusxElectric/Coupon/CouponList.jsx";
// import EditUniversity from "../components/University/University/EditUninversity/editUniversiyt.jsx";

//Home Charger
import HomeCharger from "../components/PlusxElectric/HomeCharger/index.jsx";
import AddPod from "../components/PlusxElectric/HomeCharger/AddPod/AddPod.js";
import ChargerList from "../components/PlusxElectric/HomeCharger/ChargerList/ChargerList.jsx";
import AddCharger from "../components/PlusxElectric/HomeCharger/ChargerList/AddCharger.jsx";
import EditPortableChargerTimeSlot from "../components/PlusxElectric/HomeCharger/TimeSlotLIst/EditTimeSlot.jsx";
import EditPortableCharger from "../components/PlusxElectric/HomeCharger/ChargerList/EditCharger.jsx";
import CustomerChargerBookingList from "../components/PlusxElectric/HomeCharger/ChargerBooking/CustomerChargerBookingList.js";
import ChargerBookingList from "../components/PlusxElectric/HomeCharger/ChargerBooking/ChargerBookingList.js";
import ChargingPackageList from "../components/PlusxElectric/HomeCharger/ChargingPackages/packageList.jsx";
import ChargerBookingInvoiceList from "../components/PlusxElectric/HomeCharger/InvoiceList/InvoiceList.js";
import PortableChargerTimeSlotList from "../components/PlusxElectric/HomeCharger/TimeSlotLIst/PortableChargerTimeSlotList.js";
import AddPortableChargerTimeSlot from "../components/PlusxElectric/HomeCharger/TimeSlotLIst/AddTimeSlot.jsx";
import ChargerBookingDetails from "../components/PlusxElectric/HomeCharger/ChargerBooking/ChargerBookingDetails.js";
import InvoiceDetails from "../components/PlusxElectric/HomeCharger/InvoiceList/InvoiceDetails.jsx";
import FailedChargerBookingList from "../components/PlusxElectric/HomeCharger/ChargerBooking/FailedChargerBookingList.js";
import FailedBookingDetails from "../components/PlusxElectric/HomeCharger/ChargerBooking/FailedBookingDetails.js";
import PodDeviceList from "../components/PlusxElectric/PodDevice/Device/deviceList.jsx";
import AddPodDevice from "../components/PlusxElectric/PodDevice/Device/AddPodDevice.jsx";
import EditPodDevice from "../components/PlusxElectric/PodDevice/Device/EditPodDevice.jsx";
import DeviceDetails  from "../components/PlusxElectric/PodDevice/Device/DeviceDetails.jsx";
import PodAreaList from "../components/PlusxElectric/PodDevice/Area/PodAreaList.jsx";
import AddPodArea from "../components/PlusxElectric/PodDevice/Area/AddPodArea.jsx";
import EditPodArea from "../components/PlusxElectric/PodDevice/Area/EditPodArea.jsx";
import PodBrandList from "../components/PlusxElectric/PodDevice/Brand/BrandList.jsx";
import AddPodBrand from "../components/PlusxElectric/PodDevice/Brand/AddBrand.jsx";
import EvInsuranceList from "../components/PlusxElectric/EvInsurance/EvInsuranceList.jsx";
import EvInsuranceDetail from "../components/PlusxElectric/EvInsurance/EvInsuranceDetails.jsx";
import EvInsurance from "../components/PlusxElectric/EvInsurance/index.jsx";
import ChargeShareList from "../components/PlusxElectric/ChargeShare/ChargeShareList.jsx";
import EditChargeShare from "../components/PlusxElectric/ChargeShare/EditChargeShare.jsx";
import ChargeShareDetails from "../components/PlusxElectric/ChargeShare/ChargeShareDetails.jsx";

const router = createBrowserRouter([
    {
        path    : "/login",
        element : <Login />,
    },

    {
        path    : "/",
        element : <LandingPage />,
    },

    //Mobility Routes
    {
        path     : "/mobility",
        element  : <Layout />,
        children : [
            {
                path    : "dashboard",
                element : <Dashboard />,
            },
            // Users List
            {
                path     : "user",
                element  : <AppSignUp/>,
                children : [
                    {
                        path    : "user-list",
                        element : <UserList />,
                    },
                    {
                        path    : "add-new-user",
                        element : <AddNewUser/>,
                    },
                    {
                        path    : "delete-users-list",
                        element : <DeletedUsersList />,
                    },
                ],
            },
            //App Signup
            {
                path     : "app-signup",
                element  : <AppSignUp/>,
                children : [
                    {
                        path    : "app-signup-list",
                        element : <AppSignupList />,
                    },
                    {
                        path    : "app-signup-details/:riderId",
                        element : <AppSignupDetails/>,
                    },
                    {
                        path    : "deleted-account",
                        element : <DeletedSignupList />,
                    },
                ],
            },
            //Total Number of stations
            {
                path: "mobility-station",
                element: <MobilityStations/>,
                children: [
                    // station
                    {
                        path: "add-mobility-station",
                        element: <AddMobilityStation />,
                    },
                    {
                        path: "edit-mobility-station/:stationId",
                        element: <EditMobilityStation />,
                    },
                    {
                        path: "station-list",
                    element: <MobilityStationsList/>,
                    },
                    {
                        path: "station-details/:stationId",
                        element: <MobilityStationsDetails/>,
                    },

                    //Cycle
                    {
                        path: "add-cycle",
                        element: <AddCycle />,
                    },
                    {
                        path: "edit-cycle/:cycleId",
                        element: <EditCycle />,
                    },
                    {
                        path: "cycle-list",
                        element: <CycleList/>,
                    },
                    {
                        path: "cycle-details/:cycleId",
                        element: <CycleDetails/>,
                    },
                ],
            },
            // Rider Bookings
            {
                path     : "ride",
                element  : <RideBooking />,
                children : [
                    {
                        path: "ride-booking-list",
                        element: <RideList />,
                    }, {
                        path: "ride-booking-details/:bookingId",
                        element: <RideDetails />,
                    }, {
                        path: "ride-incomplete-booking-list",
                        element: <FailedRideList />,
                    }, {
                        path: "ride-incomplete-booking-details/:bookingId",
                        element: <FailedRideDetails />,
                    }, {
                        path: "ride-invoice-list",
                        element: <InvoiceList />,  
                    }, {
                        path: "ride-invoice-details/:bookingId",
                        element: <RideInvoiceDetails />,  
                    }, {
                        path: "support-request-list",
                        element: <SupportRequestList />,
                    }, {
                        path: "support-request-details/:bookingId",
                        element: <SupportRequestDetails />,
                    }, {
                        path: "refund-requests-list",
                        element: <RefundRequestList />,
                    }, 
                ],
            },
            // University  
            {
                path: "universities",
                element: <University />,
                children: [
                    {
                        path: "add-university",
                        element: <AddUniversity />,
                    },
                    {
                        path: "edit-university/:id",
                        element: <EditUniversity/>,
                    },
                    {
                        path: "university-list",
                        element: <UniversityList />,
                    },
                    // {
                    //     path: "edit-university/:universityId",
                    //     element: <EditUniversity />,
                    // },
                    {
                        path: "university-details/:universityId",
                        element: <UniversityDetails />,
                    },
                    {
                        path: "rider-details/:riderId",
                        element: <UniversityRiderDetails />,
                    },
                    {
                        path: "add-student",
                        element: <AddStudent />,
                    },
                    {
                        path: "edit-student/:id",
                        element: <EditStudent/>,
                    },
                    {
                        path: "student-list",
                        element: <StudentList />,
                    },
                    {
                        path: "student-details/:riderId",
                        element: <StudentDetails />,
                    },
                ],
            },
            // notification-list
            {
                path: "notification-list",
                element: <MobilityNotificationList />,
            },
            // profile
            {
                path: "profile",
                element: <Profile/>
            },
        ],
    },

    //PlusX Routes
    {
        path     : "/electric",
        element  : <Layout />,
        children : [
            {
                path    : "dashboard",
                element : <ElectricDashboard />,
            },
            // Driver
            {
                path     : "drivers",
                element  : <Riders/>,
                children : [
                    {
                        path: "driver-list",
                        element: <RiderList />,
                    },
                    {
                        path: "drivers-details/:rsaId",
                        element: <RiderDetails />,
                    },
                    {
                        path: "add-driver",
                        element: <AddDriver />,
                    },
                    {
                        path: "edit-driver/:rsaId",
                        element: <EditDriver />,
                    },
                    // {
                    //     path: "truck-list",
                    //     element: <TruckList />,
                    // },
                    // {
                    //     path: "add-truck",
                    //     element: <AddTruck />,
                    // },
                    // {
                    //     path: "edit-truck/:truckId",
                    //     element: <EditTruck />,
                    // }, 
                    // {
                    //     path: "truck-details/:truckId",
                    //     element: <TruckDetails />,
                    // }, 
                ],
            },
            //Home Charger
            {
                path: "home-charger",
                element: <HomeCharger />,
                children: [
                    {
                        path:"add-pod",
                        element:<AddPod/>
                    },
                    {
                        path: "charger-list",
                        element: <ChargerList />,
                    },
                    {
                        path: "add-charger",
                        element: <AddCharger />,
                    },
                    {
                        path: "edit-charger/:chargerId",
                        element: <EditPortableCharger />,
                    },
                    {
                        path: "customer-charger-booking-list/:customerId",
                        element: <CustomerChargerBookingList />,
                    },
                    {
                        path: "charger-booking-list",
                        element: <ChargerBookingList />,
                    },
                    {
                        path: "charger-booking-details/:bookingId",
                        element: <ChargerBookingDetails />,
                    },
                    {
                        path: "charger-booking-invoice-list",
                        element: <ChargerBookingInvoiceList />,
                    },
                    {
                        path: "charging-package-list",
                        element: <ChargingPackageList />,
                    },
                    {
                        path: "charger-booking-time-slot-list",
                        element: <PortableChargerTimeSlotList />,
                    },
                    {
                        path: "add-time-slot",
                        element: <AddPortableChargerTimeSlot />,
                    },
                    {
                        path: "edit-time-slot/:slotDate",
                        element: <EditPortableChargerTimeSlot />,
                    },
                    {
                        path: "invoice/:invoiceId",
                        element: <InvoiceDetails />,
                    },
                    // Pod Device Route
                    {
                        path: "device-list",
                        element: <PodDeviceList />,
                    },
                    {
                        path: "add-device",
                        element: <AddPodDevice />,  
                    },
                    {
                        path: "edit-device/:podId",
                        element: <EditPodDevice />,  
                    }, {
                        path: "device-details/:podId",
                        element: <DeviceDetails />,  
                    },
                    {
                        path    : "area-list",
                        element : <PodAreaList />,
                    },
                    {
                        path    : "brand-list",
                        element : <PodBrandList />,
                    },
                    {
                        path    : "add-brand/:deviceId",
                        element : <AddPodBrand />,
                    },
                    {
                        path    : "add-area",
                        element : <AddPodArea />,
                    },
                    {
                        path    : "edit-area/:areaId",
                        element : <EditPodArea />,
                    },
                    {
                        path: "failed-booking-list",
                        element: <FailedChargerBookingList />,
                    },
                    {
                        path: "failed-charger-booking-details/:bookingId",
                        element: <FailedBookingDetails />,
                    },
                    // End Pod Device Route  
                ],
            },
            //road assistance
            {
                path     : "ev-road-assistance",
                element  : <EvRoadAssistance />,
                children : [
                    {
                        path: "booking-list",
                        element: <RoadAssistanceBookingList />,
                    }, {
                        path: "booking-details/:requestId",
                        element: <RoadAssistanceBookingDetails />,
                    }, {
                        path: "invoice-list",
                        element: <RoadAssistanceInvoiceList />,
                    },  {
                        path: "invoice-details/:invoiceId",
                        element: <RoadAssistanceInvoiceDetails />,
                    }, {
                        path: "time-slot-list",
                        element: <RoadAssistanceTimeSlotList />,
                    }, {
                        path: "add-time-slot",
                        element: <AddRSATimeSlot />,
                    }, {
                        path: "edit-time-slot/:slotDate",
                        element: <EditRSATimeSlotList />,
                    }, {
                        path: "failed-booking-list",
                        element: <FailedRSABookingList />,
                    }, {
                        path: "failed-booking-details/:requestId",
                        element: <FailedRSABookingDetails />,
                    },
                ],
            },
            // public charger station
            {
                path: "public-charger-station",
                element: <PublicChargeStation/>,
                children: [
                    {
                        path: "public-charger-station-list",
                        element: <PublicChargerStationList/>,
                    },
                    {
                        path: "public-charger-station-details/:stationId",
                        element: <PublicChargerStationDetails/>,
                    },
                    {
                        path: "add-charger-station",
                        element: <AddChargerStation />,
                    },
                    {
                        path: "edit-charger-station/:stationId",
                        element: <EditPublicChargerStation />,
                    },
                ],
            },
            //charger installation
            {
                path: "charger-installation",
                element: <ChargerInstallation/>,
                children: [
                    {
                        path: "purchase-customer-list",
                        element: <PurchaseCustomerList />,
                    },
                    {
                        path: "purchase-customer-details/:purchaseId",
                        element: <PurchaseCustomerDetails />,
                    },
                    {
                        path: "purchase-add",
                        element: <AddCustomer />,
                    },
                    {
                        path: "purchase-edit/:purchaseId",
                        element: <EditCustomer />,
                    },
                    {
                        path: "ev-charger-list",
                        element: <EvChargerList />,
                    },
                    {
                        path: "ev-charger-details/:chargerId",
                        element: <EvChargerDetails />,
                    },
                    {
                        path: "ev-charger-booking-list",
                        element: <EvChargerBookingList />,
                    },
                    {
                        path: "ev-charger-booking-details/:chargerId",
                        element: <EvChargerBookingDetails />,
                    },
                    {
                        path: "ev-charger-add",
                        element: <AddEVCharger />,
                    },
                    {
                        path: "ev-charger-edit/:chargerId",
                        element: <EditEVCharger />,
                    },
                    {
                        path: "accessories-list",
                        element: <AccessoriesList />,
                    },
                    {
                        path: "accessories-details/:chargerId",
                        element: <AccessoriesDetails />,
                    },
                    {
                        path: "accessories-booking-list",
                        element: <AccessoriesBookingList />,
                    },
                    {
                        path: "accessories-booking-details/:chargerId",
                        element: <AccessoriesBookingDetails />,
                    },
                    {
                        path: "accessories-add",
                        element: <AddAccessory />,
                    },
                    {
                        path: "accessories-edit/:chargerId",
                        element: <EditAccessory />,
                    },
                    {
                        path: "charger-installation-list",
                        element: <ChargerInstallationList />,
                    },
                    {
                        path: "charger-installation-details/:requestId",
                        element: <ChargerInstallationDetails />,
                    },
                    {
                        path: "ev-charger-brand-list",
                        element: <EvChargerBrandList />,
                    },
                ],
            },
            {
                path: "charge-share",
                element: <ChargeShareListings/>,
                children: [
                    {
                        path: "charge-share-list",
                        element: <ChargeShareList/>,
                    },
                    {
                        path: "charge-share-details/:charger_id",
                        element: <ChargeShareDetails/>,
                    },
                    {
                        path: "add-charger-station",
                        element: <AddChargerStation />,
                    },
                    {
                        path: "charge-share-edit/:charger_id",
                        element: <EditChargeShare />,
                    },
                ],
            },
            //Offer
            {
                path: "offer",
                element: <Offer/>,
                children: [
                    {
                        path: "offer-list",
                        element: <OfferList />,
                    },
                    {
                        path: "offer-details/:offerId",
                        element: <OfferDetails />,
                    },
                    {
                        path: "add-offer",
                        element: <AddOffer />,
                    },
                    {
                        path: "edit-offer/:offerId",
                        element: <EditOffer />,
                    },
                ],
            },
            //Coupon
            {
                path: "coupon",
                element: <Coupon/>,
                children: [
                    {
                        path: "coupon-list",
                        element: <CouponList />,
                    },
                    {
                        path: "add-coupon",
                        element: <AddCoupon />,
                    },
                    {
                        path: "edit-coupon/:couponId",
                        element: <EditCoupon />,
                    },
                ],
            },
            // notification-list
            {
                path: "notification-list",
                element: <PlusxNotificationList />,
            },
            // profile
            {
                path: "profile",
                element: <Profile/>
            },
            {
                path: "ev-insurance",
                element: <EvInsurance/>,
                children: [
                    {
                        path: "ev-insurance-list",
                        element: <EvInsuranceList />,
                    },
                    
                    {
                        path: "ev-insurance-detail/:insurance_id",
                        element: <EvInsuranceDetail />,
                    },
                ],
            },
            
        ]
    },

    {
        path: "*",
        element: <Error />,
    },
]);

function Router() {
    return (
        <>
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </>
    );
}

export default Router;
