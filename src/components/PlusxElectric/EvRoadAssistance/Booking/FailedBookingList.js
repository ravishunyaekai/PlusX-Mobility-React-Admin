import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List';
import styles from './roadassistance.module.css'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment'; 

import View from '../../../../assets/images/ViewEye.svg'
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList.jsx';

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
    const [loading, setLoading]                       = useState(false);

    const handleBookingDetails = (id) => navigate(`/electric/ev-road-assistance/failed-booking-details/${id}`)

    const fetchList = (page, appliedFilters = {}, ) => {
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
        postRequestWithToken('failed-road-assistance-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in rsa-booking-list api', response);
            }
            setLoading(false);
        });       
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters );
    }, [currentPage, filters ]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    return (
        <div className='main-container'>
            <SubHeader
                heading           = "Failed RSA Booking List"
                fetchFilteredData = {fetchFilteredData}
                filterValues      = {filters}
                searchTerm        = {searchTerm}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (  
                <>
                    <List
                        tableHeaders={["Booking Date", "Booking ID", "Customer Name", "Price", "Status", "Action",""]}
                        listData={chargerBookingList}
                        pageHeading="Failed Ev Road Assitance Booking List"
                        keyMapping={[
                            { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY hh:mm A') },
                            { key: 'request_id', label: 'Order ID' },
                            { key: 'name', label: 'Customer Name' },
                            { key: 'price', label: 'Price', format: (price) => (price ? `INR ${price.toFixed(2)}` : '') },
                            { key: 'order_status', label: 'Status', format: (status) => statusMapping[status] || status },
                            {
                                key         : 'action',
                                label       : 'Action',
                                relatedKeys : ['order_status'], 
                                format: (data, key, relatedKeys) => {
                                    return (
                                        <div className="editButtonSection">
                                            <img 
                                                src={View} 
                                                alt="view" 
                                                onClick={() => handleBookingDetails(data.request_id)}
                                                className="viewButton"
                                            />
                                        </div>
                                    );
                                }
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

export default FailedChargerBookingList;
