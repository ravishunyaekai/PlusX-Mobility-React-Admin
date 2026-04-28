import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const dynamicFilters = [
    // { label: 'Bike Name', name: 'search_text', type: 'text' }
]

const EvInsuranceList = () => {
    const userDetails                    = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                       = useNavigate();
    const [carList, setCarList]          = useState([]);
    const [currentPage, setCurrentPage]  = useState(1);
    const [totalPages, setTotalPages]    = useState(1);
    const [totalCount, setTotalCount]    = useState(null);
    const [filters, setFilters]          = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]          = useState(false)
    const [loading, setLoading]          = useState(false);
    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ]

    // const addButtonProps = {
    //     heading: "Add Coupon",
    //     link: "/electric/coupon/add-coupon"
    // };

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

        postRequestWithToken('ev-insurance-list', obj, async (response) => {
            if (response.code === 200) {
                setCarList(response?.data)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in coupon-list api', response);
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
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleDeleteSlot = (code) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId      : userDetails?.user_id,
                email       : userDetails?.email,
                coupan_code : code
            };
            postRequestWithToken('delete-coupan', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });
                    setTimeout(() => {
                        setRefresh(prev => !prev);
                    }, 1000)
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in electric-bike-delete api', response);
                }
            });
        }
    };

    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader 
                heading="Ev Insurance List"
                // addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters} 
                filterValues={filters}
                searchTerm={searchTerm}
                count = {totalCount}
            />
            
            {loading ? <Loader /> : 
                carList.length === 0 ? 
                    <EmptyList
                        tableHeaders={["Booking ID", "Owner Name", "Mobile No.", "Vehicle", "Action"]}
                        message="No data available"
                    />
                : <>
               
                    <List
                        tableHeaders={["Booking ID", "Owner Name", "Mobile No.", "Vehicle", "Action"]}
                        listData={carList}
                        pageHeading="Ev Insurance List"
                        // onDeleteSlot={handleDeleteSlot}
                        keyMapping={[
                            { key: 'insurance_id', label: 'Coupon ID' },
                            { key: 'owner_name', label: 'Coupon Name' },
                            { key: 'mobile', label: 'Coupon Code' },
                            { key: 'vehicle_data', label: 'Service Name' },
                            
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            }
        </div>
    );
};

export default EvInsuranceList;