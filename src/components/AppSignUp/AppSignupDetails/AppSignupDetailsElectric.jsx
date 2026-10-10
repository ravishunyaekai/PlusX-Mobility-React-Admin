import { useEffect, useState } from 'react';
import styles from '../AppSignup.module.css';
import { postRequestWithToken } from '../../../api/Requests';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from '../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import List from '../../SharedComponent/List/List.jsx';
import moment from 'moment';

// Images & Icons
import email from "../../../assets/images/Email.svg";
import date from "../../../assets/images/DateCard.svg";
import profile from "../../../assets/images/ProfileCard.svg";
import mobile from "../../../assets/images/MobileCard.svg";
import View from '../../../assets/images/ViewEye.svg';

import WalletModal from '../../SharedComponent/CustomModal/WalletModal.jsx';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader.jsx';
import AppSignupInfoSection from '../../SharedComponent/Details/NewBookingDetails/AppSignupInfoSection/AppSignupInfoSection.jsx';
import { formatIndianNumber } from '../../../utils/statusMapping.js';


// --------------------------------------------------
// STATUS MAPPINGS
// --------------------------------------------------

const statusMapping = {
    CNF: 'Booking Confirmed',
    A: 'Assigned',
    ER: 'Enroute',
    RL: 'POD Reached at Location',
    CS: 'Charging Started',
    CC: 'Charging Completed',
    PU: 'Completed',
    C: 'Cancelled',
    RO: 'POD Reached at Office',
    WC: 'Work Completed',
};


const portableChargerStatusMapping = {
    ...statusMapping,
    RL: 'Mobile Charging Van Reached at Location',
    RO: 'Mobile Charging Van Reached at Office',
    PU: 'Mobile Charging Van Picked Up',
};


const rsaStatusMapping = {
    ...statusMapping,
    RL: 'Mobile Charging Van Reached at Location',
    RO: 'Mobile Charging Van Reached at Office',
};


// --------------------------------------------------
// TABLE HEADERS
// --------------------------------------------------

const addressHeaders = [
    'Building Name',
    'Street Name',
    'Area Name',
    'Flat No.',
    'Nick Name',
    'City',
    'State'
];


const vehicleHeaders = [
    'Vehicle Type',
    'Plate Code',
    'Plate No.',
    'Vehicle Brand',
    'Vehicle Specification',
];


const portableChargerHeaders = [
    'Schedule Date',
    'Booking ID',
    'Price',
    'Status',
    'Assigned Driver',
    'Action'
];


const pickAndDropHeaders = [
    'Schedule Date',
    'Booking ID',
    'Price',
    'Status',
    'Assigned Driver',
    'Action'
];


const rsaHeaders = [
    'Date',
    'Booking ID',
    'Price',
    'Status',
    'Assigned Driver',
    'Action'
];


// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const AppSignupDetailsElectric = () => {

    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();
    const { riderId } = useParams();


    // --------------------------------------------------
    // RIDER DETAILS
    // --------------------------------------------------

    const [riderDetails, setRiderDetails] = useState(null);
    const [loading, setLoading] = useState(false);


    // --------------------------------------------------
    // ADDRESS PAGINATION
    // --------------------------------------------------

    const [addressCurrentPage, setAddressCurrentPage] = useState(1);

    const [addressItemsPerPage,setAddressItemsPerPage] = useState(2);


    // --------------------------------------------------
    // VEHICLE PAGINATION
    // --------------------------------------------------

    const [vehicleCurrentPage, setVehicleCurrentPage] = useState(1);

    const [vehicleItemsPerPage,setVehicleItemsPerPage] = useState(3);


    // --------------------------------------------------
    // BOOKINGS - PORTABLE CHARGER
    // --------------------------------------------------

    const [portableChargerBookings, setPortableChargerBookings] = useState([]);

    const [portableCurrentPage, setPortableCurrentPage] = useState(1);

    const [portableTotalPages, setPortableTotalPages] = useState(1);

    const [portableTotalCount, setPortableTotalCount] = useState(0);

    const [loadingPortable, setLoadingPortable] = useState(false);


    // --------------------------------------------------
    // BOOKINGS - RSA
    // --------------------------------------------------

    const [rsaBookings, setRsaBookings] = useState([]);

    const [rsaCurrentPage, setRsaCurrentPage] = useState(1);

    const [rsaTotalPages, setRsaTotalPages] = useState(1);

    const [rsaTotalCount, setRsaTotalCount] = useState(0);

    const [loadingRsa, setLoadingRsa] = useState(false);


    // --------------------------------------------------
    // COMMON API OBJECT
    // --------------------------------------------------

    const getCommonObject = () => ({
        userId: userDetails?.user_id,
        email: userDetails?.email,
        riderId: riderId
    });


    // --------------------------------------------------
    // FETCH RIDER DETAILS
    // --------------------------------------------------

    const fetchRiderDetails = () => {

        setLoading(true);

        const obj = {
            ...getCommonObject(),
            service_type: 'App Signup'
        };

        postRequestWithToken(
            'rider-details-electric-dashboard',
            obj,
            (response) => {

                if (response.code === 200) {

                    setRiderDetails(
                        response?.data || {}
                    );

                } else {

                    console.log(
                        'Error in rider-details-electric-dashboard API',
                        response
                    );

                    setRiderDetails({});

                }

                setLoading(false);
            }
        );
    };


    // --------------------------------------------------
    // FETCH PORTABLE CHARGER BOOKINGS
    // --------------------------------------------------

    const fetchPortableBookings = () => {

        setLoadingPortable(true);

        const obj = {
            ...getCommonObject(),
            service_type: 'Mobile EV Charging',
            page_no: portableCurrentPage
        };

        postRequestWithToken(
            'rider-booking-list',
            obj,
            (response) => {

                if (response.code === 200) {

                    setPortableChargerBookings(
                        response?.data || []
                    );

                    setPortableTotalPages(
                        response?.totalPage ||
                        response?.total_page ||
                        1
                    );

                    setPortableTotalCount(
                        response?.total || 0
                    );

                } else {

                    setPortableChargerBookings([]);

                    setPortableTotalPages(1);

                    setPortableTotalCount(0);
                }

                setLoadingPortable(false);
            }
        );
    };


    // --------------------------------------------------
    // FETCH RSA BOOKINGS
    // --------------------------------------------------

    const fetchRsaBookings = () => {

        setLoadingRsa(true);

        const obj = {
            ...getCommonObject(),
            service_type: 'RSA',
            page_no: rsaCurrentPage
        };

        postRequestWithToken(
            'rider-booking-list',
            obj,
            (response) => {

                if (response.code === 200) {

                    setRsaBookings(
                        response?.data || []
                    );

                    setRsaTotalPages(
                        response?.totalPage ||
                        response?.total_page ||
                        1
                    );

                    setRsaTotalCount(
                        response?.total || 0
                    );

                } else {

                    setRsaBookings([]);

                    setRsaTotalPages(1);

                    setRsaTotalCount(0);
                }

                setLoadingRsa(false);
            }
        );
    };


    // --------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate('/login');
            return;
        }

        fetchRiderDetails();

    }, []);


    // --------------------------------------------------
    // BOOKING API EFFECTS
    // --------------------------------------------------

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) return;

        fetchPortableBookings();

    }, [portableCurrentPage]);


    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) return;

        fetchRsaBookings();

    }, [rsaCurrentPage]);


    // --------------------------------------------------
    // ADDRESS / VEHICLE DATA
    // --------------------------------------------------

    const addressList = riderDetails?.riderAddress || [];

    const vehicleList = riderDetails?.riderVehicles || [];


    // --------------------------------------------------
    // ADDRESS PAGINATION DATA
    // --------------------------------------------------

    const addressTotalPages = Math.ceil(
        addressList.length / addressItemsPerPage
    );


    const paginatedAddressList = addressList.slice(
        (addressCurrentPage - 1) * addressItemsPerPage,
        addressCurrentPage * addressItemsPerPage
    );


    // --------------------------------------------------
    // VEHICLE PAGINATION DATA
    // --------------------------------------------------

    const vehicleTotalPages = Math.ceil(
        vehicleList.length / vehicleItemsPerPage
    );


    const paginatedVehicleList = vehicleList.slice(
        (vehicleCurrentPage - 1) * vehicleItemsPerPage,
        vehicleCurrentPage * vehicleItemsPerPage
    );


    // --------------------------------------------------
    // HANDLERS
    // --------------------------------------------------

    const handleAddressPageChange = (page) => {

        setAddressCurrentPage(page);

    };


    const handleVehiclePageChange = (page) => {

        setVehicleCurrentPage(page);

    };


    const handlePortablePageChange = (page) => {

        setPortableCurrentPage(page);

    };


    const handleRsaPageChange = (page) => {

        setRsaCurrentPage(page);

    };


    const handleBookingDetails = (id) => {

        navigate(
            `/electric/mobile-ev-charging/charging-booking-details/${id}`
        );

    };


    // --------------------------------------------------
    // HEADER CARDS
    // --------------------------------------------------

    const headerItems = [
        { label: 'Date', icon: date, value: moment(riderDetails?.created_at).format('DD MMM YYYY') },
        {
            label: 'Customer Name',
            icon: profile,
            value: riderDetails?.rider_name || '-'
        },
        {
            label: 'Mobile No.',
            icon: mobile,
            value: riderDetails?.rider_mobile || '-'
        },
        {
            label: 'Email ID',
            icon: email,
            value: riderDetails?.rider_email || '-'
        },
    ];

    const riderInfoFields = riderDetails ? [
        { label: 'State', value: riderDetails.state },
        { label: 'City', value: riderDetails.city },
    ] : [];


    // --------------------------------------------------
    // RETURN
    // --------------------------------------------------

    return (

        <div className='main-container'>

            <ToastContainer />


            {loading ? (

                <Loader />

            ) : (

                <>

                    {/* =========================================
                        CUSTOMER HEADER
                    ========================================= */}

                    <DetailsCards
                        items={headerItems}
                    />

                    <div className={styles.bookingDetailsSection}>
                        {riderInfoFields.length > 0 ? (
                            <AppSignupInfoSection
                                imageUrl={riderDetails?.id_image ? `${riderDetails.base_url}${riderDetails?.id_image}` : null}
                                riderInfoFields={riderInfoFields} fieldCount={riderInfoFields.length}
                            />
                        ) : (
                            <div className={styles.noBookingData}>No user info available.</div>
                        )}
                    </div>

                    {/* =========================================
                        ADDRESS LIST
                    ========================================= */}
                    {addressList?.length > 0 && <>
                        <SubHeader
                            heading="Address List"
                            count={addressList.length}
                        />


                        {addressList.length === 0 ? (

                            <EmptyList
                                tableHeaders={addressHeaders}
                                message="No data available"
                            />

                        ) : (

                            <>

                                <List
                                    tableHeaders={addressHeaders}
                                    listData={paginatedAddressList}
                                    pageHeading="Address List"
                                    keyMapping={[
                                        {
                                            key: 'building_name',
                                            label: 'Building Name',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'street_name',
                                            label: 'Street Name',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'area',
                                            label: 'Area Name',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'unit_no',
                                            label: 'Flat No.',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'nick_name',
                                            label: 'Nick Name',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'city',
                                            label: 'City',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'state',
                                            label: 'State',
                                            format: value =>
                                                value || '-'
                                        }
                                    ]}
                                />


                                {/* ADDRESS PAGINATION */}

                                {/* {addressTotalPages > 1 && ( */}

                                <Pagination
                                    currentPage={addressCurrentPage}
                                    totalPages={addressTotalPages}
                                    onPageChange={
                                        handleAddressPageChange
                                    }
                                />

                                {/* )} */}

                            </>

                        )}
                    </>}


                    {/* =========================================
                        VEHICLE LIST
                    ========================================= */}
                    {vehicleList?.length > 0 && <>
                        <SubHeader
                            heading="Vehicle List"
                            count={vehicleList.length}
                        />


                        {vehicleList.length === 0 ? (

                            <EmptyList
                                tableHeaders={vehicleHeaders}
                                message="No data available"
                            />

                        ) : (

                            <>

                                <List
                                    tableHeaders={vehicleHeaders}
                                    listData={paginatedVehicleList}
                                    pageHeading="Vehicle List"
                                    keyMapping={[
                                        {
                                            key: 'vehicle_type',
                                            label: 'Vehicle Type',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'vehicle_code',
                                            label: 'Plate Code',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'vehicle_number',
                                            label: 'Plate No.',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'vehicle_make',
                                            label: 'Vehicle Brand',
                                            format: value =>
                                                value || '-'
                                        },
                                        {
                                            key: 'vehicle_specification',
                                            label: 'Vehicle Specification',
                                            format: (
                                                value,
                                                key,
                                                relatedKeys,
                                                data
                                            ) => {

                                                return (
                                                    value ||
                                                    data?.vehicle_model ||
                                                    '-'
                                                );

                                            }
                                        }
                                    ]}
                                />


                                {/* VEHICLE PAGINATION */}

                                {/* {vehicleTotalPages > 1 && ( */}

                                <Pagination
                                    currentPage={vehicleCurrentPage}
                                    totalPages={vehicleTotalPages}
                                    onPageChange={
                                        handleVehiclePageChange
                                    }
                                />

                                {/* // )} */}

                            </>

                        )}
                    </>}


                    {/* =========================================
                        MOBILE EV CHARGING BOOKINGS
                    ========================================= */}
                    {portableChargerBookings?.length > 0 && <>
                        <SubHeader
                            heading="Mobile EV Charging Bookings"
                            count={portableTotalCount}
                        />


                        {loadingPortable ? (

                            <Loader />

                        ) : portableChargerBookings.length === 0 ? (

                            <EmptyList
                                tableHeaders={portableChargerHeaders}
                                message="No data available"
                            />

                        ) : (

                            <>

                                <List
                                    tableHeaders={portableChargerHeaders}
                                    listData={portableChargerBookings}
                                    pageHeading="Mobile EV Charging Bookings"
                                    keyMapping={[
                                        {
                                            key: 'slot_date',
                                            label: 'Schedule Date',
                                            format: value =>
                                                value
                                                    ? moment(value).format(
                                                        'DD MMM YYYY'
                                                    )
                                                    : '-'
                                        },
                                        {
                                            key: 'booking_id',
                                            label: 'Booking ID'
                                        },
                                        {
                                            key: 'service_price',
                                            label: 'Price',
                                            format: value =>
                                                `INR ${formatIndianNumber(value) || '0'}`
                                        },
                                        {
                                            key: 'status',
                                            label: 'Status',
                                            format: value =>
                                                portableChargerStatusMapping[value] || '-'
                                        },
                                        {
                                            key: 'rsa_name',
                                            label: 'Assigned Driver',
                                            format: value =>
                                                value || '-'
                                        },
                                    ]}
                                />


                                <Pagination
                                    currentPage={portableCurrentPage}
                                    totalPages={portableTotalPages}
                                    onPageChange={
                                        handlePortablePageChange
                                    }
                                />

                            </>

                        )}
                    </>}


                    {/* =========================================
                        EV ROAD ASSISTANCE BOOKINGS
                    ========================================= */}
                    {rsaBookings?.length > 0 && <>

                        <SubHeader
                            heading="EV Road Assistance Bookings"
                            count={rsaTotalCount}
                        />


                        {loadingRsa ? (

                            <Loader />

                        ) : rsaBookings.length === 0 ? (

                            <EmptyList
                                tableHeaders={rsaHeaders}
                                message="No data available"
                            />

                        ) : (

                            <>

                                <List
                                    tableHeaders={rsaHeaders}
                                    listData={rsaBookings}
                                    pageHeading="EV Road Assistance Bookings"
                                    keyMapping={[
                                        {
                                            key: 'created_at',
                                            label: 'Date',
                                            format: value =>
                                                value
                                                    ? moment(value).format(
                                                        'DD MMM YYYY'
                                                    )
                                                    : '-'
                                        },
                                        {
                                            key: 'request_id',
                                            label: 'Booking ID'
                                        },
                                        {
                                            key: 'price',
                                            label: 'Price',
                                            format: value =>
                                                `INR ${formatIndianNumber(value) || '0'}`
                                        },
                                        {
                                            key: 'order_status',
                                            label: 'Status',
                                            format: value =>
                                                rsaStatusMapping[value] || '-'
                                        },
                                        {
                                            key: 'rsa_name',
                                            label: 'Assigned Driver',
                                            format: value =>
                                                value || '-'
                                        },
                                    ]}
                                />


                                <Pagination
                                    currentPage={rsaCurrentPage}
                                    totalPages={rsaTotalPages}
                                    onPageChange={
                                        handleRsaPageChange
                                    }
                                />

                            </>

                        )}
                    </>}

                </>

            )}

        </div>

    );

};


export default AppSignupDetailsElectric;