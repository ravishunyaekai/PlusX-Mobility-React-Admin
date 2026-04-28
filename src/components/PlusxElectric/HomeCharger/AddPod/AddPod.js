import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../../SharedComponent/List/List';
import styles from './addpod.module.css';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { getRequestWithToken, postRequestWithToken } from '../../../../api/Requests';
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const AddPod = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate = useNavigate()
    const [chargerList, setChargerList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refresh, setRefresh] = useState(false)
    const [filters, setFilters] = useState({});
    
    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading: "Add POD", 
        link: "/addpod-form"
    };
    const fetchChargers = (page, appliedFilters = {}) => {
        const obj = {
            userId : userDetails?.user_id,
            email : userDetails?.email,
            page_no: page,
            ...appliedFilters,
        };

        getRequestWithToken('charger-list', obj, (response) => {
            if (response.code === 200) {
                setChargerList(response?.data || []);  
                setTotalPages(response?.data?.total_pages || 1);  
            } else {
                console.log('error in charger-list API', response);
            }
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
                heading = "Add POD List" 
                addButtonProps={addButtonProps}
                filterValues={filters}
                fetchFilteredData={fetchFilteredData} 
                searchTerm = {searchTerm}
            />
            <ToastContainer />
            {chargerList.length === 0 ? (
                <EmptyList tableHeaders={["POD ID", "POD Status", "Zone", "Action"]} message="No data available" />
            ) : (
            <List
                tableHeaders={["POD ID", "POD Status", "Zone", "Action"]}
                listData={chargerList}
                pageHeading="Add POD List"
                onDeleteSlot={handleDeleteSlot}
                keyMapping={[
                    { key: 'charger_id',    label: 'Booking ID' }, 
                    { key: 'status',        label: 'Status',        format: (status) => (status === 1 ? "Active" : "Inactive") },
                    { key: 'charger_name',  label: 'Charger Name' }, 
                ]}
            />
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default AddPod;

