import { useState } from "react";
import {APIProvider, Map, AdvancedMarker,} from "@vis.gl/react-google-maps";
// import TruckIcon from "../../../../assets/images/pod and truck icon filled – 1.png";
import TruckIcon from "../../../../assets/images/pod and truck icon filled/Truck Filled Icon – 1.png";
import PodRedIcon from "../../../../assets/images/pod and truck icon filled/Pod Red Filled Icon – 2.png";
import PodGreenIcon from "../../../../assets/images/pod and truck icon filled/Pod Green Filled Icon – 3.png";
import PodYellowIcon from "../../../../assets/images/pod and truck icon filled/Pod Yellow Filled Icon – 1.png";
import Cancel from "../../../../assets/images/Cancel.svg";
import style from "./Map.module.css";

const center          = { lat: 21.74405, lng: 77.74839 };
const googleMapApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function MapComponent({ coordinates, location, podLocation }) {
  const mapId = "1";
  const defaultCenter                                     = { lat: 25.2048, lng: 55.2708 };
  const mapCenter                                         = coordinates?.lat && coordinates?.lng ? coordinates : center;
  const [hoveredLocationMarker, setHoveredLocationMarker] = useState(null);
  const [hoveredPodMarker, setHoveredPodMarker]           = useState(null);

  const handleDriverClick = (item) => {
    setHoveredLocationMarker(item); 
    setHoveredPodMarker(null); 
  };

  const handlePodClick = (item) => {
    setHoveredPodMarker(item); 
    setHoveredLocationMarker(null); 
  };


  return (
    <div className={style.map}>
      <div className={style.mapContainer}>
        <APIProvider apiKey={googleMapApiKey}>
          <Map
            defaultZoom={5}
            defaultCenter={center}
            mapId={mapId}
            className={style.mapResponsive}
          >
            {/* Single marker for the default center */}
            {!location?.length && <AdvancedMarker position={mapCenter} />}

            {/* Location markers */}
            {location?.map((item) => {
              const markerPosition = item.location?.lat && item.location?.lng
                ? item.location
                : defaultCenter;

              return (
                <AdvancedMarker
                  key={item.key}
                  position={markerPosition}
                  onClick={() => handleDriverClick(item)} 
                  className={style.makerSection}
                >
                  <img
                    src={TruckIcon}
                    alt="Truck Icon"
                    className={style.customIcon}
                    style={{ width: "60px", height: "60px" }}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Pod Location markers */}
            {podLocation?.map((item) => {
              const markerPosition = item.location?.lat && item.location?.lng
                ? item.location
                : defaultCenter;

              let podIcon;
              if (item.charging_status === 0) {
                podIcon = PodYellowIcon;
              } else if (item.charging_status === 1) {
                podIcon = PodGreenIcon;
              } else if (item.charging_status === 2) {
                podIcon = PodRedIcon;
              }

              return (
                <AdvancedMarker
                  key={item.podId}
                  position={markerPosition}
                  onClick={() => handlePodClick(item)} 
                  className={style.makerSection}
                >
                  <img
                    src={podIcon}
                    alt="Charger Installation Icon"
                    className={style.customIcon}
                    style={{ width: "40px", height: "40px" }}
                  />
                </AdvancedMarker>
              );
            })}

            {/* Tooltip for hovered location marker */}
            {hoveredLocationMarker && (
              <div className={style.hoverTooltip}>
                <img
                  src={Cancel}
                  alt="Close"
                  className={style.closeIcon}
                  onClick={() => setHoveredLocationMarker(null)}
                />
                <p>Driver ID: {hoveredLocationMarker.rsaId}</p>
                <p>Driver Name: {hoveredLocationMarker.rsaName}</p>
                <p>Mobile No: {hoveredLocationMarker.countryCode} {hoveredLocationMarker.mobile}</p>
                {/* <p>Status: {
                  hoveredLocationMarker.status === 0 ? 'Inactive' :
                  hoveredLocationMarker.status === 1 ? 'Un-Available' :
                  hoveredLocationMarker.status === 2 ? 'Available' :
                  'Unknown'
                }</p> */}
              </div>
            )}

            {/* Tooltip for hovered pod marker */}
            {hoveredPodMarker && (
              <div className={style.hoverTooltip}>
                <img
                  src={Cancel}
                  alt="Close"
                  className={style.closeIcon}
                  onClick={() => setHoveredPodMarker(null)}
                />
                <p>POD ID: {hoveredPodMarker.podId}</p>
                <p>Device ID: {hoveredPodMarker.deviceId}</p>
                <p>POD Name: {hoveredPodMarker.podName}</p>
                <p>Status: {
                  hoveredPodMarker.charging_status === 0 ? 'Available' :
                  hoveredPodMarker.charging_status === 1 ? 'In Use' :
                  hoveredPodMarker.charging_status === 2 ? 'Used' :
                  'Unknown'
                }</p>
              </div>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}

export default MapComponent;
