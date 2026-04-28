import React, { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { getRequestWithToken, postRequestWithToken } from '../../../../api/Requests';

import AddDriver from '../../../../assets/images/AddDriver.svg';
// import { toast, ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import Loader from "../../../SharedComponent/Loader/Loader";

const searchTerm = [
    {
        label: 'search', 
        name: 'search_text', 
        type: 'text'
    }
]

const PodAreaList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [areaList, setAreaList]       = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [filters, setFilters]         = useState({start_date: null,end_date: null}); 
    const [loading, setLoading]         = useState(false);

    const fetchList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }

        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        };
        postRequestWithToken('pod-area-list', obj, async (response) => {
            if (response.code === 200) {
                setAreaList(response?.data);
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in charger-booking-list api', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters);
    }, [currentPage, filters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    const addButtonProps = {
        heading : "Add Area", 
        link    : "/electric/home-charger/add-area"
    };
    return (
        <div className='main-container'>
            <SubHeader
                heading="Home Charger Area List"
                fetchFilteredData={fetchFilteredData}
                addButtonProps={addButtonProps}
                filterValues={filters}
                searchTerm = {searchTerm}
            />

            {loading ? <Loader /> :
                areaList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Area ID", "Area Name", "Created Date", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={[ "Area ID", "Area Name", "Created Date", "Status", "Action"]}
                        listData={areaList}
                        pageHeading="Home Charger Area List"
                        keyMapping={[
                            { key: 'area_id', label: 'Area ID' },
                            { key: 'area_name', label: 'Area Name' },
                            { key: 'created_at', label: 'Created Date', format: (date) => moment(date).format('DD MMM YYYY')  },
                            { key: 'status', label: 'Status', format: (status) => status == 1 ? 'Active' : 'Inactive' },
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default PodAreaList;