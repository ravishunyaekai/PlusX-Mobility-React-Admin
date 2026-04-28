import style from "./DashboardCard.module.css";
import DashboardCardItem from "../../../SharedComponent/DashboardCardItem/DashboardCardItem";
import { useSelector, useDispatch } from "react-redux";
import { setActiveCardIndex } from "../../../../store/dashboardSlice";

// Card Images
import HomeCharging from "../../../../assets/images/DashboardCardIcons/HomeChargerBooking.svg";
import ChargerInstallationImage from "../../../../assets/images/DashboardCardIcons/Charger Installation.svg";
import EVRoadAssitanceImage from "../../../../assets/images/DashboardCardIcons/Total EV Road Assitance.svg";
import EVChargerBooking from "../../../../assets/images/DashboardCardIcons/EVChargersBooking.svg";
import EVAccessoriesBooking from "../../../../assets/images/DashboardCardIcons/EVAccessoriesBooking.svg";
import NoOfRegsDriverImage from "../../../../assets/images/DashboardCardIcons/No of Regs Driver.svg";
// import AppSignUpImage from "../../../../assets/images/DashboardCardIcons/Total App Sign Up.svg";
// import EVRiderClubImage from "../../../../assets/images/DashboardCardIcons/EV Rider Club.svg";
// import EVSpecializedShopsImage from "../../../../assets/images/DashboardCardIcons/EV Specialized Shops.svg";
// import ActiveOfferImage from "../../../../assets/images/DashboardCardIcons/Total Active Offer.svg";
// import EVBuyAndSellImage from "../../../../assets/images/DashboardCardIcons/Total EV Buy & Sell.svg";
// import EVDiscussionBoardImage from "../../../../assets/images/DashboardCardIcons/Total EV Discussion Board.svg";
// import EVGuideImage from "../../../../assets/images/DashboardCardIcons/Total EV Guide.svg";
// import EVInsuranceImage from "../../../../assets/images/DashboardCardIcons/Total EV Insurance.svg";
// import EVPreSalesImage from "../../../../assets/images/DashboardCardIcons/Total EV Pre-Sales Testing.svg";
// import ElectricBikeLeasingImage from "../../../../assets/images/DashboardCardIcons/Total Electric Bike Leasing.svg";
// import PickAndDropImage from "../../../../assets/images/DashboardCardIcons/Total Pick & Drop.svg";
// import ElectricCarLeasingImage from "../../../../assets/images/DashboardCardIcons/Total Electric Car Leasing.svg";
// import PODBooking from "../../../../assets/images/DashboardCardIcons/POD Booking.svg";
// import PublicChargersImage from "../../../../assets/images/DashboardCardIcons/Total Public Chargers.svg";
// import TotalRegisterYourInterestImage from "../../../../assets/images/DashboardCardIcons/Total Register Your Intrest.svg";

const DashboardCard = ({ details }) => {
  const dispatch = useDispatch();
  const activeCardIndex = useSelector((state) => state.dashboard.activeCardIndex);

  const handleCardClick = (index) => {
    dispatch(setActiveCardIndex(index));
  };

  const cardData = [
    {
      icon  : HomeCharging,
      count : details?.find((item) => item.module === "Home Charging Bookings")?.count || 0,
      title : "Home Charging Bookings",
      route : "/electric/home-charger/charger-booking-list",
    },
    {
      icon  : EVRoadAssitanceImage,
      count : details?.find((item) => item.module === "EV Road Assistance")?.count || 0,
      title : "EV Roadside Assistance Bookings",
      route : "/electric/ev-road-assistance/booking-list",
    },
    {
      icon  : ChargerInstallationImage,
      count : details?.find((item) => item.module === "Charger Installation Bookings")?.count || 0,
      title : "Charger Installation Bookings",
      route : "/electric/charger-installation/charger-installation-list",
    },
    {
      icon  : ChargerInstallationImage,
      count : details?.find((item) => item.module === "Charge Share")?.count || 0,
      title : "Charge Share",
      route : "/electric/charge-share/charge-share-list",
    },
    {
      icon  : EVChargerBooking,
      count : details?.find((item) => item.module === "EV Chargers Booking")?.count || 0,
      title : "EV Chargers Bookings",
      route : "/electric/charger-installation/ev-charger-booking-list",
    }
    ,
    {
      icon  : EVAccessoriesBooking,
      count : details?.find((item) => item.module === "EV Accessories Booking")?.count || 0,
      title : "EV Accessories Bookings",
      route : "/electric/charger-installation/accessories-booking-list",
    },
    {
      icon  : NoOfRegsDriverImage,
      count : details?.find((item) => item.module === "No. of Regs. Drivers")?.count || 0,
      title : "Active Drivers",
      route : "/electric/drivers/driver-list",
    }
    
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
