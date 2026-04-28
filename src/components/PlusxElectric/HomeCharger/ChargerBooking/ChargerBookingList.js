import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment'; 
import AddDriver from '../../../../assets/images/AddDriver.svg';
import Cancel from '../../../../assets/images/Cancel.svg';
import Alert from '../../../../assets/images/Alert.svg';
import View from '../../../../assets/images/ViewEye.svg'
import ModalAssign from '../../../SharedComponent/BookingDetails/ModalAssign.jsx'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Custommodal from '../../../SharedComponent/CustomModal/CustomModal.jsx';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList.jsx';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';
import { Tooltip } from 'react-tooltip';
// import 'react-tooltip/dist/react-tooltip.css';

const statusMapping = {
    'CNF': 'Booking Confirmed',
    'A'  : 'Assigned',
    'ER' : 'Enroute',
    'RL' : 'POD Reached at Location',
    'CS' : 'Charging Started',
    'CC' : 'Charging Completed',
    'PU' : 'Completed',
    'C'  : 'Cancelled',
    'RO' : 'POD Reached at Office',
};

const dynamicFilters = [
    {
        label : 'Status', 
        name  : 'status', 
        type  : 'select', 
        options : [
            { value : '',    label : 'Select Status' },
            { value : 'CNF', label : 'Booking Confirmed' },
            { value : 'A',   label : 'Assigned' },
            { value : 'ER',  label : 'Enroute' },
            { value : 'RL',  label : 'POD Reached at Location' },
            { value : 'CS',  label : 'Charging Started' },
            { value : 'CC',  label : 'Charging Completed' },
            { value : 'PU',  label : 'Completed' },
            { value : 'RO',  label : 'POD Reached at Office' },
            { value : 'C',   label : 'Cancelled' },
        ]
    },
];
const searchTerm = [
    {
        label : 'search', 
        name  : 'search_text', 
        type  : 'text'
    }
]

