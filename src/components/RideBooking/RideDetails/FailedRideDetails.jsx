import { useEffect, useState } from 'react';
import styles from '../RideList/RideList.module.css';
import Appstyles from '../../AppSignUp/AppSignup.module.css';
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { statusMapping } from "../../../utils/statusMapping.js";
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from '../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards.jsx';
import DetailsInfoSection from '../../SharedComponent/Details/NewBookingDetails/DetailsInfoSection/DetailsInfoSection.jsx';
import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import date from "../../../assets/images/DateCard.svg";
import contact from "../../../assets/images/ContactCard.svg";
import profile from "../../../assets/images/ProfileCard.svg";
import mobile from "../../../assets/images/MobileCard.svg";
import city from "../../../assets/images/CityCard.svg";
import LockerModal from '../../SharedComponent/CustomModal/WalletModal.jsx';
import { toast, ToastContainer } from "react-toastify";

import "react-datepicker/dist/react-datepicker.css";
import InputMask from 'react-input-mask';

import moment from 'moment';

const FailedRideDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [manualform, setManualForm] = useState({ station_id: "" });
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [stationOption, setStationOption] = useState([]);
    const [loadingLocker, setLoadingLocker] = useState(false);
    const [lockerOption, setLockerOption] = useState([]);
    const [loadingStation, setLoadingStation] = useState(false);
    const [completeRideForm, setCompleteRideForm] = useState({
        end_time: "",
        comment: "",
        station_id: "",
        lock_number: ""
    });

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            booking_id: bookingId
        };
        postRequestWithToken('cycle-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
            }
            setLoading(false);
        });
    };
    const getStations = () => {
        const userObj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            cycle_id: "cycleId",
            latitude: bookingDetails?.cycle_booking.start_lat,
            longitude: bookingDetails?.cycle_booking.start_long,
        };
        setLoadingStation(true);
        postRequestWithToken('station-list-locker-assign', userObj, (response) => {
            if (response.code === 200) {
                const stationsList = (response?.data || []).map(item => ({
                    label: item.station_name,
                    value: item.station_id,
                    city_id: item.city_id
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
            userId: userDetails?.user_id,
            email: userDetails?.email,
            station_id: completeRideForm.station_id,
        };

        setLoadingLocker(true);

        postRequestWithToken(
            'available-locker-list',
            userObj,
            (response) => {

                if (response.code === 200) {

                    const lockerList =
                        response.data.map(item => ({

                            label: item.label,
                            value: item.value

                        }));

                    setLockerOption(lockerList);
                }

                setLoadingLocker(false);
            }
        )
    }
    useEffect(() => {

        if (completeRideForm.station_id) {
            getLockers();
        }

    }, [completeRideForm.station_id])
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, [bookingId]);

    useEffect(() => {
        if (bookingDetails?.cycle_booking) {
            getStations();
        }
    }, [bookingDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setCompleteRideForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    const headerItems = [
        { label: 'Date', icon: date, value: moment(bookingDetails?.cycle_booking.created_at).format('DD MMM YYYY') },
        { label: 'Booking ID', icon: contact, value: bookingDetails?.cycle_booking.booking_id },
        { label: 'Rider Name', icon: profile, value: bookingDetails?.cycle_booking.user_name },
        { label: 'Mobile No.', icon: mobile, value: `${bookingDetails?.cycle_booking.country_code ? bookingDetails?.cycle_booking.country_code : "+91"} ${bookingDetails?.cycle_booking.contact_no}` },
        { label: 'City', icon: city, value: bookingDetails?.cycle_booking.city },
    ];
    const userInfoSection = [
        { label: "Pick Up Station", value: bookingDetails?.cycle_booking.pickup_station },
        // { label: "Pick Up Time",    value: bookingDetails?.cycle_booking?.pick_time || "" },
        { label: "Cycle ID", value: bookingDetails?.cycle_booking.cycle_id },
        { label: "Status", value: statusMapping[`${bookingDetails?.cycle_booking.status}`] },
    ];


    const handleCompleteRide = () => {
        console.log("clicked");
        console.log(completeRideForm);
        if (!completeRideForm.end_time || !completeRideForm.station_id || !completeRideForm.lock_number) {
            toast("Please select ride end time", { type: "error" });
            return;
        }
    const pickTime = moment(
        bookingDetails?.cycle_booking?.pick_time,
        "hh:mm A"
            );

    const endTime = moment(
        completeRideForm.end_time,
        "hh:mm A"
            );

     if (endTime.isBefore(pickTime)) {
        toast("Ride end time cannot be earlier than ride start time", {
        type: "error"
        });
        return;
     }


        setIsLoading(true);

        const obj = {

            userId: userDetails?.user_id,
            email: userDetails?.email,
            booking_id: bookingId,

            end_time: completeRideForm.end_time,
            comment: completeRideForm.comment,

            station_id: completeRideForm.station_id,
            lock_number: completeRideForm.lock_number
        };
        console.log("API BODY", obj);

        postRequestWithToken('/incomplete-booking-by-admin', obj, (response) => {

            if (response.code === 200) {

                toast(response.message, { type: 'success' });

                setTimeout(() => {
                    navigate(
                    '/mobility/ride/ride-booking-list',
                    { replace:true }
                    );
                }, 1000);

            } else {
                toast(response.message, { type: 'error' });
            }

            setIsLoading(false);
        });
    };

    return (
        <div className='main-container'>
         <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    pauseOnHover
    theme="colored"
/>
            {loading ? <Loader /> :
                <>
                    <DetailsCards items={headerItems} />
                    <div className={styles.bookingDetailsSection}>
                        <DetailsInfoSection userInfoSection={userInfoSection} />

                        {/* <div className={styles.bookingHeading}>
                            { bookingDetails?.cycle_booking.status === "PNR" ? <button className={Appstyles.button} onClick={() => {openManualAdminModal(bookingId)}}> Stop Ride </button> :" " }
                        </div>  */}

                        <div className={styles.DetailsMainHeading}>Pending Ride</div>

                        <div className={styles.completeRideCard}>

                            <div className={styles.completeRideHeader}>
                                <div className={styles.completeIcon}>✓</div>
                                <p className={styles.subHeading}>Add ride end time to mark this ride as completed</p>
                            </div>

                            <div className={styles.completeRideBody}>

                                <div className={`row`}>
                                    <div className={`col-lg-6`}>

                                        <div className={`row`}>
                                            <div className={`col-xl-12 col-lg-12`}>
                                                <label className={styles.inputLabels}>Ride Start Time</label>
                                                <InputMask mask="99:99 aa" className={styles.inputCharger} placeholder="HH:MM AM" value={bookingDetails?.cycle_booking?.pick_time || ""}
                                                    readOnly />
                                                {/* {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>} */}
                                            </div>
                                        </div>

                                    </div>
                                    <div className={`col-lg-6`}>
                                        <div className={`row`}>
                                            <div className={`col-xl-12 col-lg-12`}>
                                                <label className={styles.inputLabels}>Ride End Time <span className={styles.textRed}>*</span></label>
                                                <InputMask mask="99:99 aa" name="end_time" className={styles.inputCharger} placeholder="HH:MM AM" value={completeRideForm.end_time} onChange={handleChange} />
                                                {/* {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                              <div className="row mt-3">

                                {/* Drop Station */}
                                <div className="col-lg-6">
                                    <label className={styles.inputLabels}>Drop Station <span className={styles.textRed}>*</span></label>
                                    <CustomDropdown
                                        options={stationOption}
                                        value={
                                            stationOption.find(item =>String(item.value) === String(completeRideForm.station_id))
                                        }
                                        onChange={(selected) =>handleChange({
                                                target: {
                                                    name: "station_id",
                                                    value: selected.value
                                                }
                                            })
                                        }
                                        placeholder="Select Station"
                                    />
                                </div>


                                {/* Lock Number */}
                                <div className="col-lg-6">
                                  <label className={styles.inputLabels}>Lock Number <span className={styles.textRed}>*</span>
                                </label>
                                    <CustomDropdown options={lockerOption}
                                        value={
                                            lockerOption.find(
                                                item =>
                                                    String(item.value) ===
                                                    String(completeRideForm.lock_number)
                                            )
                                        }
                                        onChange={(selected) =>
                                            handleChange({
                                                target: {
                                                    name: "lock_number",
                                                    value: selected.value
                                                }
                                            })
                                        }
                                        placeholder={
                                            completeRideForm.station_id
                                                ? "Select Lock"
                                                : "Select Station First"
                                        }

                                        isDisabled={!completeRideForm.station_id}
                                    />
                                </div>


                                </div>

                                <div className={styles.textareaGroup}>
                                    <div className={`row`}>
                                        <div className={`col-xl-12 col-lg-12`}>
                                            <label htmlFor="description" className={styles.inputLabels}>Comment (optional)</label>
                                            <div className={`row`}>
                                                <div className={`col-xl-12 col-lg-12`}>
                                                    <textarea id="description" name="comment" placeholder="e.g., Rider returned cycle late, station was closed at drop-off, manual closure after verification..." className={styles.inputField} rows="4"
                                                        value={completeRideForm.comment} onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.actionButtons}>
                                    <button className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
                                    <button className={styles.completeBtn} disabled={isLoading} onClick={handleCompleteRide} >
                                        {isLoading ? "Please wait..." : "Mark as Complete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
            {/* <LockerModal isOpen={isManualModalOpen} onClose={closeManualModal} fields={ManualAdminBookingFields} id={bookingId} formData={manualform} setForm={setManualForm} isLoading={isLoading} onSubmit={handleManaualSubmitModal} /> */}
        </div>
    )
}
export default FailedRideDetails;