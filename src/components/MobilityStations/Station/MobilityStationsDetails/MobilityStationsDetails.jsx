import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../../api/Requests.js';
import { toast, ToastContainer } from "react-toastify";
import styles from '../MobilityStations.module.css'
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../../SharedComponent/Loader/Loader.jsx";
import StationCard from "../../../../components/SharedComponent/Details/NewBookingDetails/StationCard/StationCard.jsx";
import DetailsCards from "../../../../components/SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards.jsx";

import Contact from "../../../../assets/images/ContactCard.svg";
import Station from "../../../../assets/images/Station.svg";
import city from "../../../../assets/images/CityCard.svg";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList.jsx';
import List from '../../../SharedComponent/List/List.jsx';

import AddDriver from '../../../../assets/images/AddDriver.svg';
import LockerModal from '../../../SharedComponent/CustomModal/LockerModal.jsx';
import Pagination from '../../../SharedComponent/Pagination/Pagination'

const MobilityStationsDetails = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const { stationId }                         = useParams();
    const navigate                              = useNavigate();
    const [StationDetails, setStationDetails]   = useState();
    const [currentPage, setCurrentPage]         = useState(1);
    const [loading, setLoading]                 = useState(false);
    const [cycleList, setCycleList]     = useState([]);
    const [totalPages, setTotalPages]   = useState(1);
    const [totalCount, setTotalCount]   = useState(null);

    const [loadingLocker, setLoadingLocker] = useState(false);
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [isLoading, setIsLoading]         = useState(false);
    const [cycleId, setCycleId]             = useState(null);
    const [form, setForm]                   = useState({ cycle_device_id: "", lock_number: "" });
    const [lockerOption, setLockerOption]   = useState([]);
    const [filters, setFilters]             = useState({start_date: null,end_date: null});

    const formatTime = (t) => {
        if (!t) return "";
        const [h, m] = t.split(':');
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    const headerItems = [
        { label: 'Station ID',        icon: Contact,    value: stationId },
        { label: 'Station Name',      icon: Station,    value: StationDetails?.station.station_name },
        { label: 'State',             icon: city,       value: StationDetails?.station.state_name },
        { label: 'City',              icon: city,       value: StationDetails?.station.city_name },
        { label: 'Solenoid ID',       icon: city,       value: StationDetails?.station.solenoid_id },
        { label: 'Gateway ID',        icon: city,       value: StationDetails?.station.gateway_id },
        { label: 'Locker ID',         icon: city,       value: StationDetails?.station.locker_id },
        { label: 'OPERATOR NAME',     icon: city,       value: StationDetails?.station.operator_name },
        { label: 'OPERATOR contact',  icon: city,       value: StationDetails?.station.operator_contact },
    ];
    const stationCards = [
        { title: "Station Address", value: `${StationDetails?.station?.building_name || ""} ${StationDetails?.station?.address || ""}` },
        { title: "Cycle Unit", customContent : (
            <div className={styles.unitBlock}>
                <div className={styles.unitItem}>
                    <span className={styles.unitBadge}>{StationDetails?.station.ecycle_count}</span>
                    <span className={styles.unitLabel}>E-Cycle</span>
                </div>
                <div className={styles.unitItem}>
                    <span className={styles.unitBadge}>{StationDetails?.station.cycle_count}</span>
                    <span className={styles.unitLabel}>Cycle</span>
                </div>
            </div>
        ) },
        { title: "Open Hours",
            customContent: StationDetails?.station?.open_time && StationDetails?.station?.close_time ? (
                (() => {
                    const open_time = StationDetails?.station?.open_time;
                    const close_time = StationDetails?.station?.close_time;
                    
                    return (
                        <div className={styles.value}>
                            {formatTime(open_time)} - {formatTime(close_time)}
                        </div>
                    );
                     
                })()
            ) : (
                <div>Always Open</div>
            )
        },
    ];
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
        { name: "lock_number", type: "dropdown", placeholder: "Select Locker", fieldLabel: "Lock Number", options: lockerOption, loading: loadingLocker, onOpen: getLockers, }
    ];
    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            stationId    : stationId,
            service_type : 'station_details',
            page_no      : currentPage
        };
        postRequestWithToken('mobility-station-details', obj, (response) => {
            if (response.code === 200) {
                setStationDetails(response?.data || {});
            } else {
                console.log('error in mobility-station-details API', response);
            }
            setLoading(false);
        });
    };
    const fetchCycleList = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
        const paramObj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            page_no    : currentPage,
            station_id : stationId
        }
        postRequestWithToken('station-cycle-list', paramObj, async (response) => {
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
        fetchDetails();
    }, [currentPage]);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchCycleList();
    }, []);

    const formattedLockerRow = () => {
        if (!Array.isArray(StationDetails?.cycle_list)) return [];

        const row = { lock1: "", lock2: "", lock3: "", lock4: "", lock5: "", lock6: "", lock7: "" };

        StationDetails.cycle_list.forEach(item => {
            const lockKey = item.lock_number;
            row[lockKey] = item.cycle_id || "";
        });
        return [row];
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const openModal = (item) => {

        setCycleId(item.cycle_id);
        setForm({
            cycle_device_id : item.cycle_device_id || "",
            station_id      : item.station_id || null,
            lock_number     : item.lock_number || null,
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setCycleId(null);
    };
    const handleSubmitModal = () => {
        
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
                
                setTimeout(() => fetchDetails(currentPage, filters), 1500);
            } else {
                toast(response.message, { type: 'error' });
            }
            setIsLoading(false);
        });
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
                 
                if (response.code === 200) {
                    toast(response.message, { type: "success" });

                    setTimeout(() => {
                       fetchCycleList();
                    }, 1000);
                } else if(response.code === 400){
                    toast(response.message, { type: 'error' });
                   
                } else {  console.log('error in cycle-delete api', response); }
            });
        }
    };
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

    const openLock = (lock_number) =>{
        const confirm = window.confirm("Are you sure you want to open lock ?");
        if (confirm) { 
            setIsLoading(true)
            const obj = {
                userId      : userDetails?.user_id,
                email       : userDetails?.email,
                station_id  : stationId,
                lock_number : lock_number
            };
            postRequestWithToken('/locker-open', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: 'success' });
                    
                } else {
                    toast(response.message, { type: 'error' });
                }
                setIsLoading(false);
            });
        }
    }
    
    const lockerTableHeaders = [
        <div className={styles.tableWrapperButton}> 
            Lock 1
            <button onClick={() => openLock('lock1')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>,
        <div className={styles.tableWrapperButton}> 
            Lock 2
            <button onClick={() => openLock('lock2')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>,
        <div className={styles.tableWrapperButton}> 
            Lock 3
            <button onClick={() => openLock('lock3')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>,
        <div className={styles.tableWrapperButton}> 
            Lock 4
            <button onClick={() => openLock('lock4')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>,
        <div className={styles.tableWrapperButton}> 
            Lock 5
            <button onClick={() => openLock('lock5')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>,
        <div className={styles.tableWrapperButton}> 
            Lock 6
            <button onClick={() => openLock('lock6')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>,
        <div className={styles.tableWrapperButton}> 
            Lock 7
            <button onClick={() => openLock('lock7')} className={styles.lockerBtn} disabled={isLoading}>
                { isLoading ? ( "Open..." ) :  "Open" }
            </button> 
        </div>
    ];
    return (
        <div className='main-container'>
            <ToastContainer />
            { loading ? <Loader /> : 
                <>
                    <DetailsCards items={headerItems} />
                    <div className={styles.mobilityContainer}>
                        {stationCards.map((card, index) => (
                            <StationCard key={index} title={card.title} value={card.value} customContent={card.customContent}/>
                        ))}
                    </div>
                    <div className={styles.bookingDetailsSection}>
                        <div className={styles.DetailsMainHeading}>Locker Assign Details</div>
                    </div>   
                    { StationDetails?.cycle_list.length === 0 ? 
                        <EmptyList
                            tableHeaders={lockerTableHeaders}
                            message="No data available"
                        />
                        : <>
                            <List
                                tableHeaders={lockerTableHeaders}
                                listData={formattedLockerRow()}
                                pageHeading="Locker Details"
                                keyMapping={[
                                    { key: "lock1", label: "Lock 1" },
                                    { key: "lock2", label: "Lock 2" },
                                    { key: "lock3", label: "Lock 3" },
                                    { key: "lock4", label: "Lock 4" },
                                    { key: "lock5", label: "Lock 5" },
                                    { key: "lock6", label: "Lock 6" },
                                    { key: "lock7", label: "Lock 7" },
                                ]}
                            />
                        </> 
                    }

                    <div className={styles.bookingDetailsSection}>
                        <div className={styles.DetailsMainHeading}>Cycle List</div>
                    </div>
                    { cycleList?.length === 0 ? 
                            <EmptyList
                                tableHeaders={["Cycle ID", "Cycle Brand", "Type of Cycle" ,"Base Price" ,"Locker No.", "Cycle Status", "Locker Assign", "Action"]}
                                message="No data available"
                            />
                        : <>
                            <List
                                tableHeaders={["Cycle ID", "Cycle Brand", "Type of Cycle" ,"Base Price" ,"Locker No.", "Cycle Status", "Locker Assign", "Action"]}
                                listData={cycleList}
                                pageHeading="Cycle List"
                                onDeleteSlot={handleDeleteCycle}
                                keyMapping={[
                                    { key: "cycle_id", label: "Cycle ID" },
                                    { key: "brand",     label: "Cycle Brand" },
                                    { key: "cycle_type", label: "Type of Cycle" },
                                    { key: "base_price", label: "Base Price" },
                                    { key: 'lock_number',   label: 'Locker No.',  format: (value) => {
                                            if (!value) return "-";
                                            const num = value.replace("lock", "");
                                            return `Lock ${num}`;
                                        } 
                                    },
                                    {
                                        key: 'device_status', label: 'Cycle Status', relatedKeys: ['cycle_id'], format: (value) => {
                                            return (
                                                <label className={styles.switch}>
                                                    <input type="checkbox" className={styles.switchInput} checked={value.device_status} onChange={(e) => handleStatusChange(e, value.cycle_id) } />
                                                    <span className={styles.slider}></span>
                                                </label>
                                            );
                                        }
                                    },
                                    {  key: 'assign_gateway', relatedKeys: ['order_status'],
                                        format: (data, key, relatedKeys) => {
                                            const isOngoing = data?.on_going_cycle === 0;
                                            return isOngoing ? <img src={AddDriver} className={"logo"} alt={data.cycle_id} onClick={() => openModal(data)} /> : null;
                                        }
                                    },
                                ]}
                            />
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                        </> 
                    }

                    <div className={styles.mobilityContainer}>
                        <div className={styles.infoGallerySection}>
                            <div className={styles.leftPanel}>
                                <div className={styles.cardSections}>
                                    <div className={styles.serviceCard}>
                                        <div className={styles.serviceCardHeader}>
                                            <div className={styles.title}>Service Charge for</div>
                                            { StationDetails?.station?.price_type === 'paid' ? (
                                                <div className={styles.label}>Paid for Everyone</div>
                                                ) : (
                                                    <div className={styles.label}>Unpaid</div>
                                                )
                                            }
                                        </div>
                                        {StationDetails?.station?.university && <div className={styles.value}>{StationDetails?.station?.university}</div>}
                                    </div>
                                    <div className={styles.availableCard}>
                                        <div className={styles.title}>Available For</div>
                                        <div className={styles.value}>{ StationDetails?.station?.available_for  }</div>
                                    </div>
                                </div>
                            </div>
                        
                            <div className={styles.rightPanel}>
                                <div className={styles.coverImage}>
                                    <img src={`${StationDetails?.base_url}${StationDetails?.station.station_image}`} alt="Cover" className={styles.imageCover} />
                                </div>
                                <div className={styles.galleryRow}>
                                    {StationDetails?.imgName.map((img, index) => (
                                        <div key={index} className={styles.galleryImage}>
                                            <img src={`${StationDetails.base_url}${img}`} alt={`Gallery ${index + 1}`} className={styles.imageGallery} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
            <LockerModal isOpen={isModalOpen} onClose={closeModal} fields={cycleFields} id={cycleId} formData={form} setForm={setForm} isLoading={isLoading} onSubmit={handleSubmitModal} />
        </div>
    );
}

export default MobilityStationsDetails;