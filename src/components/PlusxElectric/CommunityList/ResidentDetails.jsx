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
    const [totalCount, setTotalCount] = useState(null);
    const [totalCount2, setTotalCount2] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [imageGallery, setImageGallery] = useState();
    const [imageGalleryId, setImageGalleryId] = useState();
    const [baseUrl, setBaseUrl] = useState();

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

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }

        fetchDetails();
    }, []);

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
            ? moment(bookingDetails.created_at).format('DD MMM YYYY')
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
                        // fetchFilteredData={fetchFilteredData}
                        // dynamicFilters={dynamicFilters} filterValues={filters}
                        // searchTerm={searchTerm}
                        count={totalCount}
                    />
                    {
                        [].length === 0 ? (
                            <EmptyList
                                tableHeaders={["Date", "Session Id", "Resident Name", "Area", "Charger Id", "KWh Used", "Duration (In Min.)", "Status", "Action"]}
                                message="No data available"
                            />
                        ) : (
                            <>
                                <List
                                    tableHeaders={["Date", "Session Id", "Resident Name", "Area", "Charger Id", "KWh Used", "Duration (In Min.)", "Status", "Action"]}
                                    listData={[]}
                                    pageHeading="Total Session History"
                                    onDeleteSlot={{}}
                                    keyMapping={[
                                        { key: 'station_name', label: 'Sr No' },
                                        { key: 'charging_for', label: 'Charger Id' },
                                        { key: 'charger_type', label: 'KW' },
                                    ]}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={{}}
                                />
                            </>
                        )
                    }
                    <SubHeader heading="Total Invoice History"
                        // addButtonProps={addButtonProps}
                        // fetchFilteredData={fetchFilteredData}
                        // dynamicFilters={dynamicFilters} filterValues={filters}
                        // searchTerm={searchTerm}
                        count={totalCount2}
                    />
                    {
                        [].length === 0 ? (
                            <EmptyList
                                tableHeaders={["Sr No", "Redident Id", "Mobile", "Email", "Session Allocated", "Session Used", "kWh Allocated", "kWh Used", "Action"]}
                                message="No data available"
                            />
                        ) : (
                            <>
                                <List
                                    tableHeaders={["Sr No", "Redident Id", "Mobile", "Email", "Session Allocated", "Session Used", "kWh Allocated", "kWh Used", "Action"]}
                                    listData={[]}
                                    pageHeading="Charger List"
                                    onDeleteSlot={{}}
                                    keyMapping={[
                                        { key: 'station_name', label: 'Sr No' },
                                        { key: 'charging_for', label: 'Charger Id' },
                                        { key: 'charger_type', label: 'KW' },
                                    ]}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={{}}
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