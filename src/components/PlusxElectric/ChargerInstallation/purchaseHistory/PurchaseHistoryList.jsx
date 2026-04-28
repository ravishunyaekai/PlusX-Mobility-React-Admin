import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../../api/Requests';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import moment from 'moment';

const PurchaseCustomerList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate();
    const [purchaseList, setPurchaseList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount]   = useState(null);
    const [totalPages, setTotalPages]   = useState(1);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [loading, setLoading]         = useState(false);
    
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
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
        }
        postRequestWithToken('/purchase-history-list', obj, async(response) => {
            if (response.status === 1) {
                setPurchaseList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in charger-installation-list api', response);
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
    const addButtonProps = {
        heading : "Add Customer",
        link    : "/electric/charger-installation/purchase-add"
    };
    
    return (
        <div className='main-container'>
            <SubHeader heading    = "EV Products & Installation"
                addButtonProps    = {addButtonProps}
                filterValues      = {filters}
                fetchFilteredData = {fetchFilteredData} 
                searchTerm        = {searchTerm}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                purchaseList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Purchase Date", "Customer Name", "Phone Number", "Product Name","Type Of Service", "Action"]}
                        message="No data available"
                    />
                ) : ( 
                <>
                    <List 
                        tableHeaders={[ "Purchase Date", "Customer Name", "Phone Number", "Product Name","Type Of Service", "Action"]}
                        listData = {purchaseList}
                        pageHeading = "EV Products & Installation"
                        keyMapping = {[
                            { key: 'purchase_date', label: 'Date', format: (date) => moment(date).format('DD MMM YYYY') }, 
                            { key: 'customer_name',   label: 'Customer Name' }, 
                            { key: 'customer_mobile', label: 'Phone Number' }, 
                            { key: 'product_name',    label: 'Product Name' }, 
                            { key: 'type_of_service', label: 'Type Of Service', format: (type) => type.map(o => o.label).join(", ") },
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default PurchaseCustomerList;
