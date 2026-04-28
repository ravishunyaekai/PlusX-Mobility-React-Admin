import React, { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List.jsx';
import styles from './RideList.module.css';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader.jsx';
import Pagination from '../../SharedComponent/Pagination/Pagination.jsx';
import { postRequestWithToken, postRequest } from '../../../api/Requests.js';
import moment from 'moment'; 
// import AddDriver from '../../../assets/images/AddDriver.svg';
// import Cancel from '../../../assets/images/Cancel.svg';
import View from '../../../assets/images/ViewEye.svg'
// import ModalAssign from '../../SharedComponent/BookingDetails/ModalAssign.jsx'
// import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
// import Custommodal from '../../SharedComponent/CustomModal/CustomModal.jsx';
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';

    const statusMapping = {
        'CNF': 'Booking Confirmed',
        'ON': 'On Going',
        'C': 'cancelled',
    };

    const dynamicFilters = [
        {
            label : 'Status', 
            name  : 'status', 
            type  : 'select', 
            options : [
                { value : '',    label : 'Select Status' },
                { value : 'CNF', label : 'Booking Confirmed' },
                { value : 'A',   label : 'Assigned' },
                { value : 'ER',  label : 'Enroute' },
                { value : 'RL',  label : 'POD Reached at Location' },
                { value : 'CS',  label : 'Charging Started' },
                { value : 'CC',  label : 'Charging Completed' },
                { value : 'PU',  label : 'Completed' },
                { value : 'C',   label : 'Cancelled' },
                { value : 'RO',   label : 'POD Reached at Office' },
            ]
        },
    ];
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

const FailedRideList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                    = useNavigate();
    const { customerId }                              = useParams()
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [totalCount, setTotalCount]                 = useState(null);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null});
    const [scheduleFilters, setScheduleFilters]       = useState({start_date: null,end_date: null});
    
    const [loading, setLoading]                       = useState(false);
    const [downloadClicked, setDownloadClicked]       = useState(false)
    
    const handleBookingDetails = (id) => navigate(`/mobility/ride/ride-incomplete-booking-details/${id}`)

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
            customerId,
            ...appliedFilters,
            scheduleFilters,
        };
        postRequestWithToken('failed-cycle-booking-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in failed-cycle-booking-list api', response);
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
    
    return (
        <div className='main-container'>
            <SubHeader
                heading             = "Incomplete Ride Booking List"
                fetchFilteredData   = {fetchFilteredData}
                // dynamicFilters      = {dynamicFilters}
                filterValues        = {filters}
                searchTerm          = {searchTerm}
                count               = {totalCount} 
                // scheduleDateChange  = {scheduleFilteredData}
                // scheduleFilters     = {scheduleFilters}
            />
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders = {[ "Date", "Booking ID", "Customer Name", "Mobile No.", "Pickup Station", "City", "Cycle ID", "Action" ]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={[ "Date", "Booking ID", "Customer Name", "Mobile No.", "Pickup Station", "City", "Cycle ID", "Action" ]}
                        listData={chargerBookingList}
                        keyMapping={[
                            { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'booking_id', label: 'Booking ID' },
                            { key: 'user_name', label: 'Customer Name' }, 
                            { key: 'contact_no', label: 'Mobile No.' },

                            { key: 'pickup_station', label: 'Pickup Station' },
                            { key: 'city', label: 'City' },
                            { key: 'cycle_id', label: 'Cycle ID' },
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
                        pageHeading="Incomplete Ride Booking List"
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


export default FailedRideList;
