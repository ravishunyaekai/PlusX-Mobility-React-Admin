import { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import styles from './chargerinstallation.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
import Loader from '../../SharedComponent/Loader/Loader.jsx';

const statusMapping = {
    'P': 'Placed',
    'CNF': 'Booking Confirmed',
    'A': 'Assigned',
    'RL': 'POD Reached at Location',
    'CS': 'Charging Started',
    'CC': 'Charging Completed',
    'PU': 'POD Picked Up',
    'WC': 'Work Completed',
    'C': 'Cancel'
};

const ChargerInstallationDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { requestId }                       = useParams();
    const navigate                            = useNavigate();
    const [bookingDetails, setBookingDetails] = useState();
    const [loading, setLoading]               = useState(false);
    const [history, setHistory]               = useState([]);
    

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            request_id : requestId,
            booking_type:"CIS"
        };
        postRequestWithToken('charger-installation-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.service_data || {});
                setHistory(response?.order_history)
            } else {
                console.log('error in charger-installation-details API', response);
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

    const headerTitles = {
        bookingIdTitle       : "Booking ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : bookingDetails?.request_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.name,
        customerContact : `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
        // driverName      : bookingDetails?.driver?.rsa_name,
        // driverContact   : `${bookingDetails?.driver?.country_code} ${bookingDetails?.driver?.mobile}`,
    };
    const sectionTitles1 = {
        customerEmail : "Customer Email",
        bookingStatus : "Satus",
        residentType  : "To Be Used For",
        looking_for   : "Looking For",
        address       : "Address",
    }
    const sectionContent1 = {
        customerEmail : bookingDetails?.email,
        bookingStatus : statusMapping[bookingDetails?.order_status] || bookingDetails?.order_status,
        residentType  : bookingDetails?.resident_type,
        looking_for   : bookingDetails?.looking_for,
        address       : (
            <a
                href    = {`https://www.google.com/maps?q=${bookingDetails?.latitude},${bookingDetails?.longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {bookingDetails?.address || 'View on Map'}
            </a>
        ),
    }
    const sectionTitles4 = {
        description : "Description",
    }
    
    const sectionContent4 = {
        description: bookingDetails?.description,
    }

    return (
        <div className='main-container'>
            { loading ? <Loader /> : 
                <>
                    <BookingDetailsHeader content={content} titles={headerTitles} type='chargerInstallation' />
                    <div className={styles.bookingLeftContainer}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} 
                        sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
                        type='chargerInstallation' />
                        <BookingDetailsAccordion history={history} />
                    </div>
                </>
            }
        </div>
    )
}
export default ChargerInstallationDetails;
