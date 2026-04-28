import { useState } from "react";
import {APIProvider, Map, AdvancedMarker,} from "@vis.gl/react-google-maps";
import style from "./Map.module.css";
import { statusMapping } from "../../../utils/statusMapping";
import Cancel from "../../../assets/images/Cancel.svg";
import cycleIcon from "../../../assets/images/pod and truck icon filled/CycleIcon.png";
// import TruckIcon from "../../../assets/images/pod and truck icon filled/Truck Filled Icon – 1.png";
// import PodRedIcon from "../../../assets/images/pod and truck icon filled/Pod Red Filled Icon – 2.png";
// import PodGreenIcon from "../../../assets/images/pod and truck icon filled/Pod Green Filled Icon – 3.png";
// import PodYellowIcon from "../../../assets/images/pod and truck icon filled/Pod Yellow Filled Icon – 1.png";

const center          = { lat: 21.74405, lng: 77.74839 };
const googleMapApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function MapComponent({ coordinates, location, podLocation }) {
  const mapId = "1";
  const defaultCenter                                     = { lat: 21.74405, lng: 77.74839 };
  const mapCenter                                         = coordinates?.lat && coordinates?.lng ? coordinates : center;
  const [hoveredLocationMarker, setHoveredLocationMarker] = useState(null);
  // const [hoveredPodMarker, setHoveredPodMarker]           = useState(null);

  const handleDriverClick = (item) => {
    setHoveredLocationMarker(item); 
    // setHoveredPodMarker(null); 
  };

  // const handlePodClick = (item) => {
  //   setHoveredPodMarker(item); 
  //   setHoveredLocationMarker(null); 
  // };

  return (
    <div className={style.map}>
      <div className={style.mapContainer}>
        <APIProvider apiKey={googleMapApiKey}>
          <Map defaultZoom={5} defaultCenter={center} mapId={mapId} className={style.mapResponsive}>
            {/* location Marker for the default center */}
            {!location?.length && <AdvancedMarker position={mapCenter} />}

            {/* On Going Cycle Location markers */}
            {location?.map((item) => {
              const markerPosition = item.location?.lat && item.location?.lng ? item.location : defaultCenter;
              return (
                <AdvancedMarker key={item.key} position={markerPosition} onClick={() => handleDriverClick(item)} className={style.makerSection} >
                  <img src={cycleIcon} alt="cycle Icon" className={style.customIcon} style={{ width: "40px", height: "25px" }} />
                </AdvancedMarker>
              );
            })}

            {/* Tooltip for hovered On Going Cycle location marker */}
            {hoveredLocationMarker && (
              <div className={style.hoverTooltip}>
                <img src={Cancel} alt="Close" className={style.closeIcon} onClick={() => setHoveredLocationMarker(null)} />
                <p>Rider ID: {hoveredLocationMarker.rider_id}</p>
                 <p>Booking ID: {hoveredLocationMarker.booking_id}</p>
                <p>Rider Name: {hoveredLocationMarker.rider_name}</p>
                <p>Mobile No: {hoveredLocationMarker.countryCode} {hoveredLocationMarker.mobile}</p>
                <p>Status: { statusMapping[hoveredLocationMarker?.status]}</p>
              </div>
            )}
            
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}

export default MapComponent;
// {/* Pod Location markers */}
// {podLocation?.map((item) => {
//   const markerPosition = item.location?.lat && item.location?.lng
//     ? item.location
//     : defaultCenter;

//   let podIcon;
//   if (item.charging_status === 0) {
//     podIcon = PodYellowIcon;
//   } else if (item.charging_status === 1) {
//     podIcon = PodGreenIcon;
//   } else if (item.charging_status === 2) {
//     podIcon = PodRedIcon;
//   }

//   return (
//     <AdvancedMarker
//       key={item.podId}
//       position={markerPosition}
//       onClick={() => handlePodClick(item)} 
//       className={style.makerSection}
//     >
//       <img
//         src={podIcon}
//         alt="Charger Installation Icon"
//         className={style.customIcon}
//         style={{ width: "40px", height: "40px" }}
//       />
//     </AdvancedMarker>
//   );
// })}

// Tooltip for hovered pod marker
// {hoveredPodMarker && (
//   <div className={style.hoverTooltip}>
//     <img src={Cancel} alt="Close" className={style.closeIcon} onClick={() => setHoveredPodMarker(null)} />
//     <p>POD ID: {hoveredPodMarker.podId}</p>
//     <p>Device ID: {hoveredPodMarker.deviceId}</p>
//     <p>POD Name: {hoveredPodMarker.podName}</p>
//     <p>Status: {
//       hoveredPodMarker.charging_status === 0 ? 'Available' :
//       hoveredPodMarker.charging_status === 1 ? 'In Use' :
//       hoveredPodMarker.charging_status === 2 ? 'Used' :
//       'Unknown'
//     }</p>
//   </div>
// )}