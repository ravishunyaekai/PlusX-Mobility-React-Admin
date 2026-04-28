import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import styles from './PublicCharger.module.css';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const dynamicFilters = [
    {
        label : 'Status', 
        name  : 'charger_status', 
        type  : 'select', 
        options : [
            // { value : '',    label : 'Select Status' },
            { value : 1, label : 'Active' },
            { value : 0,   label : 'In Active' },

        ]
    },
]

const ChargeShareList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [stationList, setStationList] = useState([]);
    const [chargerId, setChargerId] = useState([]);

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
        heading : "Add Public Charger",
        link    : "/electric/public-charger-station/add-charger-station"
    };

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

        postRequestWithToken('charge-share-list', obj, async (response) => {
            if (response.code === 200) {
                console.log("response",response)
                setStationList(response?.data)
                setChargerId(response.data.charger_id)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in public-charger-station-list api', response);
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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

   
    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader heading="Chargers Share Listings"
                // addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters} filterValues={filters}
                searchTerm = {searchTerm}
                count = {totalCount}
            />

            {loading ? <Loader /> :
                stationList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Charger ID", "Customer Name","Charger Name", "Compatibile With", "Address","Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={["Charger ID", "Customer Name","Charger Name", "Compatibile With", "Address","Status", "Action"]}
                        listData={stationList}
                        pageHeading="Chargers Share Listings"
                        // onDeleteSlot={handleDeleteSlot}
                        keyMapping={[
                            { key: 'charger_id', label: 'Charger ID' },
                            { key: 'rider_name', label: 'Customer Name' },
                            { key: 'charger_name', label: 'Charger Name' },

                            {
                                key: 'compatible',
                                label: 'Compatibile With',
                              
                            },
                            {
                                key: 'address',
                                label: 'Address',
                            },
                            {
                                key: 'charger_status',
                                label: 'status',
                            },
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

export default ChargeShareList;
