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

const ResidentDetails = () => {
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

    const fetchDetails = () => {
        setLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_id: stationId
        };

        postRequestWithToken('resident-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
            } else {
                console.log('error in resident-details API', response);
                toast(response?.message || 'Failed to fetch resident details', {
                    type: "error"
                });
            }

            setLoading(false);
        });
    };

    const fetchSessionList = (page = 1, appliedFilters = {}, scheduleFilters = {},) => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_id: stationId,
            page_no: page,
            search_text: appliedFilters?.search_text || '',
            start_date: appliedFilters?.start_date || '',
            end_date: appliedFilters?.end_date || ''
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

    const fetchInvoiceList = (page = 1, mobile = '', appliedFilters = {}, scheduleFilters = {},) => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_mobile: mobile,
            page_no: page,
            search_text: appliedFilters?.search_text || '',
            start_date: appliedFilters?.start_date || '',
            end_date: appliedFilters?.end_date || ''
        };

        postRequestWithToken('scan-charge-invoice-list', obj, (response) => {
            if (response.code === 200) {
                const updatedInvoiceList = (response.data || []).map((ele, i) => ({
                    ...ele,
                    sr_no: ((page - 1) * 10) + i + 1,
                    total_amount: Number(ele.total_amount || 0).toFixed(2),
                    energy_price_total: Number(ele.energy_price_total || 0).toFixed(2),
                    extra_charge_total: Number(ele.extra_charge_total || 0).toFixed(2),
                }));

                setInvoiceList(updatedInvoiceList);
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
        fetchSessionList(page, filters);
    };

    const handleInvoicePageChange = (page) => {
        const residentMobile =
            bookingDetails?.resident_mobile ||
            bookingDetails?.mobile_number ||
            bookingDetails?.contact_no ||
            '';

        fetchInvoiceList(page, residentMobile, filters2);
    };

    const headerTitles = {
        bookingIdTitle: "Resident ID",
        stationDetailsTitle: "Resident Details",
    };

    const sectionTitles1 = {
        emailAddress: "Email Address",
        communities: "Communities",
        fullAddress: "Full Address",
        monthlySessionAllocated: "Monthly Session Allocated",
        allocatedTimeInMinutes: "Allocated Time in Minutes",
        kwhAllocationPerMonth: "kWh Allocation/Month",
        perKwhCharge: "Per kWh Charge (INR)",
        extraChargePerMinOverAllocatedTime:
            "Extra Charge/Min Over Allocated Time (INR)",
        status: "Status",
    };

    const content = {
        bookingId: bookingDetails?.resident_id || "N/A",
        createdAt: bookingDetails?.created_at
            ? moment(bookingDetails?.created_at).format("DD MMM YYYY, hh:mm A")
            : "N/A",
        stationName: bookingDetails?.resident_name || "N/A",
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
        emailAddress: bookingDetails?.resident_email || "N/A",

        communities: communityNames,

        fullAddress: bookingDetails?.address || "N/A",

        monthlySessionAllocated:
            bookingDetails?.monthly_session_allocation ?? 0,

        allocatedTimeInMinutes:
            bookingDetails?.alloted_time ?? 0,

        kwhAllocationPerMonth:
            bookingDetails?.kwh_allocated ?? 0,

        perKwhCharge:
            bookingDetails?.per_kwh_charge ?? 0,

        extraChargePerMinOverAllocatedTime:
            bookingDetails?.extra_charge ?? 0,

        status:
            bookingDetails?.status === 1
                ? "Active"
                : "Un-Active",
    };

    const [filters, setFilters] = useState({
        search_text: "",
        start_date: null,
        end_date: null
    });

    const [scheduleFilters, setScheduleFilters] = useState({
        search_text: "",
        start_date: null,
        end_date: null
    });

    const [filters2, setFilters2] = useState({
        search_text: "",
        start_date: null,
        end_date: null
    });

    const [scheduleFilters2, setScheduleFilters2] = useState({
        search_text: "",
        start_date: null,
        end_date: null
    });

    const fetchSessionFilteredData = (newFilters = {}) => {
        const updatedFilters = {
            search_text: newFilters?.search_text || '',
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null
        };

        setFilters(updatedFilters);

        // Reset to page 1 and fetch filtered data
        fetchSessionList(1, updatedFilters);
    };
    const scheduleSessionFilteredData = (newFilters = {}) => {
        const updatedFilters = {
            search_text: newFilters?.search_text || '',
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null
        };

        setFilters(updatedFilters);

        // Reset to page 1 and fetch filtered data
        fetchSessionList(1, updatedFilters);
    };

    const fetchInvoiceFilteredData = (newFilters = {}) => {
        const updatedFilters = {
            search_text: newFilters?.search_text || '',
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null
        };

        setFilters2(updatedFilters);

        const residentMobile =
            bookingDetails?.resident_mobile ||
            bookingDetails?.mobile_number ||
            bookingDetails?.contact_no ||
            '';

        // Reset to page 1 and fetch filtered data
        fetchInvoiceList(1, residentMobile, updatedFilters);
    };
    const scheduleInvoiceFilteredData = (newFilters = {}) => {
        const updatedFilters = {
            search_text: newFilters?.search_text || '',
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null
        };

        setFilters2(updatedFilters);

        const residentMobile =
            bookingDetails?.resident_mobile ||
            bookingDetails?.mobile_number ||
            bookingDetails?.contact_no ||
            '';

        // Reset to page 1 and fetch filtered data
        fetchInvoiceList(1, residentMobile, updatedFilters);
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
                    <SubHeader heading="Total Session History"
                        // addButtonProps={addButtonProps}
                        fetchFilteredData={fetchSessionFilteredData}
                        dynamicFilters={dynamicFilters} filterValues={filters}
                        searchTerm={searchTerm}
                        count={sessionTotalCount}
                        scheduleDateChange={scheduleSessionFilteredData}
                        scheduleFilters={scheduleFilters}
                    />
                    {
                        sessionList.length === 0 ? (
                            <EmptyList
                                tableHeaders={["Date", "Session Id", "Resident Name", "Area", "Charger Id", "KWh Used", "Duration (In Min.)", "Status", "Action"]}
                                message="No data available"
                            />
                        ) : (
                            <>
                                <List
                                    tableHeaders={["Date", "Session Id", "Resident Name", "Area", "Charger Id", "KWh Used", "Duration (In Min.)", "Status", "Action"]}
                                    listData={sessionList}
                                    pageHeading="Total Session History"
                                    onDeleteSlot={{}}
                                    keyMapping={[
                                        { key: 'created_at', label: 'Date', format: (date) => moment(date).format('DD MMM YYYY') },
                                        { key: 'booking_id', label: 'Session Id' },
                                        { key: 'resident_name', label: 'Resident Name' },
                                        { key: 'area_name', label: 'Area' },
                                        { key: 'charger_id', label: 'Charger Id' },
                                        { key: 'total_consumption', label: 'KWh Used' },
                                        { key: 'total_duration', label: 'Duration (In Min.)' },
                                        { key: 'status', label: 'Status' },
                                    ]}
                                />

                                <Pagination
                                    currentPage={sessionCurrentPage}
                                    totalPages={sessionTotalPages}
                                    onPageChange={handleSessionPageChange}
                                />
                            </>
                        )
                    }
                    <SubHeader heading="Total Invoice History"
                        // addButtonProps={addButtonProps}
                        fetchFilteredData={fetchInvoiceFilteredData}
                        dynamicFilters={dynamicFilters2} filterValues={filters2}
                        searchTerm={searchTerm2}
                        count={invoiceTotalCount}
                        scheduleDateChange={scheduleInvoiceFilteredData}
                        scheduleFilters={scheduleFilters2}
                    />
                    {
                        invoiceList.length === 0 ? (
                            <EmptyList
                                tableHeaders={["Sr No", "Invoice Id", "Resident Name", "kWh Allocated", "Per kW Charge", "Price (INR)", "Over Time (INR)", "Total (INR)", "Status", "Action"]}
                                message="No data available"
                            />
                        ) : (
                            <>
                                <List
                                    tableHeaders={["Sr No", "Invoice Id", "Resident Name", "kWh Allocated", "Per kW Charge", "Price (INR)", "Over Time (INR)", "Total (INR)", "Status", "Action"]}
                                    listData={invoiceList}
                                    pageHeading="Total Invoice History"
                                    onDeleteSlot={{}}
                                    keyMapping={[
                                        { key: 'sr_no', label: 'Sr No' },
                                        { key: 'invoice_id', label: 'Invoice Id' },
                                        { key: 'resident_name', label: 'Resident Name' },
                                        {
                                            key: 'kwh_allocated',
                                            label: 'kWh Allocated'
                                        },
                                        { key: 'per_kwh_charge', label: 'Per kW Charge' },
                                        { key: 'energy_price_total', label: 'Price (INR)' },
                                        {
                                            key: 'extra_charge_total',
                                            label: 'Over Time (INR)'
                                        },
                                        {
                                            key: 'total_amount',
                                            label: 'Total (INR)'
                                        },
                                        {
                                            key: 'invoice_status',
                                            label: 'Status'
                                        },
                                    ]}
                                />

                                <Pagination
                                    currentPage={invoiceCurrentPage}
                                    totalPages={invoiceTotalPages}
                                    onPageChange={handleInvoicePageChange}
                                />
                            </>
                        )
                    }
                </>
            )}
        </div>
    );
};

export default ResidentDetails;