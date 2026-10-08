import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './PublicCharger.module.css';

import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx';

import { postRequestWithToken } from '../../../api/Requests.js';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loader from '../../SharedComponent/Loader/Loader.jsx';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import List from '../../SharedComponent/List/List.jsx';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader.jsx';
import Pagination from '../../SharedComponent/Pagination/Pagination.jsx';
import moment from 'moment';


const CommunityDetails = () => {

    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();
    const { stationId } = useParams();


    // =========================
    // COMMUNITY DETAILS
    // =========================

    const [communityDetails, setCommunityDetails] = useState({});
    const [chargers, setChargers] = useState([]);
    const [manager, setManager] = useState([]);

    const [loading, setLoading] = useState(false);


    // =========================
    // CHARGER PAGINATION / COUNT
    // =========================

    const [totalCount, setTotalCount] = useState(0);


    // =========================
    // RESIDENT LIST
    // =========================

    const [residentList, setResidentList] = useState([]);
    const [residentLoading, setResidentLoading] = useState(false);

    const [residentTotalCount, setResidentTotalCount] = useState(0);
    const [residentCurrentPage, setResidentCurrentPage] = useState(1);
    const [residentTotalPages, setResidentTotalPages] = useState(1);


    /*
     * ============================================================
     * FETCH COMMUNITY DETAILS
     * ============================================================
     */

    const fetchDetails = () => {

        setLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            community_id: stationId
        };

        postRequestWithToken(
            'community-details',
            obj,
            (response) => {

                if (response.code === 200) {

                    // Community details
                    setCommunityDetails(
                        response?.data || {}
                    );


                    // Charger list
                    const chargerList = (
                        response?.chargers || []
                    ).map((charger, index) => ({
                        ...charger,
                        sr_no: index + 1
                    }));

                    setChargers(chargerList);


                    // Manager details
                    setManager(
                        response?.manager || []
                    );


                    // Charger count
                    setTotalCount(
                        chargerList.length
                    );

                } else {

                    console.log(
                        'error in community-details API',
                        response
                    );

                    toast(
                        response?.message ||
                        'Unable to fetch community details',
                        {
                            type: 'error'
                        }
                    );
                }

                setLoading(false);
            }
        );
    };


    /*
     * ============================================================
     * FETCH RESIDENT LIST
     * ============================================================
     *
     * Backend:
     * residentListMulti
     *
     * Required filter:
     * community_id
     *
     * Backend pagination:
     * page_no
     */

    const fetchResidentList = (page = 1) => {

        setResidentLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,

            page_no: page,

            // Current community ID
            community_id: stationId
        };

        postRequestWithToken(
            'resident-list',
            obj,
            (response) => {

                if (response.code === 200) {

                    const residents = (
                        response?.data || []
                    ).map((resident, index) => ({

                        ...resident,

                        /*
                         * Sr No is calculated based on
                         * current page.
                         *
                         * Backend limit = 10
                         */
                        sr_no:
                            ((page - 1) * 10) +
                            index +
                            1
                    }));

                    setResidentList(residents);

                    setResidentTotalPages(
                        response?.total_page || 1
                    );

                    setResidentTotalCount(
                        response?.total || 0
                    );

                } else {

                    console.log(
                        'error in resident-list API',
                        response
                    );

                    setResidentList([]);

                    setResidentTotalPages(1);

                    setResidentTotalCount(0);

                    toast(
                        response?.message ||
                        'Unable to fetch resident list',
                        {
                            type: 'error'
                        }
                    );
                }

                setResidentLoading(false);
            }
        );
    };


    /*
     * ============================================================
     * INITIAL LOAD
     * ============================================================
     */

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate('/login');
            return;
        }

        fetchDetails();

    }, []);


    /*
     * ============================================================
     * FETCH RESIDENTS
     * ============================================================
     *
     * stationId is the community_id.
     *
     * Whenever the community changes, resident list
     * is fetched from page 1.
     */

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token ||
            !stationId
        ) {
            return;
        }

        fetchResidentList(
            residentCurrentPage
        );

    }, [
        stationId,
        residentCurrentPage
    ]);


    /*
     * ============================================================
     * RESIDENT PAGE CHANGE
     * ============================================================
     */

    const handleResidentPageChange = (pageNumber) => {

        setResidentCurrentPage(
            pageNumber
        );

        // Scroll to resident section if required
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    };


    /*
     * ============================================================
     * COMMUNITY HEADER
     * ============================================================
     */

    const headerTitles = {

        bookingIdTitle: 'Community ID',

        stationDetailsTitle: 'Community Name'
    };


    /*
     * ============================================================
     * MANAGER DETAILS
     * ============================================================
     */

    const sectionTitles1 = {

        managerId: 'Manager Id',

        managerName: 'Manager Name',

        emailId: 'Email Id',

        contactNo: 'Contact No'
    };


    /*
     * ============================================================
     * COMMUNITY DETAILS
     * ============================================================
     */

    const sectionTitles2 = {

        areaName: 'Area Name',

        totalResidents: 'Total Residents',

        status: 'Status'
    };


    /*
     * ============================================================
     * HEADER CONTENT
     * ============================================================
     */

    const content = {

        bookingId:
            communityDetails?.community_id || 'N/A',
        createdAt:
            communityDetails?.created_at ? moment(communityDetails?.created_at).format("DD MMM YYYY, hh:mm A")
                : "N/A",

        stationName:
            communityDetails?.community_name || 'N/A'
    };


    /*
     * ============================================================
     * MANAGER CONTENT
     * ============================================================
     */

    const managerDetails = Array.isArray(manager)
        ? manager[0]
        : manager || {};


    const sectionContent1 = {

        managerId:
            managerDetails?.manager_id || 'N/A',

        managerName:
            managerDetails?.manager_name ||
            managerDetails?.name ||
            'N/A',

        emailId:
            managerDetails?.manager_email ||
            managerDetails?.email ||
            'N/A',

        contactNo:
            managerDetails?.manager_contact
                ? `${managerDetails?.country_code || ''} ${managerDetails.manager_contact}`
                : managerDetails?.contact
                    ? `${managerDetails?.country_code || ''} ${managerDetails.contact}`
                    : 'N/A'
    };


    /*
     * ============================================================
     * COMMUNITY CONTENT
     * ============================================================
     */

    const sectionContent2 = {

        areaName:
            communityDetails?.area_name || 'N/A',

        totalResidents:
            communityDetails?.total_residence ?? 0,

        status:
            communityDetails?.status === 1
                ? 'Active'
                : 'Un-Active'
    };


    /*
     * ============================================================
     * CHARGER TABLE
     * ============================================================
     */

    const chargerTableHeaders = [
        'Sr No',
        'Charger Id',
        'KW'
    ];


    const chargerKeyMapping = [

        {
            key: 'sr_no',
            label: 'Sr No'
        },

        {
            key: 'charger_id',
            label: 'Charger Id'
        },

        {
            key: 'kw',
            label: 'KW'
        }
    ];


    /*
     * ============================================================
     * RESIDENT TABLE
     * ============================================================
     */

    const residentTableHeaders = [

        'Sr No',

        'Resident Id',

        'Mobile',

        'Email',

        'Session Allocated',

        'Session Used',

        'kWh Allocated',

        'kWh Used',

        'Action'
    ];


    /*
     * ============================================================
     * RESIDENT KEY MAPPING
     * ============================================================
     */

    const residentKeyMapping = [

        {
            key: 'sr_no',
            label: 'Sr No'
        },

        {
            key: 'resident_id',
            label: 'Resident Id'
        },

        {
            key: 'resident_mobile',
            label: 'Mobile'
        },

        {
            key: 'resident_email',
            label: 'Email'
        },

        {
            key: 'monthly_session_allocation',
            label: 'Session Allocated'
        },

        {
            key: 'session_used',
            label: 'Session Used'
        },

        {
            key: 'kwh_allocated',
            label: 'kWh Allocated'
        },

        {
            key: 'kwh_used',
            label: 'kWh Used'
        },
    ];


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <div className="main-container">

            <ToastContainer />


            {loading ? (

                <Loader />

            ) : (

                <>

                    {/* ==================================================
                        COMMUNITY HEADER
                    ================================================== */}

                    <BookingDetailsHeader
                        content={content}
                        titles={headerTitles}
                        type="communityDetails"
                    />


                    {/* ==================================================
                        COMMUNITY / MANAGER DETAILS
                    ================================================== */}

                    <div
                        className={
                            styles.ChargerDetailsSection
                        }
                    >

                        {/* ================= MANAGER DETAILS ================= */}

                        <BookingLeftDetails

                            titles={sectionTitles1}

                            content={sectionContent1}

                            sectionTitles2={{}}

                            sectionContent2={{}}

                            sectionTitles4={{}}

                            sectionContent4={{}}

                            type="communityDetails"
                        />


                        {/* ================= COMMUNITY DETAILS ================= */}

                        <BookingLeftDetails

                            titles={sectionTitles2}

                            content={sectionContent2}

                            sectionTitles2={{}}

                            sectionContent2={{}}

                            sectionTitles4={{}}

                            sectionContent4={{}}

                            type="communityDetails"
                        />

                    </div>


                    {/* ==================================================
                        CHARGER LIST
                    ================================================== */}

                    <SubHeader

                        heading="Charger List"

                        addButtonProps={{}}

                        fetchFilteredData={() => { }}

                        dynamicFilters={[]}

                        filterValues={{}}

                        searchTerm={[]}

                        count={totalCount}
                    />


                    {chargers.length === 0 ? (

                        <EmptyList

                            tableHeaders={
                                chargerTableHeaders
                            }

                            message="No chargers available"
                        />

                    ) : (

                        <List

                            tableHeaders={
                                chargerTableHeaders
                            }

                            listData={chargers}

                            pageHeading="Charger List"

                            onDeleteSlot={() => { }}

                            keyMapping={
                                chargerKeyMapping
                            }

                        />

                    )}


                    {/* ==================================================
                        RESIDENT LIST
                    ================================================== */}

                    <SubHeader

                        heading="Resident List"

                        addButtonProps={{}}

                        fetchFilteredData={() => { }}

                        dynamicFilters={[]}

                        filterValues={{}}

                        searchTerm={[]}

                        count={residentTotalCount}
                    />


                    {residentLoading ? (

                        <Loader />

                    ) : residentList.length === 0 ? (

                        <EmptyList

                            tableHeaders={
                                residentTableHeaders
                            }

                            message="No residents available"
                        />

                    ) : (

                        <>

                            <List

                                tableHeaders={
                                    residentTableHeaders
                                }

                                listData={
                                    residentList
                                }

                                pageHeading="Resident List"

                                onDeleteSlot={() => { }}

                                keyMapping={
                                    residentKeyMapping
                                }

                            />


                            {/* ================= RESIDENT PAGINATION ================= */}

                            {residentTotalPages > 1 && (

                                <Pagination

                                    currentPage={
                                        residentCurrentPage
                                    }

                                    totalPages={
                                        residentTotalPages
                                    }

                                    onPageChange={
                                        handleResidentPageChange
                                    }

                                />

                            )}

                        </>

                    )}

                </>

            )}

        </div>
    );
};


export default CommunityDetails;