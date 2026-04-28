import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken, postRequest } from '../../../api/Requests';
import moment from 'moment'; 
import View from '../../../assets/images/ViewEye.svg'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import { statusCode, statusMapping } from "../../../utils/statusMapping.js";
import AddDriver from '../../../assets/images/AddDriver.svg';
import LockerModal from '../../SharedComponent/CustomModal/LockerModal.jsx';

const searchTerm = [
    {
        label : 'search', 
        name  : 'search_text', 
        type  : 'text'
    }
]
const InvoiceList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                    = useNavigate();
    const [loading, setLoading]                       = useState(false);

    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [totalCount, setTotalCount]                 = useState(null);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null});
    const [scheduleFilters, setScheduleFilters]       = useState({start_date: null,end_date: null});
    
    const [rowSelected, setARowSelected]              = useState(10);

    const handleBookingDetails = (id) => navigate(`/mobility/ride/ride-invoice-details/${id}`)

    const fetchList = (page, appliedFilters = {}, rowSelected=10) => {
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
            rowSelected,
        };
        postRequestWithToken('cycle-invoice-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in Cycle-booking-list api', response);
            }
            setLoading(false);
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters, rowSelected);
    }, [currentPage, filters, rowSelected]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const scheduleFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    return (
        <div className='main-container'>
            <SubHeader
                heading           = "Invoice List"
                fetchFilteredData = {fetchFilteredData}
                filterValues      = {filters}
                searchTerm        = {searchTerm}
                count             = {totalCount}
                scheduleDateChange  = {scheduleFilteredData}
            />
            <ToastContainer />
            
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Date", "Invoice ID", "Booking ID", "Customer Name", "Customer Mobile", "Amount", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={["Date", "Invoice ID", "Booking ID", "Customer Name", "Customer Mobile", "Amount", "Action"]}
                        pageHeading = "Invoice List"
                        listData    = {chargerBookingList}
                        keyMapping  = {[
                            { 
                                key    : 'created_at', 
                                label  : 'Date & Time', 
                                format : (date) => moment(date).format('DD MMM YYYY') 
                            }, { 
                                key    : 'booking_id', 
                                label  : 'Invoice ID', 
                                format : (value) => value ? value.replace('PMB', 'INV') : '' 
                            },
                            { key: 'booking_id',        label: 'Booking ID' }, 
                            { key: 'user_name',         label: 'Customer Name' }, 
                            { key: 'contact_no',         label: 'Customer Mobile' }, 
                            { key: 'price',             label: 'Amount' },
                            { key: 'action', label: 'Action', relatedKeys: ['status'], 
                                format: (data, key, relatedKeys) => {
                                    return (
                                        <div className="editButtonSection">
                                            <img src={View} alt="view" className="viewButton" onClick={() => handleBookingDetails(data.booking_id)}/>
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
export default InvoiceList;
