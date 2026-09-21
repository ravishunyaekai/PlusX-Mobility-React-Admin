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

const CommunityDetails = () => {

    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();
    const { stationId } = useParams();

    const [bookingDetails, setBookingDetails] = useState({});
    const [chargers, setChargers] = useState([]);
    const [manager, setManager] = useState([]);

    const [loading, setLoading] = useState(false);

    const [totalCount, setTotalCount] = useState(0);
    const [totalCount2, setTotalCount2] = useState(0);

    /*
     * ============================
     * FETCH COMMUNITY DETAILS
     * ============================
     */
    const fetchDetails = () => {

        setLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,

            // Backend expects community_id
            community_id: stationId
        };

        postRequestWithToken(
            'community-details',
            obj,
            (response) => {

                if (response.code === 200) {

                    /*
                     * Community details
                     */
                    setBookingDetails(
                        response?.data || {}
                    );

                    /*
                     * Charger list
                     *
                     * Add Sr No dynamically.
                     */
                    const chargerList = (
                        response?.chargers || []
                    ).map((charger, index) => ({
                        ...charger,
                        sr_no: index + 1
                    }));

                    setChargers(chargerList);

                    /*
                     * Manager details
                     */
                    setManager(
                        response?.manager || []
                    );

                    /*
                     * Charger count
                     */
                    setTotalCount(
                        chargerList.length
                    );

                    /*
                     * Resident list is not currently
                     * returned by the backend.
                     */
                    setTotalCount2(0);

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
     * ============================
     * INITIAL LOAD
     * ============================
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
     * ============================
     * COMMUNITY HEADER
     * ============================
     */
    const headerTitles = {

        bookingIdTitle: 'Community ID',

        stationDetailsTitle: 'Community Name'
    };

    /*
     * ============================
     * MANAGER DETAILS
     * ============================
     */
    const sectionTitles1 = {

        managerId: 'Manager Id',

        managerName: 'Manager Name',

        emailId: 'Email Id',

        contactNo: 'Contact No'
    };

    /*
     * ============================
     * COMMUNITY DETAILS
     * ============================
     */
    const sectionTitles2 = {

        areaName: 'Area Name',

        totalResidents: 'Total Residents',

        status: 'Status'
    };

    /*
     * ============================
     * HEADER CONTENT
     * ============================
     */
    const content = {

        bookingId:
            bookingDetails?.community_id || 'N/A',

        stationName:
            bookingDetails?.community_name || 'N/A'
    };

    /*
     * ============================
     * MANAGER CONTENT
     * ============================
     *
     * Backend returns manager as an array.
     * Take the first manager.
     */
    const managerDetails = Array.isArray(manager)
        ? manager[0]
        : manager || {};

    const sectionContent1 = {

        managerId:
            managerDetails?.manager_id || 'N/A',

        managerName:
            managerDetails?.manager_name || 'N/A',

        emailId:
            managerDetails?.manager_email || 'N/A',

        contactNo:
            managerDetails?.manager_contact
                ? `${managerDetails?.country_code || ''} ${managerDetails.manager_contact}`
                : 'N/A'
    };

    /*
     * ============================
     * COMMUNITY CONTENT
     * ============================
     */
    const sectionContent2 = {

        areaName:
            bookingDetails?.area_name || 'N/A',

        totalResidents:
            bookingDetails?.total_residence ?? 0,

        status:
            bookingDetails?.status === 1
                ? 'Active'
                : 'Un-Active'
    };

    /*
     * ============================
     * CHARGER TABLE
     * ============================
     */
    const chargerTableHeaders = [
        'Sr No',
        'Charger Id',
        'KW'
    ];

    /*
     * Important:
     *
     * Sr No is now coming from `sr_no`
     * which is added while fetching data.
     */
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
     * ============================
     * RESIDENT TABLE
     * ============================
     *
     * Resident data is not currently
     * returned from community-details API.
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
     * ============================
     * RENDER
     * ============================
     */
    return (

        <div className="main-container">

            <ToastContainer />

            {loading ? (

                <Loader />

            ) : (

                <>

                    {/* ================= COMMUNITY HEADER ================= */}

                    <BookingDetailsHeader
                        content={content}
                        titles={headerTitles}
                        type="communityDetails"
                    />



                    {/* ================= COMMUNITY / MANAGER DETAILS ================= */}

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



                    {/* ================= CHARGER LIST ================= */}

                    <SubHeader

                        heading="Charger List"

                        addButtonProps={{}}

                        fetchFilteredData={() => {}}

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

                            onDeleteSlot={() => {}}

                            keyMapping={
                                chargerKeyMapping
                            }
                        />

                    )}



                    {/* ================= RESIDENT LIST ================= */}

                    <SubHeader

                        heading="Resident List"

                        addButtonProps={{}}

                        fetchFilteredData={() => {}}

                        dynamicFilters={[]}

                        filterValues={{}}

                        searchTerm={[]}

                        count={totalCount2}
                    />



                    <EmptyList

                        tableHeaders={
                            residentTableHeaders
                        }

                        message="No resident data available"
                    />

                </>

            )}

        </div>
    );
};

export default CommunityDetails;