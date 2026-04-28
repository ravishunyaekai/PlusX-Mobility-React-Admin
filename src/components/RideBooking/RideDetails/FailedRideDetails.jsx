import { useEffect, useState } from 'react';
import styles from '../RideList/RideList.module.css';
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { statusMapping } from "../../../utils/statusMapping.js";
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from '../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards.jsx';
import DetailsInfoSection from '../../SharedComponent/Details/NewBookingDetails/DetailsInfoSection/DetailsInfoSection.jsx';

import date from "../../../assets/images/DateCard.svg";
import contact from "../../../assets/images/ContactCard.svg";
import profile from "../../../assets/images/ProfileCard.svg";
import mobile from "../../../assets/images/MobileCard.svg";
import city from "../../../assets/images/CityCard.svg";
import moment from 'moment';
 
const FailedRideDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { bookingId }                       = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [loading, setLoading]               = useState(false);

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : bookingId
        };
        postRequestWithToken('cycle-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
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
    }, [bookingId]);

    const headerItems = [
        { label: 'Date',        icon: date,     value: moment(bookingDetails?.cycle_booking.created_at).format('DD MMM YYYY') },
        { label: 'Booking ID',  icon: contact,  value: bookingDetails?.cycle_booking.booking_id },
        { label: 'Rider Name',  icon: profile,  value: bookingDetails?.cycle_booking.user_name },
        { label: 'Mobile No.',  icon: mobile,   value: `${bookingDetails?.cycle_booking.country_code ?bookingDetails?.cycle_booking.country_code :"+91"} ${bookingDetails?.cycle_booking.contact_no}` },
        { label: 'City',        icon: city,     value: bookingDetails?.cycle_booking.city },
    ];
    const userInfoSection = [
        { label: "Pick Up Station", value: bookingDetails?.cycle_booking.pickup_station},
        { label: "Cycle ID",        value: bookingDetails?.cycle_booking.cycle_id },
        { label: "Status",          value: statusMapping[`${bookingDetails?.cycle_booking.status}`] },
    ];
    
    return (
        <div className='main-container'>
            { loading ? <Loader /> : 
                <>
                    <DetailsCards items={headerItems} />
                    <div className={styles.bookingDetailsSection}>
                        <DetailsInfoSection userInfoSection={userInfoSection}  />
                    </div>
                </>
            }
        </div>
    )
}
export default FailedRideDetails;
