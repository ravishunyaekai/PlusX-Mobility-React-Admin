import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import {postRequestWithToken } from '../../../../api/Requests';
import moment from "moment-timezone";
// import AddDriver from '../../../../assets/images/AddDriver.svg';
// import { toast, ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import Loader from "../../../SharedComponent/Loader/Loader";

    const statusMapping = {
        '0' : 'Under Maintenance',
        '1' : 'In Use',
        '2' : 'In Service'
    };
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

const PodDeviceList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                    = useNavigate();
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null}); 
    const [loading, setLoading]                       = useState(false);

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
        };

        postRequestWithToken('pod-device-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in charger-booking-list api', response);
            }
            setLoading(false);
        });
    };

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
    const addButtonProps = {
        heading: "Add Device", 
        link: "/electric/home-charger/add-device"
    };
    const setdecimal = (floatNo) => {
        return (floatNo) ? floatNo.toFixed(2) +" %" : '0 %';
    }
    return (
        <div className='main-container'>
            <SubHeader
                heading="Home Charger Device List"
                addButtonProps={addButtonProps}
                filterValues={filters}
                searchTerm = {searchTerm}
                fetchFilteredData  = {fetchFilteredData} 
            />

            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["POD ID", "POD Name", "Model Name", "Battery","Charger", "Regs Date & Time","Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List
                            tableHeaders={[ "POD ID", "POD Name", "Model Name", "Battery","Charger", "Regs Date & Time","Status", "Action"]}  //  "Inverter", 
                            listData={chargerBookingList}
                            pageHeading="Home Charger Device List"
                            keyMapping={[
                                { key : 'pod_id', label: 'POD ID' },
                                { key : 'pod_name', label: 'POD Name' },
                                { key : 'design_model', label: 'Model Name' },
                                { key : 'avgBattery', label: 'Battery', format : (data) => setdecimal(data) },
                                // { key : 'inverter', label: 'Inverter' },
                                { key : 'charger', label: 'Charger' },
                                { key : 'created_at', label: 'Regs Date & Time', format : (date) => moment(date).format('DD-MM-YY HH:mm A') },
                                { key : 'status', label: 'Status', format: (status) => statusMapping[status] || status },
                            ]}
                        />
                    
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
            )}
        </div>
    );
};
// const currentTime = moment(date).format("YYYY-MM-DD HH:mm:ss");
//     console.log('currentTime', currentTime)

export default PodDeviceList;