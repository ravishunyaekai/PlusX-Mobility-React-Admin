import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import style from "../Cycle.module.css";
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import AddDriver from '../../../../assets/images/AddDriver.svg';
import LockerModal from '../../../SharedComponent/CustomModal/LockerModal.jsx';

const CycleList = () => {
    const userDetails                   = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                      = useNavigate();
    const [cycleList, setCycleList]     = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalCount, setTotalCount]   = useState(null);
    const [filters, setFilters]         = useState({start_date: null,end_date: null});
    const [loading, setLoading]         = useState(false);
    const [stationId, setStationId]     = useState(null);

    //Modal Form States
    const [loadingLocker, setLoadingLocker] = useState(false);
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [isLoading, setIsLoading]         = useState(false);
    const [cycleId, setCycleId]             = useState(null);
    const [form, setForm]                   = useState({ cycle_device_id: "", lock_number: "" });
    const [lockerOption, setLockerOption]   = useState([]);

    const dynamicFilters = [
        {
            label : 'Type of Cycle',
            name  : 'cycle_type', 
            type  : 'select', 
            options : [
                // { value : '',        label : 'Type of Cycle' },
                { value : "ecycle",  label : "E-cycle" },
                { value : "cycle",   label : "Cycle" },
            ]
        },
        // {
        //     label : 'Station name',
        //     name  : 'station_name', 
        //     type  : 'select', 
        //     options : [
        //         // { value : '',           label : 'Station Name' },
        //         { value : "gurugram",   label : "Gurugram" },
        //         { value : "delhi",      label : "Delhi" },
        //     ]
        // },
    ];
    const loadingFilters = {cycle_type: false}

    const searchTerm = [
        {
            label: 'search', 
            name: 'search_text', 
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading : "Add Cycle",
        link    : "/mobility/mobility-station/add-cycle"
    };
    const getLockers = () => {
        const userObj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            station_id  : form.station_id,
        };
        setLoadingLocker(true);
        postRequestWithToken('available-locker-list', userObj, (response) => {
            if (response.code === 200) {
                const LockerList = (response?.data || []).map(item => ({
                    label: item.label,
                    value: item.value,
                }));
                    setLockerOption(LockerList);
                    setLoadingLocker(false);
            } else {
                toast(response.message?.station_id, { type: 'error' });
                console.log('error in available-locker-list API', response);
                setLoadingLocker(false);
            }
        });
    };
    const cycleFields = [
        { name: "lock_number",  type: "dropdown", placeholder: "Select Locker",  fieldLabel: "Lock Number", options: lockerOption,  loading: loadingLocker,  onOpen: getLockers, }
    ];

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

        postRequestWithToken('cycle-list', obj, async (response) => {
            if (response.code === 200) {
                setCycleList(response?.data)
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

    const handleDeleteCycle = (cycle_id) => {
        
        const confirmDelete = window.confirm("Are you sure you want to delete this Cycle?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                cycle_id   : cycle_id 
            };
            postRequestWithToken('cycle-delete', obj, async (response) => {
                console.log("response",response)
                if (response.code === 200) {
                    toast(response.message, { type: "success" });

                    setTimeout(() => {
                        fetchList(currentPage);
                    }, 1000);
                } else if(response.code === 400){
                    toast(response.message, { type: 'error' });
                   
                }else{  console.log('error in cycle-delete api', response); }
            });
        }
    };

    const openModal = (item) => {

        setCycleId(item.cycle_id);
        setStationId(item.station_id);
        
        setForm({
            cycle_device_id : item.cycle_device_id || "",
             station_id  : item.station_id || null,
            lock_number : item.lock_number || null,
            // lock_number     : lockerOptions.find(opt => opt.value === item.lock_number) || null,
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setCycleId(null);
    };

    const handleSubmitModal = () => {
        if (isLoading) return;
        setIsLoading(true);

        const obj = {
            userId          : userDetails?.user_id,
            email           : userDetails?.email,
            cycle_id        : cycleId,
            cycle_device_id : form.cycle_device_id?form.cycle_device_id:'',
            lock_number     : form.lock_number?.value,
            station_id      : stationId   
        };

        postRequestWithToken('/assign-locker', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, { type: 'success' });
                setIsModalOpen(false);
                setTimeout(() => fetchList(currentPage, filters), 1500);
            } else {
                toast(response.message, { type: 'error' });
            }
            setIsLoading(false);
        });
    };
    // setToggle(!toggle)
    const handleStatusChange = (e, cycle_id) => {

        const confirm = window.confirm("Are you sure you want to change status ?");

        if (confirm) {
            const checkchecked = e.target.checked ;
            console.log(checkchecked, cycle_id)
            const obj = {
                userId        : userDetails?.user_id,
                email         : userDetails?.email,
                cycle_id      : cycle_id,
                device_status : checkchecked ? 1 : 0
            };

            setCycleList((prevList) =>
                prevList.map((item) =>
                    item.cycle_id === cycle_id
                        ? { ...item, device_status: checkchecked ? 1 : 0 }
                        : item
                )
            );
            postRequestWithToken('/cycle-on-off', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: 'success' });
                    
                } else {
                    toast(response.message, { type: 'error' });
                }
                setIsLoading(false);
            });
        }

        
    };
    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader heading      = "List of Cycles"
                addButtonProps      = {addButtonProps}
                fetchFilteredData   = {fetchFilteredData}
                dynamicFilters      = {dynamicFilters} 
                filterValues        = {filters}
                searchTerm          = {searchTerm}
                count               = {totalCount}
                isLoading           = {loadingFilters}
            />

            {loading ? <Loader /> :
                cycleList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Cycle ID", "Cycle Brand", "Station Name", "Base Price","Locker No.", "Cycle Status", "Locker Assign", "Action"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <List
                        tableHeaders={["Cycle ID", "Cycle Brand",  "Station Name", "Base Price","Locker No.", "Cycle Status", "Locker Assign", "Action"]}
                        listData={cycleList}
                        pageHeading="List of Cycles"
                        onDeleteSlot={handleDeleteCycle}
                        keyMapping={[
                            { key: 'cycle_id',      label: 'Cycle ID' },
                            { key: 'brand',         label: 'Cycle Brande' },
                            // { key: 'cycle_type',    label: 'Device Status' },
                            { key: 'station_name',  label: 'Station Name' },
                            { key: 'base_price',    label: 'Base Price' },
                            { key: 'lock_number',   label: 'Locker No.',  format: (value) => {
                                    if (!value) return "-";
                                    const num = value.replace("lock", "");
                                    return `Lock ${num}`;
                                } 
                            },
                            {
                                key: 'device_status', label: 'Cycle Status', relatedKeys: ['cycle_id'], format: (value) => {
                                    return (
                                        <label className={style.switch}>
                                            <input type="checkbox" className={style.switchInput} checked={value.device_status} onChange={(e) => handleStatusChange(e, value.cycle_id) } />
                                            <span className={style.slider}></span>
                                        </label>
                                    );
                                }
                            },
                            {  key: 'assign_gateway', label: 'Locker Assign', relatedKeys: ['order_status'],
                                // console.log("data",data)
                                format: (data, key, relatedKeys) => {
                                    const isOngoing = data?.on_going_cycle === 0;
                                return isOngoing ? <img src={AddDriver} className={"logo"} alt={data.cycle_id} onClick={() => openModal(data)} /> : null;
                                }
                            },
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
            <LockerModal isOpen={isModalOpen} onClose={closeModal} fields={cycleFields} id={cycleId} formData={form} setForm={setForm} isLoading={isLoading} onSubmit={handleSubmitModal} />
        </div>
    );
};

export default CycleList;
