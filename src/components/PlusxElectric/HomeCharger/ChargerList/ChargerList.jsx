import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { getRequestWithToken, postRequestWithToken } from '../../../../api/Requests';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const ChargerList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                      = useNavigate();
    const [chargerList, setChargerList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalCount, setTotalCount]   = useState(null);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]         = useState(false);
    const [loading, setLoading]         = useState(false);
    
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading: "Add Charger", 
        link: "/electric/home-charger/add-charger"
    };
    const fetchChargers = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        } 

        const obj = {
            userId : userDetails?.user_id,
            email : userDetails?.email,
            page_no: page,
            ...appliedFilters,
        };

        getRequestWithToken('charger-list', obj, (response) => {
            if (response.code === 200) {
                setChargerList(response?.data || []);  
                setTotalPages(response?.total_page || 1);  
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in charger-list API', response);
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

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteSlot = (chargerId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                charger_id : chargerId 
            };
            postRequestWithToken('delete-charger', obj, async (response) => {
                if (response.code === 200) {
                    setRefresh(prev => !prev);
                    toast(response.message[0], { type: "success" });

                    setTimeout(() => {
                        fetchChargers(currentPage);
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in delete-charger-slot api', response);
                }
            });
        }
    };

    return (
        <div className='main-container'>
            <SubHeader 
                heading             = "Home Charger List" 
                addButtonProps      = {addButtonProps}
                filterValues        = {filters}
                fetchFilteredData   = {fetchFilteredData} 
                searchTerm          = {searchTerm}
                count               = {totalCount}
            />
            <ToastContainer />

            {loading ? <Loader /> :
                chargerList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Charger ID", "Charger Name", "Charger Price", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>  
                    <List
                        tableHeaders =  {["Charger ID", "Charger Name", "Charger Price", "Status", "Action"]}
                        pageHeading  =  "Home Charger List"
                        listData     =  {chargerList}
                        onDeleteSlot =  {handleDeleteSlot}
                        keyMapping   ={[
                            { key: 'charger_id',     label: 'Booking ID' }, 
                            { key: 'charger_name',   label: 'Charger Name' }, 
                            { key: 'charger_price',  label: 'Charger Price',    format: (price) => (price ? ` ${price} INR` : '') },
                            { key: 'status',         label: 'Status',           format: (status) => (status === 1 ? "Active" : "Inactive") } 
                        ]}
                    />
                    
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/>
                </>
            )}
        </div>
    );
};


export default ChargerList;
