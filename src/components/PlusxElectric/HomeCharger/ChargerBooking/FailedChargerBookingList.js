import React, { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken, postRequest } from '../../../../api/Requests';
import moment from 'moment'; 

import View from '../../../../assets/images/ViewEye.svg'

import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import Custommodal from '../../../SharedComponent/CustomModal/CustomModal.jsx';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList.jsx';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';

    const statusMapping = {
        'PNR' : 'Payment Not Received',
    };
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

const FailedChargerBookingList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                    = useNavigate();
    
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [totalCount, setTotalCount]                 = useState(null);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null});
    const [scheduleFilters, setScheduleFilters]       = useState({start_date: null,end_date: null});
   
    const [loading, setLoading]                       = useState(false);
    const [downloadClicked, setDownloadClicked]       = useState(false)

    const handleBookingDetails = (id) => navigate(`/electric/home-charger/failed-charger-booking-details/${id}`)

    const fetchList = (page, appliedFilters = {}, scheduleFilters = {}) => {
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
            scheduleFilters,
        };
        postRequestWithToken('failed-charger-booking-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
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
        fetchList(currentPage, filters, scheduleFilters);
    }, [currentPage, filters, scheduleFilters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const scheduleFilteredData = (newFilters = {}) => {
        setScheduleFilters(newFilters);
        setCurrentPage(1);
    };
    const handleDownloadClick = async() => {
        const { start_date, end_date, status, search_text } = filters;
        
        // let url = `http://192.168.1.10:3000/admin/pod-booking-list-download`;
        let url = process.env.REACT_APP_SERVER_URL+'admin/pod-booking-list-download';
    
        // Append query parameters only if they are not null or undefined
        const params = new URLSearchParams();
        params.append('status', 'PNR');
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        // if (status) params.append('status', status);
        if (search_text) params.append('search_text', search_text);
        if (scheduleFilters?.start_date) params.append('scheduled_start_date', scheduleFilters.start_date);
        if (scheduleFilters?.end_date) params.append('scheduled_end_date', scheduleFilters.end_date);
        
        // If any query parameters were added, append them to the URL
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await axios.get(url, { responseType: 'blob' });

            const blob = new Blob([response.data], {
                type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link    = document.createElement('a');
            link.href     = window.URL.createObjectURL(blob);
            link.download = 'pod_booking_list.xlsx';
            link.click(); 
        } catch (error) {
            console.error('Error downloading file:', error);
        }      
    }
    return (
        <div className='main-container'>
            <SubHeader
                heading             = "Failed Charger Booking List"
                fetchFilteredData   = {fetchFilteredData}
                filterValues        = {filters}
                searchTerm          = {searchTerm}
                count               = {totalCount}
                setDownloadClicked  = {setDownloadClicked}
                handleDownloadClick = {handleDownloadClick}  
                scheduleDateChange  = {scheduleFilteredData}
                scheduleFilters     = {scheduleFilters}
            />
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Booking Date", "Schedule Date", "Schedule Time", "Booking ID", "Customer Name", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (  
                <>
                    <List
                        tableHeaders={["Booking Date", "Schedule Date", "Schedule Time", "Booking ID", "Customer Name", "Status", "Action",""]}
                        listData={chargerBookingList}
                        pageHeading="Failed Charger Booking List"
                        keyMapping={[
                            { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'slot_date', label: 'Schedule Date', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'slot_time', label: 'Schedule Time', format: (date) => moment(date).format(' hh:mm A') },
                            { key: 'booking_id', label: 'ID' },
                            { key: 'user_name', label: 'Customer Name' },
                            // { key: 'service_price', label: 'Price', format: (price) => (price ? `INR ${price}` : '') },   
                            { key: 'status', label: 'Status', format: (status) => statusMapping[status] || status },                    
                            {
                                key: 'action',
                                label: 'Action',
                                relatedKeys: ['status'], 
                                format: (data, key, relatedKeys) => {
                                    return (
                                        <div className="editButtonSection">
                                            <img src={View} alt="view" className="viewButton"
                                                onClick={() => handleBookingDetails(data.booking_id)} 
                                            />
                                        </div>
                                    );
                                }
                            }
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default FailedChargerBookingList;
