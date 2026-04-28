import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './emergency.module.css';

import EmergencyCards from './EmergencyCards';
import EmergencyList from './EmergencyList';
import DriverLocationList from './DriverLocationList';
import NewMapComponent from '../../Dashboard/Map/NewMap';
import { postRequestWithToken } from '../../../../api/Requests'; 
import Loader from '../../../SharedComponent/Loader/Loader';

const Details = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                              = useNavigate();
    const {rsaId}                               = useParams();
    const [details, setDetails]                 = useState();
    // const [history, setHistory]                 = useState([]);
    const [loading, setLoading]                 = useState(false);
    const [baseUrl, setBaseUrl]                 = useState();
    const [coordinates, setCoordinates]         = useState({ lat: 25.2048, lng: 55.2708 });
    // const [locationHistory, setLocationHistory] = useState([]);
    
    const fetchDetails = () => {
         setLoading(true);
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
            rsa_id : rsaId
        };
        postRequestWithToken('rsa-data', obj, (response) => {
            if (response.code === 200) {
                setDetails(response?.rsaData || {});  
                setBaseUrl(response?.base_url);
                // setHistory(response?.bookingHistory || {});
                // setLocationHistory(response?.locationHistory)
                const lat = parseFloat(response?.rsaData?.latitude)
                const lng = parseFloat(response?.rsaData?.longitude) 
                if (!isNaN(lat) && !isNaN(lng)) {
                    setCoordinates({ lat, lng });
                }
            } else {
                console.log('error in rider-details API', response);
            }
            setLoading(false);
        });
    };
  
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchDetails();
    }, []);

    return (
        <div className='main-container'>
            { loading ? <Loader /> : 
                <>
                    <EmergencyCards details = {details} baseUrl={baseUrl}/>
                    <div className={`col-12`} style={{padding:'20px',}}>
                        <NewMapComponent className={styles.mapContainer} coordinates={coordinates}/>
                    </div>
                    { details?.booking_type && 
                        <EmergencyList rsaId= {rsaId} bookingType= {details?.booking_type}/>
                    }
                    <DriverLocationList rsaId= {rsaId} />
                </>
            }
        </div>
    );
}
export default Details;