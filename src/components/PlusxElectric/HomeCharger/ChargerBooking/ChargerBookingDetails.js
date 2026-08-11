import React, { useEffect, useState } from 'react';
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
import Loader from '../../../SharedComponent/Loader/Loader.jsx';

const statusMapping = {
    'PNR' : 'Payment Not Received',
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'ER' : 'Enroute',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC' : 'Charging Completed',
    'PU' : 'POD Picked Up',
    'VP' : 'Vehicle Pickup',
    'RS' : 'Reached Charging Spot',
    'WC' : 'Work Completed',
    'DO' : 'Drop Off',
    'C'  : 'Cancel',
    'RO' : 'POD Reached at Office',
    'RSB' : 'Rescheduled Booking'
};

const ChargerBookingDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { bookingId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    const [history, setHistory]               = useState([])
    const [feedBack, setFeedBack]             = useState()
    const [loading, setLoading]               = useState(false);

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : bookingId
        };
        postRequestWithToken('charger-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data?.booking || {});
                setHistory(response?.data?.history); 
                console.log("feedback",response?.data?.feedBack)
                setFeedBack(response?.data?.feedBack);
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
    }, [bookingId]);

    const headerTitles = {
        bookingIdTitle: "Booking ID",
        customerDetailsTitle: "Customer Details",
        driverDetailsTitle: "Driver Details",
        packageDetailsTitle: "Package Details",
    };
    let rsa_data = (bookingDetails?.rsa_data != null) ? bookingDetails?.rsa_data.split(",") : [];
    const content = {
        bookingId: bookingDetails?.booking_id,
        customerId: bookingDetails?.rider_id,
        createdAt: moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName: bookingDetails?.user_name,
        customerContact: `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
        driverName: rsa_data ? rsa_data[0] : '',
        driverContact: rsa_data ? rsa_data[1] : '',
        imageUrl: bookingDetails?.imageUrl,
        podId: bookingDetails?.pod_id,
        podName: bookingDetails?.pod_name,
        custBookingCount: bookingDetails?.cust_booking_count || 0,
        packageName: bookingDetails?.package_data?.package_name,
        packageId: bookingDetails?.package_data?.package_id,
        chargingFee: `₹ ${bookingDetails?.package_data?.charging_fee}`,
        chargingCapacity: `${bookingDetails?.package_data?.charging_capacity}`,
        pricePerUnit: `₹ ${bookingDetails?.package_data?.price_per_unit}`,
        serviceFee: `₹ ${bookingDetails?.package_data?.service_fee}`,
    };
    const sectionTitles1 = {
        bookingStatus: "Booking Status",
        // serviceName: "Service Name",
        price: "Price",
        slotDate: "Slot Date",
        slotTime: "Slot Time",
        // serviceName: "Service Name",
        current_percent: "Vehicle Battery %",
        vehicle: "Vehicle",
        parkingNumber: "Parking No.",
        parkingFloor: "Parking Floor",
        address: "Address",
    }
    const sectionContent1 = {
        bookingStatus: statusMapping[bookingDetails?.status] || bookingDetails?.status,
        // serviceName: bookingDetails?.service_name,
        // serviceType: bookingDetails?.service_type,
        price: bookingDetails?.service_price ? `${(bookingDetails?.service_price)} INR` : '0 INR',
        slotDate: moment(bookingDetails?.slot_date).format('DD MMM YYYY'),
        slotTime: moment(bookingDetails?.slot_time, 'HH:mm:ss').format('h:mm A'),
        vehicle: bookingDetails?.vehicle_data,
        current_percent: bookingDetails?.current_percent > 0 ? "More than 5%" : "0",
        parkingNumber: bookingDetails?.parking_number,
        parkingFloor: bookingDetails?.parking_floor,
        address: (
            <a
                href={`https://www.google.com/maps?q=${bookingDetails?.latitude},${bookingDetails?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className='linkSection'
            >
                {bookingDetails?.address || 'View on Map'}
            </a>
        ),
    }
    const sectionTitles2 = {
        // serviceType: "Service Type",
        // serviceFeature : "Service Feature",
    }
    const sectionContent2 = {
        // serviceType: bookingDetails?.service_type,
        // serviceFeature :  bookingDetails?.service_feature?.replace(/AED\s*/i, '')  ?.replace(/\b30\b/, '30 INR'),
    }
    const sectionTitles3 = {
        // slotDate: "Slot Date",
        // slotTime: "Slot Time",
        // are           : "Area Name",
        // current_percent: "Vehicle Battery %"
    }
    const sectionContent3 = {

        // address: bookingDetails?.address
        // slotDate: moment(bookingDetails?.slot_date).format('DD MMM YYYY'),
        // slotTime: moment(bookingDetails?.slot_time, 'HH:mm:ss').format('h:mm A'),
        // are           : bookingDetails?.area,
        // current_percent: bookingDetails?.current_percent > 0 ? "More than 5%" : "0"
    }
    const packageContent = {
        packageName: bookingDetails?.package_data?.package_name,
        packageId: bookingDetails?.package_data?.package_id,
        chargingFee: `₹ ${parseFloat(bookingDetails?.package_data?.charging_fee).toFixed(2)}`,
        chargingCapacity: `${bookingDetails?.package_data?.charging_capacity}kW`,
        pricePerUnit: `₹ ${parseFloat(bookingDetails?.package_data?.price_per_unit).toFixed(2)}`,
        serviceFee: `₹ ${parseFloat(bookingDetails?.package_data?.service_fee).toFixed(2)}`,
    };
    const packageTitles = {
        packageName: "Package Name",
        packageId: "Package ID",
        chargingFee: "Charging Fee",
        chargingCapacity: "Charging Capacity",
        pricePerUnit: "Price / Unit",
        serviceFee: "Service Fee",
    };
    return (
        <div className='main-container'>
            {loading ? <Loader /> :
                <>

                    <BookingDetailsHeader content={content} packageTitles={packageTitles} packageContent={packageContent} titles={headerTitles} sectionContent={sectionContent1} type='portableChargerBooking' feedBack={feedBack} />
                    <div className={styles.bookingDetailsSection}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                            sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
                            sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
                            type='portableChargerBooking' />
                        <BookingDetailsAccordion history={history} rsa={content} />
                    </div>
                </>
            }
        </div>
    )
}

export default ChargerBookingDetails