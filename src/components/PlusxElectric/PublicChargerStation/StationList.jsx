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
    // { label: 'Name', name: 'search', type: 'text' },
]

const StationList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [stationList, setStationList] = useState([]);
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

        postRequestWithToken('public-charger-station-list', obj, async (response) => {
            if (response.code === 200) {
                setStationList(response?.data)
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

    const handleDeleteSlot = (stationId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                station_id : stationId 
            };
            postRequestWithToken('public-chargers-delete', obj, async (response) => {
                if (response.code === 200) {
                    // setRefresh(prev => !prev);
                    toast(response.message, { type: "success" });

                    setTimeout(() => {
                        fetchList(currentPage);
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
            <ToastContainer />
            <SubHeader heading="Total Public Chargers List"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters} filterValues={filters}
                searchTerm = {searchTerm}
                count = {totalCount}
            />

            {loading ? <Loader /> :
                stationList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Station Name", "Charging For", "Charging Type", "Price", "Address", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={["Station Name", "Charging For", "Charging Type", "Price", "Address", "Action"]}
                        listData={stationList}
                        pageHeading="Total Public Chargers List"
                        onDeleteSlot={handleDeleteSlot}
                        keyMapping={[
                            { key: 'station_name', label: 'Station Name' },
                            { key: 'charging_for', label: 'Charging For' },
                            { key: 'charger_type', label: 'Charging Type' },
                            {
                                key: 'price',
                                label: 'Price',
                                format: (price) => (price ? `INR ${price}` : '')
                            },
                            {
                                key: 'address',
                                label: 'Address',
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

export default StationList;
