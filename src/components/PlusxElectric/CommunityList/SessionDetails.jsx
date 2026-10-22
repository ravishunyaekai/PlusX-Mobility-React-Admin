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
import SubHeader from '../../SharedComponent/SubHeader/SubHeader.jsx';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import List from '../../SharedComponent/List/List.jsx';
import Pagination from '../../SharedComponent/Pagination/Pagination.jsx';

const SessionDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const { stationId } = useParams();

    const [bookingDetails, setBookingDetails] = useState({});
    const [loading, setLoading] = useState(false);
    // Session History
    const [sessionList, setSessionList] = useState([]);
    const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
    const [sessionTotalPages, setSessionTotalPages] = useState(1);
    const [sessionTotalCount, setSessionTotalCount] = useState(0);

    // Invoice History
    const [invoiceList, setInvoiceList] = useState([]);
    const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
    const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
    const [invoiceTotalCount, setInvoiceTotalCount] = useState(0);
    const [imageGallery, setImageGallery] = useState();
    const [imageGalleryId, setImageGalleryId] = useState();
    const [baseUrl, setBaseUrl] = useState();

    const fetchDetails = () => {
        setLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            session_id: stationId
        };

        postRequestWithToken('session-detail', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
            } else {
                console.log('error in session-detail API', response);
                toast(response?.message || 'Failed to fetch resident details', {
                    type: "error"
                });
            }

            setLoading(false);
        });
    };

    const fetchSessionList = (page = 1) => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_id: stationId,
            page_no: page,
            search_text: '',
            start_date: '',
            end_date: ''
        };

        postRequestWithToken('session-list', obj, (response) => {
            if (response.code === 200) {
                setSessionList(response?.data || []);
                setSessionTotalPages(response?.total_page || 1);
                setSessionTotalCount(response?.total || 0);
                setSessionCurrentPage(page);
            } else {
                setSessionList([]);
                setSessionTotalPages(1);
                setSessionTotalCount(0);

                toast(response?.message || 'Failed to fetch session history', {
                    type: "error"
                });
            }
        });
    };

    const fetchInvoiceList = (page = 1, mobile = '') => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_mobile: mobile,
            page_no: page,
            search_text: '',
            start_date: '',
            end_date: ''
        };

        postRequestWithToken('scan-charge-invoice-list', obj, (response) => {
            if (response.code === 200) {
                const updatedInvoicelist = (response.data || [])?.map((ele, i) => ({
                    ...ele,
                    sr_no: i + 1,
                    total_amount: Number(ele.total_amount || 0).toFixed(2),
                    energy_price_total: Number(ele.energy_price_total || 0).toFixed(2),
                    extra_charge_total: Number(ele.extra_charge_total || 0).toFixed(2),
                }))
                setInvoiceList(updatedInvoicelist);
                setInvoiceTotalPages(response?.total_page || 1);
                setInvoiceTotalCount(response?.total || 0);
                setInvoiceCurrentPage(page);
            } else {
                setInvoiceList([]);
                setInvoiceTotalPages(1);
                setInvoiceTotalCount(0);

                toast(response?.message || 'Failed to fetch invoice history', {
                    type: "error"
                });
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }

        fetchDetails();
        fetchSessionList(1);
    }, []);

    useEffect(() => {
        if (!bookingDetails || Object.keys(bookingDetails).length === 0) {
            return;
        }

        const residentMobile =
            bookingDetails?.resident_mobile ||
            bookingDetails?.mobile_number ||
            bookingDetails?.contact_no ||
            '';

        fetchInvoiceList(1, residentMobile);
    }, [bookingDetails]);

    const handleSessionPageChange = (page) => {
        fetchSessionList(page);
    };

    const handleInvoicePageChange = (page) => {
        const residentMobile =
            bookingDetails?.resident_mobile ||
            bookingDetails?.mobile_number ||
            bookingDetails?.contact_no ||
            '';

        fetchInvoiceList(page, residentMobile);
    };

    const headerTitles = {
        bookingIdTitle: "Session ID",
        stationDetailsTitle: "Resident Details",
    };

    const sectionTitles1 = {
        communityName: "Community Name",
        areaName: "Area Name",
        chargerId: "Charger ID",
        totalConsumption: "Total Consumption",
        totalDuration: "Total Duration",
        extraMinutes: "Over Time (Min)",
        startTime: "Start Time",
        endTime: "End Time",
        startKwh: "Start With",
        endKwh: "End With",
        status: "Status",
    };

    const content = {
        bookingId: bookingDetails?.booking_id || "N/A",
        createdAt: bookingDetails?.created_at
            ? moment(bookingDetails.created_at).format('DD MMM YYYY')
            : "N/A",
        stationName: bookingDetails?.resident_name || "N/A",
        stationMobile: bookingDetails?.resident_mobile || "N/A",
    };

    /*
     * communities returned by backend can be an array.
     * Convert it into a readable string for the details section.
     */
    const communityNames = Array.isArray(bookingDetails?.communities)
        ? bookingDetails.communities
            .map((community) =>
                typeof community === 'string'
                    ? community
                    : community?.community_name
            )
            .filter(Boolean)
            .join(', ')
        : bookingDetails?.communities || "N/A";

    const sectionContent1 = {
        communityName:
            bookingDetails?.community_name || "N/A",

        areaName:
            bookingDetails?.area_name || "N/A",

        chargerId:
            bookingDetails?.charger_id || "N/A",

        totalConsumption:
            bookingDetails?.total_consumption ?? "0.00",

        totalDuration:
            bookingDetails?.total_duration ?? "0",

        extraMinutes:
            bookingDetails?.extra_minutes ?? "0",

        startTime:
            bookingDetails?.start_time
                ? moment(bookingDetails.start_time).format("DD MMM YYYY, hh:mm A")
                : "N/A",

        endTime:
            bookingDetails?.end_time
                ? moment(bookingDetails.end_time).format("DD MMM YYYY, hh:mm A")
                : "N/A",

        startKwh:
            bookingDetails?.start_kwh ?? "0.000",

        endKwh:
            bookingDetails?.end_kwh ?? "0.000",

        status:
            bookingDetails?.session_status || "N/A",
    };

    const [filters, setFilters] = useState({
        start_date: null,
        end_date: null
    });

    const [filters2, setFilters2] = useState({
        start_date: null,
        end_date: null
    });

    const fetchSessionFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setSessionCurrentPage(1);
    };

    const fetchInvoiceFilteredData = (newFilters = {}) => {
        setFilters2(newFilters);
        setInvoiceCurrentPage(1);
    };

    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ];

    const searchTerm2 = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ];

    const dynamicFilters = [];
    const dynamicFilters2 = [];

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
                        type='residentDetails'
                    />

                    <div className={styles.ChargerDetailsSection}>
                        <BookingLeftDetails
                            titles={sectionTitles1}
                            content={sectionContent1}
                            sectionTitles2={{}}
                            sectionContent2={{}}
                            sectionTitles4={{}}
                            sectionContent4={{}}
                            type='residentDetails'
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default SessionDetails;