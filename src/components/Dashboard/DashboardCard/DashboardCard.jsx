import style from "./DashboardCard.module.css";
import DashboardCardItem from "../../SharedComponent/DashboardCardItem/DashboardCardItem";
import { useSelector, useDispatch } from "react-redux";
import { setActiveCardIndex } from "../../../store/dashboardSlice";

// Card Images
import AppSignUpImage from "../../../assets/images/DashboardCardIcons/Total App Sign Up.svg";
import NoOfRides from "../../../assets/images/DashboardCardIcons/NoOfRide.svg";
import Stations from "../../../assets/images/DashboardCardIcons/TotalNoOfStation.svg";
import Support from "../../../assets/images/DashboardCardIcons/Support.svg";
import Customer from "../../../assets/images/DashboardCardIcons/download.svg";

// import ChargerInstallationImage from "../../../assets/images/DashboardCardIcons/Charger Installation.svg";
// import EVRiderClubImage from "../../../assets/images/DashboardCardIcons/EV Rider Club.svg";
// import EVSpecializedShopsImage from "../../../assets/images/DashboardCardIcons/EV Specialized Shops.svg";
// import ActiveOfferImage from "../../../assets/images/DashboardCardIcons/Total Active Offer.svg";
// import EVBuyAndSellImage from "../../../assets/images/DashboardCardIcons/Total EV Buy & Sell.svg";
// import EVDiscussionBoardImage from "../../../assets/images/DashboardCardIcons/Total EV Discussion Board.svg";
// import EVGuideImage from "../../../assets/images/DashboardCardIcons/Total EV Guide.svg";
// import EVInsuranceImage from "../../../assets/images/DashboardCardIcons/Total EV Insurance.svg";
// import EVPreSalesImage from "../../../assets/images/DashboardCardIcons/Total EV Pre-Sales Testing.svg";
// import EVRoadAssitanceImage from "../../../assets/images/DashboardCardIcons/Total EV Road Assitance.svg";
// import ElectricBikeLeasingImage from "../../../assets/images/DashboardCardIcons/Total Electric Bike Leasing.svg";
// import ElectricCarLeasingImage from "../../../assets/images/DashboardCardIcons/Total Electric Car Leasing.svg";
// import NoOfRegsDriverImage from "../../../assets/images/DashboardCardIcons/No of Regs Driver.svg";
// import PickAndDropImage from "../../../assets/images/DashboardCardIcons/Total Pick & Drop.svg";
// import PODBooking from "../../../assets/images/DashboardCardIcons/POD Booking.svg";
// import PublicChargersImage from "../../../assets/images/DashboardCardIcons/Total Public Chargers.svg";
// import TotalRegisterYourInterestImage from "../../../assets/images/DashboardCardIcons/Total Register Your Intrest.svg";
const DashboardCard = ({ details }) => {
    
    const dispatch = useDispatch();
    const activeCardIndex = useSelector((state) => state.dashboard.activeCardIndex);

    const handleCardClick = (index) => {
        dispatch(setActiveCardIndex(index));
    };
        console.log("Dashboard Details =>", details);

    const cardData = [
        {
            icon  : AppSignUpImage,
            count : details?.find((item) => item.module === "App Sign Up")?.count || 0,
            title : "App Sign Up",
            route : "/mobility/app-signup/app-signup-list",
        }, {
            icon  : Stations,
            count : details?.find((item) => item.module === "No Of Station")?.count || 0,
            title : "No. Of Stations",
            route : "/mobility/mobility-station/station-list",
        }, {
            icon  : NoOfRides,
            count : details?.find((item) => item.module === "On Going Rides")?.count || 0,
            title : "No. On Going Rides",
            route : "/mobility/ride/ride-booking-list",
        }, {
            icon  : NoOfRides,
            count : details?.find((item) => item.module === "Incomplete Booking")?.count || 0,
            title : "No. Incomplete Booking",
            route : "/mobility/ride/ride-incomplete-booking-list",
        }, 
         {
            icon  : Support,
            count : details?.find((item) => item.module === "No Of Support")?.count || 0,
            title : "No. Of Support Request",
            route : "/mobility/ride/support-request-list",
        }, 
         {
            icon  : Customer,
            count : details?.find((item) => item.module === "No Of Customer")?.count || 0,
            title : "No. Of Customer Request",
            route : "/mobility/ride/refund-requests-list",
        }, 
    ];
    return (
        <div className={style.dashboardCardItem}>
            {cardData.map((data, index) => (
                <DashboardCardItem
                    key={index}
                    icon={data.icon}
                    count={data.count}
                    title={data.title}
                    route={data.route}
                    isActive={activeCardIndex === index}
                    onClick={() => handleCardClick(index)}
                />
            ))}
        </div>
    );
};
export default DashboardCard;