const ChargerBookingList = () => {
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                    = useNavigate();
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [rsaList, setRsaList]                       = useState([]);
    const [currentPage, setCurrentPage]               = useState(1);
    const [totalPages, setTotalPages]                 = useState(1);
    const [totalCount, setTotalCount]                 = useState(1);
    const [filters, setFilters]                       = useState({start_date: null,end_date: null});
    const [scheduleFilters, setScheduleFilters]       = useState({start_date: null,end_date: null});
    const [isModalOpen, setIsModalOpen]               = useState(false);
    const [selectedBookingId, setSelectedBookingId]   = useState(null);
    const [selectedDriverId, setSelectedDriverId]     = useState(null);
    const [selectedRiderId, setSelectedRiderId]       = useState(null);
    const [showPopup, setShowPopup]                   = useState(false);
    const [reason, setReason]                         = useState("");
    const [loading, setLoading]                       = useState(false);
    const [downloadClicked, setDownloadClicked]       = useState(false)

    const [areaOptions, setAreaOptions]   = useState([]);
    const [areaSelected, setAreaSelected] = useState('');

    const [rowOptions, setRowOptions]    = useState([10, 25, 50, 100]);
    const [rowSelected, setARowSelected] = useState(10);

    const handleCancelClick = (bookingId, riderId) => {
        setSelectedBookingId(bookingId);
        setSelectedRiderId(riderId)
        setShowPopup(true); 
    };
    const handleClosePopup = () => {
        setShowPopup(false); 
        setSelectedBookingId(null);
        setSelectedRiderId(null)
        setReason("");
    };
    const handleReasonChange = (e) => {
        setReason(e.target.value); 
    };

    const handleConfirmCancel = () => {
        if (!reason.trim()) {
            toast("Please enter a reason for cancellation.", {type:'error'})
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : selectedBookingId,
            rider_id   : selectedRiderId,
            reason     : reason
        };
        postRequestWithToken('portable-charger-cancel', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message[0], {type:'success'})
                    setTimeout(() => {
                        fetchList(currentPage, filters);
                    }, 1500);
                setShowPopup(false);
                setSelectedBookingId(null);
                setSelectedRiderId(null)
            } else {
                toast(response.message, {type:'error'})
                console.log('error in charger-booking-list api', response);
            }
        });
    };

    const handleBookingDetails = (id) => navigate(`/electric/home-charger/charger-booking-details/${id}`)

    const allAreaList = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
       /* postRequestWithToken('all-area-list', obj, (response) => {
            let areaOptionss = [{ name: 'Select Area', value: '' }]
            for (const item of response.area_data) {
                areaOptionss.push({ name: item.area_name, value: item.area_name })
            }
            setAreaOptions(areaOptionss);
            // if (response.code === 200) {
            //     const data = response?.data || {};
            // } else {
            //     console.log('error in rsa-details API', response);
            // }
        }); */
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        allAreaList();
    }, []);
    const fetchList = (page, appliedFilters = {}, scheduleFilters = {}, areaSelected='', rowSelected=10) => {
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
            scheduleFilters,
            areaSelected,
            rowSelected,
        };
        postRequestWithToken('charger-booking-list', obj, async (response) => {
            if (response.code === 200) {
                // console.log(response?.data);
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 1)
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
        fetchList(currentPage, filters, scheduleFilters, areaSelected, rowSelected);
    }, [currentPage, filters, scheduleFilters, areaSelected, rowSelected]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const scheduleFilteredData = (newFilters = {}) => {
        setScheduleFilters(newFilters);
        setCurrentPage(1);
    };
    const openModal = (bookingId) => {
        const rsaObj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            service_type : 'Portable Charger',
        };
        postRequestWithToken('all-rsa-list', rsaObj, async(response) => {
            if (response.code === 200) {
                setRsaList(response?.data) 
            } else {
                console.log('error in rsa-listt api', response);
            }
        })
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBookingId(null);
        setSelectedRiderId(null)
    };
    const handleDriverSelect = (driver) => {
        setSelectedDriverId(driver);
    };

    const assignDriver = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            rsa_id     : selectedDriverId, 
            booking_id : selectedBookingId
        }
        postRequestWithToken('/charger-booking-assign', obj, async(response) => {
            if (response.code === 200) {
                setSelectedBookingId(null);
                setSelectedRiderId(null)
                setIsModalOpen(false);
                toast(response.message || response.message[0], {type:'success'})
                setTimeout(() => {
                    fetchList(currentPage, filters, scheduleFilters);
                }, 1000);
            } else {
                toast(response.message || response.message[0], {type:'error'})
                // alert(response.message || response.message[0])
                console.log('error in/charger-booking-assign api', response);
            }
        })
    }
    const handleDownloadClick = async() => {
        const { start_date, end_date, status, search_text } = filters;
        
        let url = process.env.REACT_APP_SERVER_URL+'admin/pod-booking-list-download';
        // Append query parameters only if they are not null or undefined
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        if (status) params.append('status', status);
        if (search_text) params.append('search_text', search_text);
        if (scheduleFilters?.start_date) params.append('scheduled_start_date', scheduleFilters.start_date);
        if (scheduleFilters?.end_date) params.append('scheduled_end_date', scheduleFilters.end_date);
    
        // If any query parameters were added, append them to the URL
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        try {
            // const response = await axios.get(url, { responseType: 'blob' });
            const response = await axios.get(url, { responseType: 'blob', headers : {"authorization" : process.env.REACT_APP_Authorization, } });

            const blob = new Blob([response.data], {
                type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link    = document.createElement('a');
            link.href     = window.URL.createObjectURL(blob);
            link.download = 'pod_booking_list.xlsx';
            link.click(); 
        } catch (error) {
            console.error('Error downloading file:', error);
        }      
    }
    const handleArea = (valaa) =>{
        setAreaSelected(valaa);
        setCurrentPage(1);
    }
    const handleRowperPagePage = (limit) => {
        setARowSelected(limit);
    };
    return (
        <div className='main-container'>
            <SubHeader
                heading              = "Home Charger Booking List"
                fetchFilteredData    = {fetchFilteredData}
                dynamicFilters       = {dynamicFilters}
                filterValues         = {filters}
                searchTerm           = {searchTerm}
                count                = {totalCount}
                setDownloadClicked   = {setDownloadClicked}
                // handleDownloadClick  = {handleDownloadClick}  
                scheduleDateChange   = {scheduleFilteredData}
                scheduleFilters      = {scheduleFilters}
                areaOptions          = {areaOptions}
                areaSelected         = {areaSelected}
                handleArea           = {handleArea}
                rowOptions           = {rowOptions}
                rowSelected          = {rowSelected}
                handleRowperPagePage = {handleRowperPagePage}
            />
            <ToastContainer />
            
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Booking Date", "Schedule Date", "Schedule Time", "Booking ID", "Customer Name", "City", "Status", "Driver Name", "Driver Assign", "Action", ""]}
                        message="No data available"
                    />
                ) : (  // "Service Name", , format : (time) => moment(time).format('hh:mm A')  area
                <>
                    <List
                        tableHeaders={["Booking Date", "Schedule Date", "Schedule Time", "Booking ID", "Customer Name", "City", "Status", "Driver Name", "Driver Assign", "Action",""]}
                        listData={chargerBookingList}
                        pageHeading="Home Charger Booking List"
                        keyMapping={[
                            { key: 'created_at', label: 'Date & Time',   format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'slot_date',  label: 'Schedule Date', format: (date) => moment(date).format('DD MMM YYYY') },
                            { key: 'slot_time',  label: 'Schedule Time', format: (date) => moment(date).format(' hh:mm A') },
                            // { key: 'booking_id', label: 'ID' },
                            { key: 'booking_id',label: 'ID', relatedKeys : ['rescheduled_booking'],
                                format : (data, key, relatedKeys) => {
                                    const bookingId = data[key];
                                    const isRescheduled = data[relatedKeys[0]];
                                
                                    return (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{bookingId}</span>
                                        {isRescheduled > 0 && (
                                        <span style={{ backgroundColor: '#00b26b', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '0.75rem', marginTop: '4px',
                                            display: 'inline-block', width: 'fit-content' }}>
                                            Rescheduled
                                        </span>
                                        )}
                                    </div>
                                    );
                                }
                            },
                            { key: 'user_name',     label: 'Customer Name' }, 
                            { key: 'city',          label: 'City' }, 
                            { key: 'status',        label: 'Status', format: (status) => statusMapping[status] || status },                    
                            { key: 'rsa_name',      label: 'Driver Name' }, 
                            { key: 'driver_assign', label: 'Driver Assign', relatedKeys: ['status'], 
                                format: (data, key, relatedKeys) => {
                                    const isBookingConfirmed = ['CNF', 'A'].includes(data[relatedKeys[0]]);
                                    return isBookingConfirmed ? (
                                        <img src={AddDriver} className={"logo"} onClick={() => openModal(data.booking_id)} alt="Assign Driver" />
                                    ) : null;
                                }
                            },
                            { key: 'action', label: 'Action', relatedKeys: ['status'], 
                                format: (data, key, relatedKeys) => {
                                    // const isCancelable = data[relatedKeys[0]] !== 'C'; 
                                    const isCancelable = !['C', 'PU', 'RO'].includes(data[relatedKeys[0]]);
                            
                                    return (
                                        <div className="editButtonSection">
                                            {/* View Button (Always Displayed) */}
                                            <img src={View} alt="view" onClick={() => handleBookingDetails(data.booking_id)} className="viewButton" />
                            
                                            {/* Cancel Button (Displayed Conditionally) */}
                                            {isCancelable && userDetails.departmentId == 1 && (
                                                <img src={Cancel} alt="cancel" onClick={() => handleCancelClick(data.booking_id, data.rider_id)} className="viewButton" />
                                            )}
                                            {/* Alert Icon */}
                                            {data.address_alert && (<>
                                                <img src={Alert} alt="alert" className="viewButton" data-tooltip-id="alert-tooltip" data-tooltip-content={data.address_alert} />
                                                <Tooltip id="alert-tooltip" style={{backgroundColor: "#00b26b", color: "#fff"}} />
                                                </>
                                            )}
                                        </div>
                                    );
                                }
                            }                           
                        ]}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}

            <Custommodal isOpen={isModalOpen} onClose={closeModal} driverList={rsaList} bookingId= {selectedBookingId} onSelectDriver={handleDriverSelect} onAssignDriver={assignDriver} />

            {showPopup && (
                <ModalAssign isOpen={showPopup} onClose={handleClosePopup} onAssign={handleConfirmCancel} buttonName = 'Submit'>
                    <div className="modalHeading">Reason for Cancellation</div>
                    <textarea id="reason" placeholder="Enter reason" className="modal-textarea" rows="4" value={reason} onChange={handleReasonChange} />
                </ModalAssign>
            )}
        </div>
    );
};

export default ChargerBookingList;
