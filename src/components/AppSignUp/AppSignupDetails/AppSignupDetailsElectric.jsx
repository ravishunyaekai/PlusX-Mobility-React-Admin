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
import profile from "../../../assets/images/ProfileCard.svg";
import mobile from "../../../assets/images/MobileCard.svg";
import View from '../../../assets/images/ViewEye.svg';

import WalletModal from '../../SharedComponent/CustomModal/WalletModal.jsx';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


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
    'Emirates'
];

const vehicleHeaders = [
    'Vehicle Type',
    'Plate Code',
    'Plate No.',
    'Vehicle Brand',
    'Vehicle Specification',
    'Emirates'
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
    // BOOKING HISTORY - PORTABLE CHARGER
    // --------------------------------------------------

    const [portableChargerBookings, setPortableChargerBookings] = useState([]);
    const [portableCurrentPage, setPortableCurrentPage] = useState(1);
    const [portableTotalPages, setPortableTotalPages] = useState(1);
    const [loadingPortable, setLoadingPortable] = useState(false);

    // --------------------------------------------------
    // BOOKING HISTORY - PICK AND DROP
    // --------------------------------------------------

    const [pickAndDropBookings, setPickAndDropBookings] = useState([]);
    const [valetCurrentPage, setValetCurrentPage] = useState(1);
    const [valetTotalPages, setValetTotalPages] = useState(1);
    const [loadingValet, setLoadingValet] = useState(false);

    // --------------------------------------------------
    // BOOKING HISTORY - RSA
    // --------------------------------------------------

    const [rsaBookings, setRsaBookings] = useState([]);
    const [rsaCurrentPage, setRsaCurrentPage] = useState(1);
    const [rsaTotalPages, setRsaTotalPages] = useState(1);
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

                    setRiderDetails(response?.data || {});

                } else {

                    console.log(
                        'Error in rider-details-electric-dashboard API',
                        response
                    );

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

                } else {

                    setPortableChargerBookings([]);

                }

                setLoadingPortable(false);
            }
        );
    };


    // --------------------------------------------------
    // FETCH PICK AND DROP BOOKINGS
    // --------------------------------------------------

    const fetchPickAndDropBookings = () => {

        setLoadingValet(true);

        const obj = {
            ...getCommonObject(),
            service_type: 'Valet',
            page_no: valetCurrentPage
        };

        postRequestWithToken(
            'rider-booking-list',
            obj,
            (response) => {

                if (response.code === 200) {

                    setPickAndDropBookings(
                        response?.data || []
                    );

                    setValetTotalPages(
                        response?.totalPage ||
                        response?.total_page ||
                        1
                    );

                } else {

                    setPickAndDropBookings([]);

                }

                setLoadingValet(false);
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

                } else {

                    setRsaBookings([]);

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

        fetchPickAndDropBookings();

    }, [valetCurrentPage]);


    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) return;

        fetchRsaBookings();

    }, [rsaCurrentPage]);


    // --------------------------------------------------
    // HANDLERS
    // --------------------------------------------------

    const handlePortablePageChange = (page) => {
        setPortableCurrentPage(page);
    };

    const handleValetPageChange = (page) => {
        setValetCurrentPage(page);
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


    // --------------------------------------------------
    // ADDRESS DATA
    // --------------------------------------------------

    const addressList = riderDetails?.riderAddress || [];


    // --------------------------------------------------
    // VEHICLE DATA
    // --------------------------------------------------

    const vehicleList = riderDetails?.riderVehicles || [];


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

                    <DetailsCards items={headerItems} />


                    {/* =========================================
                        ADDRESS LIST
                    ========================================= */}

                    <div className={styles.bookingDetailsSection}>

                        <div className={styles.DetailsMainHeading}>
                            Address List
                        </div>

                    </div>


                    {addressList.length === 0 ? (

                        <EmptyList
                            tableHeaders={addressHeaders}
                            message="No data available"
                        />

                    ) : (

                        <List
                            tableHeaders={addressHeaders}
                            listData={addressList}
                            pageHeading="Address List"
                            keyMapping={[
                                {
                                    key: 'building_name',
                                    label: 'Building Name',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'street_name',
                                    label: 'Street Name',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'area',
                                    label: 'Area Name',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'unit_no',
                                    label: 'Flat No.',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'nick_name',
                                    label: 'Nick Name',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'emirate',
                                    label: 'Emirates',
                                    format: value => value || '-'
                                }
                            ]}
                        />

                    )}


                    {/* =========================================
                        VEHICLE LIST
                    ========================================= */}

                    <div className={styles.bookingDetailsSection}>

                        <div className={styles.DetailsMainHeading}>
                            Vehicle List
                        </div>

                    </div>


                    {vehicleList.length === 0 ? (

                        <EmptyList
                            tableHeaders={vehicleHeaders}
                            message="No data available"
                        />

                    ) : (

                        <List
                            tableHeaders={vehicleHeaders}
                            listData={vehicleList}
                            pageHeading=""
                            keyMapping={[
                                {
                                    key: 'vehicle_type',
                                    label: 'Vehicle Type',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'vehicle_code',
                                    label: 'Plate Code',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'vehicle_number',
                                    label: 'Plate No.',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'vehicle_make',
                                    label: 'Vehicle Brand',
                                    format: value => value || '-'
                                },
                                {
                                    key: 'vehicle_specification',
                                    label: 'Vehicle Specification',
                                    format: (value, key, relatedKeys, data) => {
                                        return value || data?.vehicle_model || '-';
                                    }
                                },
                                {
                                    key: 'emirates',
                                    label: 'Emirates',
                                    format: value => value || '-'
                                }
                            ]}
                        />

                    )}


                    {/* =========================================
                        BOOKING HISTORY
                    ========================================= */}

                    <div className={styles.bookingHeading}>

                        <div className={styles.DetailsMainHeading}>
                            Booking History
                        </div>

                    </div>


                    {/* =========================================
                        MOBILE EV CHARGING
                    ========================================= */}

                    {/* <div className={styles.bookingDetailsSection}>

                        <div className={styles.DetailsMainHeading}>
                            MOBILE EV CHARGING
                        </div>

                    </div> */}


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
                                pageHeading=""
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
                                            `AED ${value || '0'}`
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

                    {/* =========================================
                        PICK AND DROP
                    ========================================= */}
                    {pickAndDropBookings.length > 0 && (<>
                        <div className={styles.bookingDetailsSection}>

                            <div className={styles.DetailsMainHeading}>
                                Pick and Drop
                            </div>

                        </div>


                        {loadingValet ? (

                            <Loader />

                        ) : pickAndDropBookings.length === 0 ? (

                            <EmptyList
                                tableHeaders={pickAndDropHeaders}
                                message="No data available"
                            />

                        ) : (

                            <>

                                <List
                                    tableHeaders={pickAndDropHeaders}
                                    listData={pickAndDropBookings}
                                    pageHeading="Booking History"
                                    keyMapping={[
                                        {
                                            key: 'slot_date_time',
                                            label: 'Schedule Date',
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
                                                `AED ${value || '0'}`
                                        },
                                        {
                                            key: 'order_status',
                                            label: 'Status',
                                            format: value =>
                                                statusMapping[value] || '-'
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
                                    currentPage={valetCurrentPage}
                                    totalPages={valetTotalPages}
                                    onPageChange={
                                        handleValetPageChange
                                    }
                                />

                            </>

                        )}
                    </>)}



                    {/* =========================================
                        RSA
                    ========================================= */}
                    {rsaBookings.length > 0 && (<>
                        <div className={styles.bookingDetailsSection}>

                            <div className={styles.DetailsMainHeading}>
                                Roadside Assistance
                            </div>

                        </div>


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
                                    pageHeading="Roadside Assistance"
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
                                                `AED ${value || '0'}`
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
                    </>)}

                </>

            )}

        </div>
    );
};

export default AppSignupDetailsElectric;
