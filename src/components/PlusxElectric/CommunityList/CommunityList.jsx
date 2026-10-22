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

const PublicCommunityList = () => {
    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();

    const [communityList, setCommunityList] = useState([]);
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
        heading: "Add Community",
        link: "/electric/community/add-community"
    };

    const fetchList = (page, appliedFilters = {}) => {

        if (page === 1 && Object.keys(appliedFilters).length === 0) {
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
            'community-list',
            obj,
            async (response) => {

                if (response.code === 200) {

                    setCommunityList(response?.data || []);

                    setTotalPages(
                        response?.total_page || 1
                    );

                    setTotalCount(
                        response?.total || 0
                    );

                } else {

                    console.log(
                        'Error in community-list API',
                        response
                    );

                    setCommunityList([]);
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

    const handleDeleteCommunity = (communityId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this community?"
        );

        if (!confirmDelete) {
            return;
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            community_id: communityId
        };

        postRequestWithToken(
            'community-delete',
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
                        'Error in community-delete API',
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
                heading="Total Community List"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            />

            {loading ? (

                <Loader />

            ) : communityList.length === 0 ? (

                <EmptyList
                    tableHeaders={[
                        "Community Name",
                        "Area",
                        "Total Residents",
                        "No. of Chargers",
                        "Action"
                    ]}
                    message="No data available"
                />

            ) : (

                <>
                    <List
                        tableHeaders={[
                            "Community Name",
                            "Area",
                            "Total Residents",
                            "No. of Chargers",
                            "Action"
                        ]}
                        listData={communityList}
                        pageHeading="Total Community List"
                        onDeleteSlot={handleDeleteCommunity}

                        keyMapping={[
                            {
                                key: 'community_name',
                                label: 'Community Name'
                            },
                            {
                                key: 'area_name',
                                label: 'Area'
                            },
                            {
                                key: 'total_residence',
                                label: 'Total Residents'
                            },
                            {
                                key: 'no_of_chargers',
                                label: 'No. of Chargers'
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

export default PublicCommunityList;