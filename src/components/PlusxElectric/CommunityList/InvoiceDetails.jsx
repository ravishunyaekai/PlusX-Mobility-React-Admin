import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './PublicCharger.module.css';

import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';

import { postRequestWithToken } from '../../../api/Requests.js';

import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Loader from '../../SharedComponent/Loader/Loader.jsx';


const CommunityInvoiceDetails = () => {

    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    const navigate = useNavigate();

    const { stationId } = useParams();

    const [bookingDetails, setBookingDetails] = useState({});
    const [loading, setLoading] = useState(false);


    const fetchDetails = () => {

        setLoading(true);

        /*
         * stationId is assumed to contain the resident mobile
         * from the invoice list/detail route.
         */
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,

            resident_mobile: stationId,

            /*
             * Send the invoice month expected by backend.
             * Current month is used here.
             *
             * If your invoice list route contains the selected
             * billing month, replace this value with that value.
             */
            invoice_month: moment().format('YYYY-MM-DD')
        };


        postRequestWithToken('get-invoice-data', obj, (response) => {

            if (response.code === 200) {

                setBookingDetails(response?.data || {});

            } else {

                console.log(
                    'error in get-invoice-data API',
                    response
                );

                toast(
                    response?.message || 'Failed to fetch invoice details',
                    {
                        type: "error"
                    }
                );
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

        bookingIdTitle: "Resident Name",

        stationDetailsTitle: "Invoice Details",

    };


    const sectionTitles1 = {

        residentName: "Resident Name",

        kwhAllocated: "kWh Allocation/Month",

        totalConsumption: "Total Consumption",

        energyCharge: "Per kWh Charge (INR)",

        energyPrice: "Energy Price (INR)",

        overTimeMin: "Over Time (Min)",

        extraCharge: "Extra Charge (INR)",

        totalAmount: "Total Amount (INR)",

    };


    const content = {

        bookingId:
            bookingDetails?.resident_name || "N/A",

        createdAt:
            moment().format('DD MMM YYYY'),

        stationName:
            bookingDetails?.resident_name || "N/A",

    };


    const sectionContent1 = {

        residentName:
            bookingDetails?.resident_name || "N/A",

        kwhAllocated:
            bookingDetails?.kwh_allocated ?? 0,

        totalConsumption:
            bookingDetails?.total_consumption ?? "0.00",

        energyCharge:
            bookingDetails?.energy_charge ?? 0,

        energyPrice:
            bookingDetails?.energy_price ?? "0.00",

        overTimeMin:
            bookingDetails?.over_time_min ?? 0,

        extraCharge:
            bookingDetails?.extra_charge ?? "0.00",

        totalAmount:
            bookingDetails?.total_amount ?? "0.00",

    };


    return (

        <div className='main-container'>

            <ToastContainer />

            {loading ? (

                <Loader />

            ) : (

                <>

                    <BookingDetailsHeader
                        content={content}
                        titles={headerTitles}
                        type='communityInvoiceDetails'
                    />


                    <div className={styles.ChargerDetailsSection}>

                        <BookingLeftDetails
                            titles={sectionTitles1}
                            content={sectionContent1}

                            sectionTitles2={{}}
                            sectionContent2={{}}

                            sectionTitles4={{}}
                            sectionContent4={{}}

                            type='communityInvoiceDetails'
                        />

                    </div>

                </>

            )}

        </div>
    );
};


export default CommunityInvoiceDetails;