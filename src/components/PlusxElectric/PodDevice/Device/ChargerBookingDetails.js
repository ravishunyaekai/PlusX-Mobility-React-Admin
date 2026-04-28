import { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingDetailsSection from '../../../SharedComponent/Details/BookingDetails/BookingDetailsSection'
import BookingLeftDetails from '../../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import BookingDetailsAccordion from '../../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const statusMapping = {
    'CNF': 'Booking Confirmed',
    'A': 'Assigned',
    'ER': 'Enroute',
    'RL': 'POD Reached at Location',
    'CS': 'Charging Started',
    'CC': 'Charging Completed',
    'PU': 'POD Picked Up',
    'VP': 'Vehicle Pickup',
    'RS': 'Reached Charging Spot',
    'WC': 'Work Completed',
    'DO': 'Drop Off',
    'C': 'Cancel',
};

const ChargerBookingDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate()
    const { bookingId } = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    const [history, setHistory] = useState([])

    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            booking_id: bookingId
        };
        postRequestWithToken('charger-booking-details', obj, (response) => {
            // console.log(response?.data?.bookingHistory)
            if (response.code === 200) {
                setBookingDetails(response?.data?.booking || {});
                setHistory(response?.data?.history)
            } else {
                console.log('error in rider-details API', response);
            }
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
        bookingIdTitle: "Booking ID",
        customerDetailsTitle: "Customer Details",
        driverDetailsTitle: "Driver Details",
    };
    const sectionTitles1 = {
        bookingStatus: "Booking Status",
        price: "Price",
        serviceName: "Service Name",
        // vehicle        : "Vehicle",
        // serviceType    : "Service Type",
        // serviceFeature : "Service Feature",


        // address        : "Address",
        // slotDate       : "Slot Date",
        // slotTime       : "Slot Time"
    }
    const sectionTitles2 = {
        vehicle: "Vehicle",
        serviceType: "Service Type",
        serviceFeature: "Service Feature",
    }
    const sectionTitles3 = {
        address: "Address",
        slotDate: "Slot Date",
        slotTime: "Slot Time"
    }
    let rsa_data = bookingDetails?.rsa_data.split(",") || [];
    const content = {
        bookingId: bookingDetails?.booking_id,
        createdAt: moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName: bookingDetails?.user_name,
        customerContact: `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
        driverName: rsa_data ? rsa_data[0] : '',
        driverContact: rsa_data ? rsa_data[1] : '',
        // invoice         : bookingDetails?.invoice_url,
        imageUrl: bookingDetails?.imageUrl,
    };
    const sectionContent1 = {
        bookingStatus: statusMapping[bookingDetails?.status] || bookingDetails?.status,
        serviceName: bookingDetails?.service_name,
        price: bookingDetails?.service_price,
        // vehicle        : bookingDetails?.vehicle_data,
        // serviceType    : bookingDetails?.service_type,
        // serviceFeature : bookingDetails?.service_feature,

        // address        : bookingDetails?.address,
        // slotDate       : moment(bookingDetails?.slot_date).format('DD MMM YYYY'),
        // slotTime       : bookingDetails?.slot_time
    }
    const sectionContent2 = {
        vehicle: bookingDetails?.vehicle_data,
        serviceType: bookingDetails?.service_type,
        serviceFeature: bookingDetails?.service_feature,
    }
    const sectionContent3 = {
        address: bookingDetails?.address,
        slotDate: moment(bookingDetails?.slot_date).format('DD MMM YYYY'),
        slotTime: bookingDetails?.slot_time
    }
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1}
                type='portableChargerBooking'
            />
            <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                    sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
                    sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
                    type='portableChargerBooking' />
                <BookingDetailsAccordion history={history} rsa={content} />
            </div>
        </div>
    )
}

export default ChargerBookingDetails