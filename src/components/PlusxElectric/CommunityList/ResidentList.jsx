import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const PublicResidentList = () => {
    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();

    // =========================================================
    // RESIDENT LIST STATE
    // =========================================================

    const [residentList, setResidentList] = useState([]);

    const [scheduleFilters, setScheduleFilters] =
        useState(null);
    const [currentPage, setCurrentPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);

    const [totalCount, setTotalCount] =
        useState(null);

    // =========================================================
    // COMMUNITY FILTER STATE
    // =========================================================

    const [communityOptions, setCommunityOptions] =
        useState([]);

    const [communityLoading, setCommunityLoading] =
        useState(false);

    // =========================================================
    // FILTER STATE
    // =========================================================

    const [filters, setFilters] = useState({
        start_date: null,
        end_date: null,
        community: '',
        search_text: ''
    });

    // =========================================================
    // LOADING
    // =========================================================

    const [loading, setLoading] =
        useState(false);

    // =========================================================
    // SEARCH
    // =========================================================

    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ];

    // =========================================================
    // ADD BUTTON
    // =========================================================

    const addButtonProps = {
        heading: "Add Resident",
        link: "/electric/community/add-resident"
    };

    // =========================================================
    // DYNAMIC FILTERS
    // =========================================================

    const dynamicFilters = [
        {
            label: 'Community',
            name: 'community',
            type: 'select',
            options: [
                {
                    value: '',
                    label: 'Select Community'
                },
                ...communityOptions
            ]
        }
    ];

    // =========================================================
    // GET ALL COMMUNITY LIST
    // =========================================================

    const getAllCommunityList = () => {
        if (!userDetails?.user_id) {
            return;
        }

        setCommunityLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email
        };

        console.log(
            "========== ALL COMMUNITY LIST REQUEST =========="
        );

        console.log(obj);

        postRequestWithToken(
            'all-community-list',
            obj,
            (response) => {
                console.log(
                    "========== ALL COMMUNITY LIST RESPONSE =========="
                );

                console.log(response);

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    const options =
                        Array.isArray(response?.data)
                            ? response.data
                            : [];

                    /*
                     * Make sure every option has:
                     *
                     * {
                     *     value: community_id,
                     *     label: community_name
                     * }
                     */

                    const formattedOptions =
                        options
                            .map((community) => {
                                const value =
                                    community?.value ||
                                    community?.community_id ||
                                    community?.communityId ||
                                    "";

                                const label =
                                    community?.label ||
                                    community?.community_name ||
                                    community?.communityName ||
                                    community?.name ||
                                    "";

                                if (!value) {
                                    return null;
                                }

                                return {
                                    value: String(value),
                                    label:
                                        String(label) ||
                                        String(value)
                                };
                            })
                            .filter(Boolean);

                    setCommunityOptions(
                        formattedOptions
                    );
                } else {
                    setCommunityOptions([]);

                    toast.error(
                        Array.isArray(response?.message)
                            ? response.message.join(", ")
                            : response?.message ||
                            "Unable to fetch community list."
                    );

                    console.error(
                        "Error in all-community-list API:",
                        response
                    );
                }

                setCommunityLoading(false);
            }
        );
    };

    // =========================================================
    // FETCH RESIDENT LIST
    // =========================================================

    const fetchList = (
        page,
        appliedFilters = {}
    ) => {

        if (
            page === 1 &&
            Object.keys(appliedFilters).length === 0
        ) {
            setLoading(false);
        } else {
            setLoading(true);
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            ...appliedFilters
        };

        console.log(
            "========== RESIDENT LIST REQUEST =========="
        );

        console.log(obj);

        postRequestWithToken(
            'resident-list',
            obj,
            async (response) => {

                console.log(
                    "resident-list response:",
                    response
                );

                if (
                    response?.code === 200
                ) {
                    setResidentList(
                        response?.data || []
                    );

                    setTotalPages(
                        response?.total_page || 1
                    );

                    setTotalCount(
                        response?.total || 0
                    );
                } else {

                    console.log(
                        'error in resident-list api',
                        response
                    );

                    setResidentList([]);
                    setTotalPages(1);
                    setTotalCount(0);

                    if (response?.message) {
                        toast.error(
                            Array.isArray(
                                response.message
                            )
                                ? response.message.join(
                                    ", "
                                )
                                : response.message
                        );
                    }
                }

                setLoading(false);
            }
        );
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate('/login');
            return;
        }

        // Get community options first
        getAllCommunityList();

        // Get residents
        fetchList(
            currentPage,
            filters
        );

    }, []);

    // =========================================================
    // FETCH LIST WHEN PAGE OR FILTER CHANGES
    // =========================================================

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            return;
        }

        fetchList(
            currentPage,
            filters
        );

    }, [
        currentPage,
        filters
    ]);

    // =========================================================
    // PAGE CHANGE
    // =========================================================

    const handlePageChange = (
        pageNumber
    ) => {
        setCurrentPage(
            pageNumber
        );
    };

    // =========================================================
    // FILTER CHANGE
    // =========================================================

    const fetchFilteredData = (newFilters = {}) => {
        console.log("Selected filters:", newFilters);

        setFilters({
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null,
            community: newFilters?.community || '',
            search_text: newFilters?.search_text || ''
        });

        setCurrentPage(1);
    };

    // =========================================================
    // DELETE RESIDENT
    // =========================================================

    const handleDeleteResident = (
        residentId
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this resident?"
            );

        if (!confirmDelete) {
            return;
        }

        const obj = {
            userId:
                userDetails?.user_id,

            email:
                userDetails?.email,

            resident_id:
                residentId
        };

        console.log(
            "resident-delete request:",
            obj
        );

        postRequestWithToken(
            'resident-delete',
            obj,
            async (response) => {

                if (
                    response?.code === 200 &&
                    response?.status === 1
                ) {

                    toast(
                        response?.message ||
                        "Resident deleted successfully.",
                        {
                            type: "success"
                        }
                    );

                    setTimeout(() => {

                        fetchList(
                            currentPage,
                            filters
                        );

                    }, 1000);

                } else {

                    toast(
                        Array.isArray(
                            response?.message
                        )
                            ? response.message.join(
                                ", "
                            )
                            : response?.message ||
                            "Failed to delete resident.",
                        {
                            type: 'error'
                        }
                    );

                    console.log(
                        'error in resident-delete api',
                        response
                    );
                }
            }
        );
    };

    const scheduleFilteredData = (newFilters = {}) => {
        setScheduleFilters(newFilters);
        setCurrentPage(1);
    };
    // =========================================================
    // UI
    // =========================================================

    return (
        <div className='main-container'>

            <ToastContainer />

            {/* =================================================
                SUB HEADER
            ================================================= */}

            <SubHeader
                heading="Total Resident List"

                addButtonProps={
                    addButtonProps
                }

                fetchFilteredData={
                    fetchFilteredData
                }

                dynamicFilters={
                    dynamicFilters
                }

                filterValues={
                    filters
                }

                searchTerm={
                    searchTerm
                }

                count={
                    totalCount
                }
                scheduleDateChange={scheduleFilteredData}
                scheduleFilters={scheduleFilters}
            />

            {/* =================================================
                COMMUNITY LOADING
            ================================================= */}

            {communityLoading && (
                <Loader />
            )}

            {/* =================================================
                RESIDENT LIST
            ================================================= */}

            {loading ? (

                <Loader />

            ) : residentList.length === 0 ? (

                <EmptyList
                    tableHeaders={[
                        "Resident Id",
                        "Resident Name",
                        "Session Allocated",
                        "Session Used",
                        "kWh",
                        "kWh Used",
                        "Action"
                    ]}
                    message="No data available"
                />

            ) : (

                <>

                    <List
                        tableHeaders={[
                            "Resident Id",
                            "Resident Name",
                            "Session Allocated",
                            "Session Used",
                            "kWh",
                            "kWh Used",
                            "Action"
                        ]}

                        listData={
                            residentList
                        }

                        pageHeading={
                            "Total Resident List"
                        }

                        onDeleteSlot={
                            handleDeleteResident
                        }

                        keyMapping={[
                            {
                                key:
                                    'resident_id',

                                label:
                                    'Resident Id'
                            },

                            {
                                key:
                                    'resident_name',

                                label:
                                    'Resident Name'
                            },

                            {
                                key:
                                    'monthly_session_allocation',

                                label:
                                    'Session Allocated',

                                format:
                                    (value) =>
                                        value ?? 0
                            },

                            {
                                key:
                                    'session_used',

                                label:
                                    'Session Used',

                                format:
                                    (value) =>
                                        value ?? 0
                            },

                            {
                                key:
                                    'kwh_allocated',

                                label:
                                    'kWh',

                                format:
                                    (value) =>
                                        value ?? 0
                            },

                            {
                                key:
                                    'kwh_used',

                                label:
                                    'kWh Used',

                                format:
                                    (value) =>
                                        value ?? 0
                            }
                        ]}
                    />

                    <Pagination
                        currentPage={
                            currentPage
                        }

                        totalPages={
                            totalPages
                        }

                        onPageChange={
                            handlePageChange
                        }
                    />

                </>

            )}

        </div>
    );
};

export default PublicResidentList;
