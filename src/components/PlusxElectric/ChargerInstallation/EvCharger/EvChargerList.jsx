import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../../api/Requests';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const EvChargerList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate();
    const [chargerList, setChargerList] = useState([]);
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
        postRequestWithToken('/ev-charger-list', obj, async(response) => {
            if (response.status === 1) {
                setChargerList(response?.data)
                setTotalPages(response?.total_page || 1); 
                setTotalCount(response?.total || 0)
            } else {
                // toast(response.message, {type:'error'})
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
        heading : "Add EV Charger",
        link    : "/electric/charger-installation/ev-charger-add"
    };
    
    return (
        <div className='main-container'>
            <SubHeader heading = "EV Chargers"
                addButtonProps    = {addButtonProps}
                filterValues      = {filters}
                fetchFilteredData = {fetchFilteredData} 
                searchTerm        = {searchTerm}
                count             = {totalCount}
            />
            {loading ? <Loader /> :
                chargerList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Charger ID", "Charger Name", "Output Power", "Price","Status", "Action"]}
                        message="No data available"
                    />
                ) : ( 
                <>
                    <List 
                        tableHeaders={[ "Charger ID", "Charger Name", "Output Power", "Price","Status", "Action"]}
                        listData = {chargerList}
                        pageHeading = "EV Chargers"
                        keyMapping = {[
                            { key: 'charger_id',   label: 'Charger ID' }, 
                            { key: 'charger_name', label: 'Charger Name' }, 
                            // { key: 'compatible',   label: 'Compatible' }, 
                            { key: 'outputPower',  label: 'Output Power' },
                            { key: 'price', label: 'Price' },
                            { key: 'status_lable', label: 'Status' },

                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default EvChargerList;
