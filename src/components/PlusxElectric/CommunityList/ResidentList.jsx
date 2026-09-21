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

const dynamicFilters = [];

const PublicResidentList = () => {
    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();

    const [residentList, setResidentList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(null);

    const [filters, setFilters] = useState({
        start_date: null,
        end_date: null
    });

    const [loading, setLoading] = useState(false);

    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ];

    const addButtonProps = {
        heading: "Add Resident",
        link: "/electric/community/add-resident"
    };

    const fetchList = (page, appliedFilters = {}) => {

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
            ...appliedFilters,
        };

        postRequestWithToken(
            'resident-list',
            obj,
            async (response) => {

                if (response.code === 200) {

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
                }

                setLoading(false);
            }
        );
    };

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate('/login');
            return;
        }

        fetchList(
            currentPage,
            filters
        );

    }, [currentPage, filters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleDeleteResident = (residentId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this resident?"
        );

        if (!confirmDelete) {
            return;
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_id: residentId
        };

        postRequestWithToken(
            'resident-delete',
            obj,
            async (response) => {

                if (response.code === 200) {

                    toast(
                        response.message,
                        { type: "success" }
                    );

                    setTimeout(() => {
                        fetchList(
                            currentPage,
                            filters
                        );
                    }, 1000);

                } else {

                    toast(
                        response.message,
                        { type: 'error' }
                    );

                    console.log(
                        'error in resident-delete api',
                        response
                    );
                }
            }
        );
    };

    return (
        <div className='main-container'>

            <ToastContainer />

            <SubHeader
                heading="Total Resident List"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            />

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
                        listData={residentList}
                        pageHeading="Total Resident List"
                        onDeleteSlot={handleDeleteResident}

                        keyMapping={[
                            {
                                key: 'resident_id',
                                label: 'Resident Id'
                            },
                            {
                                key: 'resident_name',
                                label: 'Resident Name'
                            },
                            {
                                key: 'monthly_session_allocation',
                                label: 'Session Allocated',
                                format: (value) =>
                                    value ?? 0
                            },
                            {
                                key: 'session_used',
                                label: 'Session Used',
                                format: (value) =>
                                    value ?? 0
                            },
                            {
                                key: 'kwh_allocated',
                                label: 'kWh',
                                format: (value) =>
                                    value ?? 0
                            },
                            {
                                key: 'kwh_used',
                                label: 'kWh Used',
                                format: (value) =>
                                    value ?? 0
                            }
                        ]}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>

            )}

        </div>
    );
};

export default PublicResidentList;