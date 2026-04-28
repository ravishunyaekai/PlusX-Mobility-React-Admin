import React, { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import BookingLeftDetails from '../../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { postRequestWithToken } from '../../../../api/Requests.js';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { useNavigate } from 'react-router-dom';

const ChargerBookingDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate()
    const { bookingId }                       = useParams()
    const [bookingDetails, setBookingDetails] = useState()

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : bookingId
        };
        postRequestWithToken('failed-charger-booking-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
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
    }, [bookingId]);

    const headerTitles = {
        bookingIdTitle       : "Booking ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : bookingDetails?.booking_id,
        customerId      : bookingDetails?.rider_id,
        createdAt       : moment(bookingDetails?.created_at).format('DD MMM YYYY h:mm A'),
        customerName    : bookingDetails?.user_name,
        customerContact : `${bookingDetails?.country_code} ${bookingDetails?.contact_no}`,
        imageUrl        : bookingDetails?.imageUrl,
    };
    const sectionTitles1 = {
        bookingStatus : "Booking Status",
        price         : "Price",
        serviceName   : "Service Name",
    }
    const sectionContent1 = {
        bookingStatus : 'Payment Not Received',
        serviceName   : bookingDetails?.service_name,
        price         : bookingDetails?.service_price ? `${ ( bookingDetails?.service_price ) } INR` : '0 INR',
    }
    const sectionTitles2 = {
        vehicle        : "Vehicle",
        serviceType    : "Service Type",
        serviceFeature : "Service Feature",
    }
    const sectionContent2 = {
        vehicle        : bookingDetails?.vehicle_data,
        serviceType    : bookingDetails?.service_type,
        serviceFeature : bookingDetails?.service_feature,
    }
    const sectionTitles3 = {
        address       : "Address",
        slotDate      : "Slot Date",
        slotTime      : "Slot Time",
        parkingNumber : "Parking No.",
        parkingFloor  : "Parking Floor",
    }
    const sectionContent3 = {
        // address: bookingDetails?.address
        address: (
            <a
                href    = {`https://www.google.com/maps?q=${bookingDetails?.latitude},${bookingDetails?.longitude}`}
                target    = "_blank"
                rel       = "noopener noreferrer"
                className = 'linkSection'
            >
                {bookingDetails?.address || 'View on Map'}
            </a>
        ),
        slotDate      : moment(bookingDetails?.slot_date).format('DD MMM YYYY'),
        slotTime      : moment(bookingDetails?.slot_time, 'HH:mm:ss').format('h:mm A'),
        parkingNumber : bookingDetails?.parking_number,
        parkingFloor  : bookingDetails?.parking_floor,
    } 
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1}
                type='failedportableChargerBooking'
            />
            <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                    sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
                    sectionTitles3={sectionTitles3} sectionContent3={sectionContent3}
                    type='portableChargerBooking' 
                />
            </div>
        </div>
    )
}

export default ChargerBookingDetails