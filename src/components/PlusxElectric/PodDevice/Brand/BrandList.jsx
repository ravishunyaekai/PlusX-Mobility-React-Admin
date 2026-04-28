import React, { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List'
import styles from './addcharger.module.css'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { getRequestWithToken, postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment'; 
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const PodBrandList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate()
    const [chargerList, setChargerList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [refresh, setRefresh]         = useState(false)
    const [filters, setFilters]         = useState({});
    
    const searchTerm = [{
        label : 'search', 
        name  : 'search_text', 
        type  : 'text'
    }]
    const addButtonProps = {
        heading : "Add Brand", 
        link    : "/home-charger/add-brand"
    };
    const fetchChargers = (page, appliedFilters = {}) => {
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        };

        getRequestWithToken('pod-brand-list', obj, (response) => {
            if (response.code === 200) {
                setChargerList(response?.data || []);  
                setTotalPages(response?.data?.total_pages || 1);  
            } else {
                console.log('error in brand-list API', response);
            }
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchChargers(currentPage, filters);
    }, [currentPage, filters, refresh]);

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className='main-container'>
            <SubHeader 
                heading = "POD Brand List" 
                addButtonProps={addButtonProps}
                filterValues={filters}
                fetchFilteredData={fetchFilteredData} 
                searchTerm = {searchTerm}
            />
            <ToastContainer />
            {chargerList.length === 0 ? (
                <EmptyList tableHeaders={["Device ID", "Brand Name", "Start Date", "End Date", "Action"]} message="No data available" />
            ) : (
                <List
                    tableHeaders={["Device ID", "Brand Name", "Start Date", "End Date", "Action"]}
                    listData={chargerList}
                    pageHeading="POD Brand List"
                    keyMapping={[
                        { key : 'device_id',    label  : 'Device ID' }, 
                        { key : 'brand_name',   label : 'Brand Name' }, 
                        { key : 'start_date',   label  : 'Start Date',  format : (date) => moment(date).format('DD MMM YYYY')},
                        { key : 'end_date',     label  : 'End Date',    format : (date) => moment(date).format('DD MMM YYYY')},
                    ]}
                />
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default PodBrandList;
