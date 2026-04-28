import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
// import styles from './MobilityStations.module.css'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import AddDriver from '../../../../assets/images/AddDriver.svg';
import LockerModal from '../../../SharedComponent/CustomModal/LockerModal.jsx';
 
const MobilityStationsList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [stationList, setStationList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalCount, setTotalCount]   = useState(null);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]         = useState(false);
    const [loading, setLoading]         = useState(false);

    //Modal Form States
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [isLoading, setIsLoading]         = useState(false);
    const [stationId, setStaionId]          = useState(null);
    const [form, setForm]                   = useState({ gateway_id: "", solenoid_id: "", locker_id: "" });

    const stationFields = [
        { name: "gateway_id",  type: "text",    placeholder: "Enter Gateway ID",   fieldLabel: "Gateway ID" },
        { name: "solenoid_id", type: "text",    placeholder: "Select Solenoid ID", fieldLabel: "Solenoid ID" },
        { name: "locker_id",   type: "text",    placeholder: "Select Locker ID",   fieldLabel: "Locker ID" },
    ];

    const [dynamicFilters, setDynamicFilters] = useState([
        { label  : 'State', name   : 'state_id', type   : 'select', options: [] },
        { label  : 'City',  name   : 'city_id',  type   : 'select', options: [] },
    ]);
    const [loadingFilters, setLoadingFilters] = useState({ state_id: false, city_id: false });
 
    const userObj = {
        userId: userDetails?.user_id,
        email: userDetails?.email,
        country_id:userDetails?.country_id,
    };

    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading : "Add Station",
        link    : "/mobility/mobility-station/add-mobility-station"
    };
 
    function getStates() {
        setLoadingFilters(prev => ({ ...prev, state_id: true }));
        postRequestWithToken('state-country-list', { ...userObj, requirement: "state" }, (response) => {
            if (response.code === 200) {
                const stateList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.state_id
                }));

                setDynamicFilters(prev =>
                    prev.map(f => f.name === 'state_id' ? { ...f, options: stateList } : f )
                );
                setLoadingFilters(prev => ({ ...prev, state_id: false }));
            } else {
                console.log('error in state-country-list API', response);
                setLoadingFilters(prev => ({ ...prev, state_id: false }));
            }
        });
    }
    
    function getCities(stateId) {
        setLoadingFilters(prev => ({ ...prev, city_id: true }));
        postRequestWithToken('state-country-list', { ...userObj, requirement: "city", station_state_id: stateId }, (response) => {
            if (response.code === 200) {
                const cityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.city_id
                }));

                setDynamicFilters(prev =>
                    prev.map(f => f.name === 'city_id' ? { ...f, options: cityList } : f )
                );
                setLoadingFilters(prev => ({ ...prev, city_id: false }));
            } else {
                console.log('error in state-country-city-list API', response);
                setLoadingFilters(prev => ({ ...prev, city_id: false }));
            }
        });
    }

    function handleStateChange(selectedState) {
        if (selectedState) {
            getCities(selectedState);
        }
    }

    function handleFilterChange(name, value) {
        if (name === 'state_id_open') {
            getStates();
        }
        else if (name === 'state_id') {
            handleStateChange(value);
        }
    }
 
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
        
        postRequestWithToken('mobility-station-list', obj, async (response) => {
            if (response.code === 200) {
                setStationList(response?.data)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
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
        const confirmDelete = window.confirm("Kindly verify that this station has no cycles assigned!  ");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                station_id : stationId 
            };
            postRequestWithToken('mobility-station-delete', obj, async (response) => {
                if (response.code === 200) {
                    // setRefresh(prev => !prev);
                    toast(response.message, { type: "success" });
 
                    setTimeout(() => {
                        fetchList(currentPage);
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in mobility-station-delete api', response);
                }
            });
        }
    };
    const openModal = (item) => {
        setStaionId(item.station_id);
        setForm({
            gateway_id  : item.gateway_id || "",
            solenoid_id : item.solenoid_id || "",
            locker_id   : item.locker_id || "",
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setStaionId(null);
    };

    const handleSubmitModal = () => {
        if ( !form.locker_id || !form.solenoid_id) {
            toast("Please fill Gateway ID, locker ID, Solenoid ID", { type: "error" });
            return;
        }
        setIsLoading(true);

        const obj = {
            userId          : userDetails?.user_id,
            email           : userDetails?.email,
            station_id      : stationId,
            gateway_id      : form.gateway_id,
            locker_id       : form.locker_id,
            solenoid_id     : form.solenoid_id,
            station_id      : stationId   
        };

        postRequestWithToken('/add-solenoid-detail', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, { type: 'success' });
                setIsModalOpen(false);
                setTimeout(() => fetchList(currentPage, filters), 1000);
            } else {
                toast(response.message, { type: 'error' });
            }
            setIsLoading(false);
        });
    };

    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader heading="List of Stations"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters}
                filterValues={filters}
                searchTerm = {searchTerm}
                count = {totalCount}
                onFilterChange={handleFilterChange}
                isLoading= {loadingFilters}
            />
 
            {loading ? <Loader /> :
                stationList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Station ID", "Station Name", "City", "Total Cycle Units", "Assign Gateway", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={["Station ID", "Station Name", "City", "Total Cycle Units", "Assign Gateway", "Action"]}
                        listData={stationList}
                        pageHeading="List of Stations"
                        onDeleteSlot={handleDeleteSlot}
                        keyMapping={[
                            { key: 'station_id',     label: 'Station ID' },
                            { key: 'station_name',   label: 'Station Name' },
                            { key: 'city',           label: 'City' },
                            { key: 'cycle_count',    label: 'Total Cycle Units' },
                            { key: 'assign_gateway', label: 'Assign Gateway', relatedKeys: ['order_status'],
                                format: (data) => {
                                return <img src={AddDriver} className={"logo"} alt={data.station_id} onClick={() => openModal(data)} />
                                }
                            },
                        ]}
                    />
                    
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
            <LockerModal isOpen={isModalOpen} onClose={closeModal} fields={stationFields} id={stationId} formData={form} setForm={setForm} isLoading={isLoading} onSubmit={handleSubmitModal} />
        </div>
    );
};
 
export default MobilityStationsList;