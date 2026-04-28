import { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const DeletedSignupList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [signupList, setSignupList]     = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(null);
    const [filters, setFilters]           = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]           = useState(false);
    const [emiratesList, setEmiratesList] = useState([]);
    const [loading, setLoading]           = useState(false);
    
    const fetchChargers = (page, appliedFilters = {}) => {
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

        postRequestWithToken('mobility-deleted-rider-list', obj, (response) => {
            if (response.code === 200) {
                setSignupList(response?.data || []);  
                setEmiratesList(response.emirates || []);
                setTotalPages(response?.total_page || 1);  
                setTotalCount(response?.total || 0)
            } else {
                toast(response.message || response.message[0], { type: 'error' });
                console.log('error in rider-list API', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchChargers(currentPage, filters);
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };

    // const handleDeleteSlot = (riderId) => {
    //     const confirmDelete = window.confirm("Are you sure you want to delete this?");
    //     if (confirmDelete) {
    //         const obj = { 
    //             userId   : userDetails?.user_id,
    //             email    : userDetails?.email,
    //             rider_id : riderId 
    //         };
    //         postRequestWithToken('delete-rider', obj, async (response) => {
    //             if (response.code === 200) {
    //                 setRefresh(prev => !prev);
    //                 toast(response.message[0], { type: "success" });
    //             } else {
    //                 toast(response.message, { type: 'error' });
    //                 console.log('error in delete-rider api', response);
    //             }
    //         });
    //     }
    // };

    const dynamicFilters = [
        {
            label : 'Location', 
            name  : 'emirates', 
            type  : 'select', 
            options: [
                { value: '', label: 'Select Location' },
                ...emiratesList.map(emirate => ({
                    value: emirate.emirates,
                    label: emirate.emirates
                }))
            ]
        },
        {
            label : 'Device By', 
            name  : 'addedFrom', 
            type  : 'select', 
            options: [
                { value: '',        label: 'Select Device' },
                { value: 'Android', label: 'Android' },
                { value: 'iOS',     label: 'iOS' }
            ]
        },
        
    ]
    
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

    return (
        <div className='main-container'>
            <ToastContainer/>
            <SubHeader 
                heading             = "Total Deleted Account List" 
                fetchFilteredData   = {fetchFilteredData} 
                dynamicFilters      = {dynamicFilters} 
                filterValues        = {filters}
                searchTerm          = {searchTerm}
                count               = {totalCount}
                // handleDownloadClick = {handleDownloadClick}
            />

            {loading ? <Loader /> :
                signupList.length === 0 ? 
                    <EmptyList
                        tableHeaders={["Date", "Customer ID", "Customer Name",  "Phone No.","State", "City"]}
                        message="No data available"
                    />
                : <>
                     <List
                        tableHeaders={["Date", "Customer ID", "Customer Name",  "Phone No.","State", "City"]}
                        pageHeading="Total Deleted Account List"
                        listData={signupList}
                        keyMapping={[
                            { key: 'created_at', label: 'Date', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'rider_id',    label: 'Customer ID' },
                            { key: 'rider_name',  label: 'Customer Name' },
                            { key: 'rider_mobile', label: 'Phone' },
                            { key: 'state', label: 'State' },
                            { key: 'city', label: 'City' },
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/>
                </> 
            }
        </div>
    );
};

export default DeletedSignupList;
