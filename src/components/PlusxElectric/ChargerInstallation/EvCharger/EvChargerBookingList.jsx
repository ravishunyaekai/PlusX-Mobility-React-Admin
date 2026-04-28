import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const statusMapping = {
    'P': 'Placed',
    'A': 'Assigned',
    'ER': 'Enroute',
    'AR': 'Arrived',
    'WC': 'Work Complete',
    'CR': `Can't Repair`,
    'ES': `Order Completed`,
    'C': 'Cancelled'
};

const EvChargerBookingList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate();
    const [chargerInstallationList, setChargerInstallationList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount]   = useState(null);
    const [totalPages, setTotalPages]   = useState(1);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [loading, setLoading]         = useState(false);
    
    const searchTerm = [
        {
            label : 'Search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]
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
            booking_type : "FCB"
        }
        postRequestWithToken('charger-installation-list', obj, async(response) => {
            if (response.code === 200) {
                setChargerInstallationList(response?.data)
                setTotalPages(response?.total_page || 1);
                console.log("response?.total",response?.total)
                setTotalCount(response?.total || 0)

            } else {
                // toast(response.message, {type:'error'})
                console.log('error in charger-booking-list api', response);
            }
            setLoading(false);
        })
    }
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchList(currentPage, filters);
    }, [currentPage, filters]);
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
                heading            = "EV Charger Bookings"
                filterValues       = {filters}
                fetchFilteredData  = {fetchFilteredData} 
                searchTerm         = {searchTerm}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                chargerInstallationList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Request Date", "Request ID", "Customer Name", "To Be Used For", "Looking For", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List 
                        tableHeaders={["Request Date", "Request ID", "Customer Name", "Customer Email", "To Be Used For", "Status", "Action"]}
                        listData = {chargerInstallationList}
                        pageHeading = "EV Charger Bookings"
                        keyMapping = {[
                            { key: 'created_at',    label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'request_id',    label: 'Station Name' }, 
                            { key: 'name',          label: 'Customer Name' }, 
                            { key: 'email',         label: 'Customer Email' },
                            { key: 'resident_type', label: 'To Be Used For' },
                            { key: 'order_status',  label  : 'Status', format : (status) => statusMapping[status] || status},
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default EvChargerBookingList;
