import { useEffect, useState } from 'react';
import Appstyles from '../../AppSignUp/AppSignup.module.css';
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
import { toast ,ToastContainer } from "react-toastify";
import LockerModal from '../../SharedComponent/CustomModal/WalletModal.jsx';

// import StationCard from "../../../components/SharedComponent/Details/NewBookingDetails/StationCard/StationCard.jsx";

const RideDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { bookingId }                       = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [loading, setLoading]               = useState(false);

    // Param Code
    const [manualform, setManualForm]               = useState({  station_id: "" });
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [isLoading, setIsLoading]                 = useState(false);
    const [isModalOpen, setIsModalOpen]             = useState(false);
    const [stationOption, setStationOption]         = useState([]);
    const [loadingStation, setLoadingStation]       = useState(false);

    const [loadingLocker, setLoadingLocker] = useState(false);
    const [lockerOption, setLockerOption]   = useState([]);

    const getStations = () => {
        const userObj = {
            userId    : userDetails?.user_id,
            email     : userDetails?.email,
            cycle_id  : "cycleId",  
            latitude  : bookingDetails?.cycle_booking.start_lat,
            longitude : bookingDetails?.cycle_booking.start_long,
        };
        setLoadingStation(true);
        postRequestWithToken('station-list-locker-assign', userObj, (response) => {
            if (response.code === 200) {
                const stationsList = (response?.data || []).map(item => ({
                    label   : item.station_name,
                    value   : item.station_id,
                    city_id : item.city_id
                }));
                setStationOption(stationsList);
                setLoadingStation(false);
            } else {
                console.log('error in station-list-locker-assign API', response);
                setLoadingStation(false);
            }
        });
    };
    const getLockers = () => {
        const userObj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            station_id  : manualform.station_id?.value,
        };
        setLoadingLocker(true);
        postRequestWithToken('available-locker-list', userObj, (response) => {
            if (response.code === 200) {
                const LockerList = (response?.data || []).map(item => ({
                    label: item.label,
                    value: item.value,
                }));
                    setLockerOption(LockerList);
                    setLoadingLocker(false);
            } else {
                toast(response.message?.station_id, { type: 'error' });
                console.log('error in available-locker-list API', response);
                setLoadingLocker(false);
            }
        });
    };

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
        ...(bookingDetails?.cycle_booking?.rating
                ? [{
                    label: 'Rating',
                    icon: contact,
                    value: (
                        <div>
                            <div>
                                {`${"⭐".repeat(bookingDetails.cycle_booking.rating)} (${bookingDetails.cycle_booking.rating}/5)`}
                            </div>

                            {bookingDetails?.cycle_booking?.feedback_text && (
                                <div className={styles.feedbackTag}>
                                    {bookingDetails.cycle_booking.feedback_text.replaceAll(',', ', ')}
                                </div>
                            )}
                        </div>
                    )
                }]
                : [])
        ];


    const userInfoSection = [
        { label: "Pick Up Station",   value: bookingDetails?.cycle_booking.pickup_station},
        { label: "Drop off Station",  value: bookingDetails?.cycle_booking.dropoff_station },
        { label: "Cycle Type",        value: bookingDetails?.cycle_booking.cycle_type === "cycle"? "Cycle" : "E-cycle" },
        { label: "Cycle ID",          value: bookingDetails?.cycle_booking.cycle_id },
        { label: "Fare",              value:  bookingDetails?.cycle_booking.price ?`${bookingDetails?.cycle_booking.price} ${bookingDetails?.currency}  `:"" },
        { label: "Status",            value: statusMapping[`${bookingDetails?.cycle_booking.status}`] },
    ];
    const rideInfoSection = [
        { label: "Pick Up Time",            value: bookingDetails?.cycle_booking?.pick_time || "" },
        { label: "Dropping Time",           value:  bookingDetails?.cycle_booking?.drop_time || "" },
        // { label: "Handover Type",        value:  bookingDetails?.cycle_booking.handover_type ? bookingDetails?.cycle_booking.handover_type.charAt(0).toUpperCase() + bookingDetails.cycle_booking.handover_type.slice(1)  : "" },
        { label: "Handover Type",           value:  bookingDetails?.cycle_booking?.handover_type ? bookingDetails.cycle_booking.handover_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()): ""},
        
        { label: "Total Time",              value:  bookingDetails?.cycle_booking.time_taken? bookingDetails?.cycle_booking.time_taken+" MIN":"" },
        { label: "Hand Over Station",       value: bookingDetails?.cycle_booking.handover_station},
        { label: "Locker Number",           value: bookingDetails?.cycle_booking.lock_number},

    ];
    const ManualAdminBookingFields = [
        { 
            name        : "station_id", 
            type        : "dropdown", 
            placeholder : "Select Station", 
            fieldLabel  : "Stations",
            options     : stationOption, 
            loading     : loadingStation, 
            onOpen      : getStations, 
        }, { 
            name        : "lock_number", 
            type        : "dropdown", 
            placeholder : "Select Locker", 
            fieldLabel  : "Lock Number", 
            options     : lockerOption, 
            loading     : loadingLocker, 
            onOpen      : getLockers, 
        }
    ];
    const openManualAdminModal = (item) => {
        setManualForm({
            station_id : item.station_id || null,
            lock_number : item.lock_number || null,
        });
        setIsManualModalOpen(true);
    }
    const closeManualModal = () => {
        setIsManualModalOpen(false);
        setStationOption([]);
        setManualForm({ station_id: "", lock_number: ""});
    };
    const handleManaualSubmitModal = () => {
        setIsLoading(true);

        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : bookingId,
            station_id : manualform.station_id?.value,
            lock_number : manualform.lock_number?.value,
        };
        postRequestWithToken('/complete-booking-by-admin', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, { type: 'success' });
                setIsManualModalOpen(false);
                setTimeout(() => fetchDetails(), 1500);
            } else {
                toast(response.message, { type: 'error' });
                setIsManualModalOpen(false);
            }
            setIsLoading(false);
        });
    };

    return (
        <div className='main-container'>
            <ToastContainer />
            { loading ? <Loader /> : 
                <>
                    <DetailsCards items={headerItems} />
                    <div className={styles.bookingDetailsSection}>
                        <DetailsInfoSection userInfoSection={userInfoSection} rideInfoSection={rideInfoSection} />
                        <div className={styles.bookingHeading}>
                            { bookingDetails?.cycle_booking.status === "ON" ? <button className={Appstyles.button} onClick={() => {openManualAdminModal(bookingId)}}> Stop Ride </button> :" " }
                        </div> 
                    </div>
                </>
            }
            <LockerModal isOpen={isManualModalOpen} onClose={closeManualModal} fields={ManualAdminBookingFields} id={bookingId} formData={manualform} setForm={setManualForm} isLoading={isLoading} onSubmit={handleManaualSubmitModal} />
        </div>
    )
}
export default RideDetails;
