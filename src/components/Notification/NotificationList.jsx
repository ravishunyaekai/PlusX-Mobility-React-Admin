import { useEffect, useState } from 'react';
// import styles from './notification.module.css'
import List from '../SharedComponent/List/List'
import SubHeader from '../SharedComponent/SubHeader/SubHeader'
import Pagination from '../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import EmptyList from '../SharedComponent/EmptyList/EmptyList';
import Loader from "../SharedComponent/Loader/Loader";

const NotificationList = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                              = useNavigate()
    const [notifications, setNotifications]     = useState([]);
    const [currentPage, setCurrentPage]         = useState(1);
    const [totalPages, setTotalPages]           = useState(1);
    const [filters, setFilters]                 = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]                 = useState(false)
    const [emiratesList, setEmiratesList]       = useState([]);
    const [loading, setLoading]                 = useState(false);
    
    const fetchList = (page, appliedFilters = {}) => {
        setLoading(true);
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        };

        postRequestWithToken('notification-list', obj, (response) => {
            if (response.code === 200) {
                setNotifications(response?.data || []);  
                setEmiratesList(response.emirates || []);
                setTotalPages(response?.total_page || 1);  
            } else {
                toast(response.message || response.message[0], { type: 'error' });
                console.log('error in notification-list API', response);
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
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };

    const handleDeleteSlot = (riderId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId   : userDetails?.user_id,
                email    : userDetails?.email,
                rider_id : riderId 
            };
            postRequestWithToken('delete-rider', obj, async (response) => {
                if (response.code === 200) {
                    setRefresh(prev => !prev);
                    toast(response.message[0], { type: "success" });
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in delete-rider api', response);
                }
            });
        }
    };

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
            { loading ? <Loader /> : 
                <>
                    <SubHeader heading= "Notification List" fetchFilteredData= {fetchFilteredData} dynamicFilters= {dynamicFilters} filterValues={filters} searchTerm = {searchTerm} />
                    {notifications.length === 0 ? (
                        <EmptyList tableHeaders={["Date", "Notification ID", "Heading", "Description"]} message="No data available" />
                    ) : (
                        <List
                            tableHeaders={["Date", "Notification ID", "Heading", "Description"]}
                            listData={notifications}
                            pageHeading="Notification List"
                            keyMapping={[
                                { key: 'created_at',    label: 'Date', format: (date) => moment(date).format('DD MMM YYYY')},
                                { key: 'id',            label: 'Notification ID' },
                                { key: 'heading',       label: 'Heading' },
                                { key: 'description',   label: 'Description' },
                                // { key: 'emirates',    label: 'Emirate' },
                            ]}
                            // onDeleteSlot={handleDeleteSlot}
                        />
                    )}
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            }
        </div>
    );
};


export default NotificationList;
