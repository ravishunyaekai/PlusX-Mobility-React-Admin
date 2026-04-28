import { useEffect, useState } from 'react';
// import Appstyles from '../../AppSignUp/AppSignup.module.css';
import styles from '../RideList/RideList.module.css';
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import { statusMapping } from "../../../utils/statusMapping.js";
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from '../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards.jsx';
import DetailsInfoSection from '../../SharedComponent/Details/NewBookingDetails/DetailsInfoSection/DetailsInfoSection.jsx';

import date from "../../../assets/images/DateCard.svg";
import contact from "../../../assets/images/ContactCard.svg";
import profile from "../../../assets/images/ProfileCard.svg";
import mobile from "../../../assets/images/MobileCard.svg";
import city from "../../../assets/images/CityCard.svg";
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
// import WalletModal from '../../SharedComponent/CustomModal/WalletModal.jsx';

// Comment Rrelated code 
import AddComment from '../../SharedComponent/Details/NewBookingDetails/AddComment/AddComment.jsx';
import LockerModal from '../../SharedComponent/CustomModal/LockerModal.jsx';

const supportStatus = {
    1: "Open",
    2: "In Progress",
    3: "Resolved"
};

const RideDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { bookingId }                       = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [loading, setLoading]               = useState(false);

    // Param Code
    const [isLoading, setIsLoading]     = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // comment related code
    const [form, setForm]         = useState({ status: null });
    const [comments, setComments] = useState([]); 

    const obj = {
        userId     : userDetails?.user_id,
        email      : userDetails?.email,
        booking_id : bookingId
    };

    const fetchDetails = () => {
        setLoading(true);
        postRequestWithToken('issue-cycle-booking-detail', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
            }
        });
        setLoading(false);
    };
    const fetchComments = () => {
        setLoading(true);
        postRequestWithToken('issue-comments-list', obj, (response) => {
            if (response.code === 200) {
                setComments(response?.data || {});
            }
        });
        setLoading(false);
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
        fetchComments();
    }, [bookingId]);

    const headerItems = [
        { label: 'Date',        icon: date,     value: moment(bookingDetails?.cycle_booking.created_at).format('DD MMM YYYY') },
        { label: 'Booking ID',  icon: contact,  value: bookingDetails?.cycle_booking.booking_id },
        { label: 'Rider Name',  icon: profile,  value: bookingDetails?.cycle_booking.user_name },
        { label: 'Mobile No.',  icon: mobile,   value: `${bookingDetails?.cycle_booking.country_code ?bookingDetails?.cycle_booking.country_code :"+91"} ${bookingDetails?.cycle_booking.contact_no}` },
        { label: 'City',        icon: city,     value: bookingDetails?.cycle_booking.city },
    ];

    const userInfoSection = [
        { label: "Pick Up Station",   value: bookingDetails?.cycle_booking.pickup_station},
        { label: "Drop off Station",  value: bookingDetails?.cycle_booking.dropoff_station },
        { label: "Cycle Type",        value: bookingDetails?.cycle_booking.cycle_type === "cycle"? "Cycle" : "E-cycle" },
        { label: "Cycle ID",          value: bookingDetails?.cycle_booking.cycle_id },
        { label: "Fare",              value:  bookingDetails?.cycle_booking.price ?`${bookingDetails?.cycle_booking.price} ${bookingDetails?.currency}  `:"" },
        { label: "Status",            value: supportStatus[`${bookingDetails?.cycle_booking.status}`] },
    ];
    const rideInfoSection = [
        { label: "Pick Up Time",            value: bookingDetails?.cycle_booking?.pick_time || "" },
        { label: "Dropping Time",           value:  bookingDetails?.cycle_booking?.drop_time || "" },
        { label: "Handover Type",              value:  bookingDetails?.cycle_booking?.handover_type ? bookingDetails.cycle_booking.handover_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()): ""},
        
        { label: "Total Time",                 value:  bookingDetails?.cycle_booking.time_taken? bookingDetails?.cycle_booking.time_taken+" MIN":"" },
        { label: "Hand Over Station",  value: bookingDetails?.cycle_booking.handover_station},
        // { label: "Issue Details",  value: bookingDetails?.cycle_booking.issue_text},
    ];
    
    const statusOptions = [
        {
            label: "Open",
            value: "1",
            color: "#f59e0b",
            // description: "Newly raised, awaiting action",
        }, {
            label: "In Progress",
            value: "2",
            color: "#3b82f6",
            // description: "Support team is working on it",
        }, {
            label: "Resolved",
            value: "3",
            color: "#22c55e",
            // description: "Issue has been fixed",
        },
    ];
    const statusFields = [
        {
            name: "status",
            type: "status",
            fieldLabel: "Change Status",
            options: statusOptions,
        },
    ];
    const handleAddComment = (text) => {

        const payload = {
            ...obj,
            comment: text,
        };
        postRequestWithToken("issue-comments-add", payload, (response) => {
            if (response.status === 1) {
                toast.success(response.message || response.message[0])
                setTimeout(() => {
                    setLoading(false);
                    fetchComments();
                }, 1000);
            } else {
                toast.error(response.message || response.message[0])
                console.log('Error in add-station API:', response);
                setLoading(false);
            }
        });
    };
    const openModal = (item) => {
        setLoading(false);
        setForm({
            status: bookingDetails?.cycle_booking.status,
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
 
    const handleSubmitModal = () => {
        setIsLoading(true);
        const payload = {
            ...obj,
            status: form.status,
        };
        postRequestWithToken("issue-status-update", payload, (response) => {
            setIsLoading(false);
            if (response.status === 1) {
                toast.success(response.message || response.message[0])
                setTimeout(() => {
                    closeModal();
                    fetchDetails();
                    // fetchComments();
                }, 2000);
            } else {
                toast.error(response.message || response.message[0])
                console.log('Error in add-station API:', response);
            }
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
                        <div className='w-100'>
                            <h6 className={styles.issueHeading}>Issue Details : </h6>
                            {/* <span className={styles.issueDetails}>{bookingDetails?.cycle_booking.issue_text}</span> */}
                            <p className={styles.issueDetails}>{bookingDetails?.cycle_booking.issue_text}</p>
                        </div> 
                    </div>
                    <div className={styles.bookingDetailsSection}>
                        <AddComment comments={comments} onAddComment={handleAddComment} openModal={openModal}/>
                    </div>
                </>
            }
            <LockerModal 
                isOpen    = {isModalOpen} 
                onClose   = {closeModal} 
                fields    = {statusFields} 
                id        = {`Booking ID : ${bookingId}`} 
                formData  = {form} 
                setForm   = {setForm} 
                isLoading = {isLoading} 
                onSubmit  = {handleSubmitModal} 
            />
        </div>
    )
}
export default RideDetails;
