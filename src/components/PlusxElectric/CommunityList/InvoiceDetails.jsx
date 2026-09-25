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

            invoice_id: stationId,

            /*
             * Send the invoice month expected by backend.
             * Current month is used here.
             *
             * If your invoice list route contains the selected
             * billing month, replace this value with that value.
             */
            invoice_month: moment().format('YYYY-MM-DD')
        };


        postRequestWithToken('scan-charge-invoice-detail', obj, (response) => {

            if (response.code === 200) {

                setBookingDetails(response?.data || {});

            } else {

                console.log(
                    'error in scan-charge-invoice-detail API',
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

        bookingIdTitle: "Invoice ID",

        stationDetailsTitle: "Resident Details",

    };


    const sectionTitles1 = {

        communityName: "Community Name",
        areaName: "Area Name",
        fullAddress: "Full Address",
        noOfSession: "No. of Session",
        kwhAllocated: "kWh Allocation/Month",
        billingMonth: "Billing Month",
        totalConsumption: "Total Consumption",
        energyCharge: "Per kWh Charge (INR)",
        energyKwhPrice: "Energy kWh Price",
        overTimeMin: "Over Time (Min)",
        extraChargeMinOverAllocatedTime: "Extra Charge / Min Over Allocated Time (INR)",
        extraCharge: "Extra Charge (INR)",
        subTotal: "Sub Total",
        gst: "GST (18%)",
        totalAmount: "Total Amount (INR)",
        status: "Status"
    };


    const content = {

        bookingId:
            bookingDetails?.invoice_id || "N/A",

        createdAt:bookingDetails?.created_at ? 
            moment(bookingDetails?.created_at).format("DD MMM YYYY, hh:mm A")
            : "N/A",

        residentName:
            bookingDetails?.resident_name || "N/A",
        residentEmail:
            bookingDetails?.resident_email || "N/A",

    };


    const sectionContent1 = {
        communityName:
            bookingDetails?.community_name || "N/A",

        areaName:
            bookingDetails?.area_name || "N/A",

        fullAddress:
            bookingDetails?.resident_address || "N/A",

        noOfSession:
            bookingDetails?.no_of_session ?? 0,

        kwhAllocated:
            bookingDetails?.kwh_allocated ?? 0,

        billingMonth:
            bookingDetails?.billing_month || "N/A",

        totalConsumption:
            bookingDetails?.total_consumption ?? "0.00",

        energyCharge:
            bookingDetails?.per_kwh_charge ?? "0.00",

        energyKwhPrice:
            bookingDetails?.energy_price_total ?? "0.00",

        overTimeMin:
            bookingDetails?.over_time_min ?? 0,

        extraChargeMinOverAllocatedTime:
            bookingDetails?.extra_charge_per_min ?? "0.00",

        extraCharge:
            bookingDetails?.extra_charge_total ?? "0.00",

        subTotal:
            Number(bookingDetails?.subtotal ?? 0).toFixed(2),

        gst:
            Number(bookingDetails?.vat ?? 0).toFixed(2),

        totalAmount:
            Number(bookingDetails?.total_amount ?? 0).toFixed(2),

        status:
            bookingDetails?.invoice_status || "N/A"
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