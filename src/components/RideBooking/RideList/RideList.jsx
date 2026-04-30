import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken, postRequest } from '../../../api/Requests';
import moment from 'moment';
import View from '../../../assets/images/ViewEye.svg'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import { statusCode, statusMapping } from "../../../utils/statusMapping.js";
import AddDriver from '../../../assets/images/AddDriver.svg';
import LockerModal from '../../SharedComponent/CustomModal/LockerModal.jsx';

const searchTerm = [
    {
        label: 'search',
        name: 'search_text',
        type: 'text'
    }
]
const RideList = () => {
    const [cityOptions, setCityOptions] = useState([]);

    const [dynamicFilters, setDynamicFilters] = useState([
        {
            label: 'City',
            name: 'city_id',
            type: 'select',
            options: cityOptions
        },
        {
            label: 'Station',
            name: 'station_id',
            type: 'select',
            options: []
        },
        {
            label: 'Bookings Status',
            name: 'status',
            type: 'select',
            options: [
                { value: statusCode.CMP, label: statusMapping.CMP },
                { value: statusCode.ON, label: statusMapping.ON }
            ]
        },
        {
            label: 'Handover Type',
            name: 'handover_type',
            type: 'select',
            options: [
                { value: "manual", label: "Manual" },
                { value: "self", label: "Self" },
                { value: "manual_admin", label: "Admin" }
            ]
        }
    ]);


    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingStation, setLoadingStation] = useState(false);
    const [loadingLocker, setLoadingLocker] = useState(false);

    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(null);
    const [filters, setFilters] = useState({ start_date: null, end_date: null });
    const [scheduleFilters, setScheduleFilters] = useState({ start_date: null, end_date: null });
    const [areaSelected, setAreaSelected] = useState('');
    const [rowSelected, setARowSelected] = useState(10);
    const [stationOption, setStationOption] = useState([]);
    const [lockerOption, setLockerOption] = useState([]);

    // Modal Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cycleId, setCycleId] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [form, setForm] = useState({ cycle_id: "", station_id: "", lock_number: "" });

    const getCities = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email
        };
        postRequestWithToken('city-list', obj, (response) => {
            if (response.status === 1) {

                setCityOptions(response.data);
                setDynamicFilters(prevFilters =>
                    prevFilters.map(filter =>
                        filter.name === 'city_id'
                            ? { ...filter, options: response.data }
                            : filter
                    )
                );

            } else {
                console.log("City list error", response);
            }
        });
    };

    const getStationsByCity = (city) => {
        const cityId = typeof city === "object" ? city.value : city;

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            city_id: cityId
        };
        postRequestWithToken('station-list', obj, (response) => {
            if (response.status === 1) {

                const stationData = response.data;

                setDynamicFilters(prevFilters =>
                    prevFilters.map(filter =>
                        filter.name === 'station_id'
                            ? { ...filter, options: response.data }
                            : filter
                    )
                );

            } else {
                console.log("Station list error", response);
            }
        });
    };

    const getStations = () => {
        const userObj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            cycle_id: cycleId,
        };
        setLoadingStation(true);
        postRequestWithToken('station-list-locker-assign', userObj, (response) => {
            if (response.code === 200) {
                const stationsList = (response?.data || []).map(item => ({
                    label: item.station_name,
                    value: item.station_id,
                    city_id: item.city_id
                }));
                setStationOption(stationsList);
                setLoadingStation(false);
            } else {
                console.log('error in station-list-locker-assign API', response);
                setLoadingStation(false);
            }
        });
    };

    const getLockers = () => {
        const userObj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            station_id: form.station_id?.value,
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

    const bookingFields = [
        { name: "cycle_id", type: "text", placeholder: "Enter Cycle ID", fieldLabel: "Cycle ID", disabled: true },
        { name: "station_id", type: "dropdown", placeholder: "Select Station", fieldLabel: "Stations", options: stationOption, loading: loadingStation, onOpen: getStations, },
        { name: "lock_number", type: "dropdown", placeholder: "Select Locker", fieldLabel: "Lock Number", options: lockerOption, loading: loadingLocker, onOpen: getLockers, }
    ];

    const handleBookingDetails = (id) => navigate(`/mobility/ride/ride-booking-details/${id}`)

    const fetchList = (page, appliedFilters = {}, scheduleFilters = {}, areaSelected = '', rowSelected = 10) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            ...appliedFilters,
            scheduleFilters,
            areaSelected,
            rowSelected,
            
        };
        
        postRequestWithToken('cycle-booking-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in Cycle-booking-list api', response);
            }
            setLoading(false);
        });
    };
    useEffect(() => {

        getCities();

    }, []);

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
        console.log(newFilters.city_id);
        const newCity = newFilters?.city_id;
        const oldCity = filters?.city_id;

        if (newCity && newCity !== oldCity) {
            getStationsByCity(newCity);
        }

        setFilters(newFilters);
        setCurrentPage(1);
    };
    const scheduleFilteredData = (newFilters = {}) => {

        setScheduleFilters(newFilters);
        setCurrentPage(1);
    };
    const openModal = (item) => {
        setCycleId(item.cycle_id);
        setBookingId(item.booking_id);
        setForm({
            cycle_id: item.cycle_id || "",
            station_id: item.station_id || null,
            lock_number: item.lock_number || null,
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setCycleId(null);
        setBookingId(null);
        setLockerOption([]);
        setStationOption([]);
        setForm({ cycle_id: "", station_id: "", lock_number: "" });
    };
    const handleSubmitModal = () => {
        setIsLoading(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            cycle_id: cycleId,
            booking_id: bookingId,
            lock_number: form.lock_number?.value,
            station_id: form.station_id?.value,
        };

        postRequestWithToken('/assign-locker-booking', obj, async (response) => {
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

    return (
        <div className='main-container'>
            <SubHeader
                heading="Ride Booking List"
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            />
            <ToastContainer />

            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Date", "Customer ID", "Customer Name", "Station Name", "Handover Type", "Locker No.", "Assigned Locker", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List
                            tableHeaders={["Date", "Booking ID", "Customer Name", "Station Name", "Handover Type", "Locker No.", "Assigned Locker", "Status", "Action"]}
                            pageHeading="Ride Booking List"
                            listData={chargerBookingList}
                            keyMapping={[
                                { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY') },
                                { key: 'booking_id', label: 'BOOKING ID' },
                                { key: 'user_name', label: 'Customer Name' },
                                { key: 'station_name', label: 'Station Name' },
                                { key: 'handover_type', label: 'Handover Type', format: (value) => value ? value.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '-' },
                                {
                                    key: 'lock_number', label: 'Locker No.', relatedKeys: ['handover_type'],
                                    format: (data) => {
                                        if (data.handover_type !== 'manual') return '-';
                                        if (!data.lock_number) return '-';
                                        const num = data.lock_number.replace('lock', '');
                                        return `Lock ${num}`;
                                    }
                                },
                                {
                                    key: 'assign_locker', label: 'Assigned Locker', relatedKeys: ['handover_type'],
                                    format: (data) => {
                                        if (data.handover_type === 'manual' || data.handover_type === 'manual_admin') {
                                            return <img src={AddDriver} className="logo" alt="assign-locker" onClick={() => openModal(data)} />
                                        }
                                        return '-';
                                    }
                                },
                                { key: 'status', label: 'Status', format: (status) => statusMapping[status] || status },
                                {
                                    key: 'action', label: 'Action', relatedKeys: ['status'],
                                    format: (data, key, relatedKeys) => {
                                        return (
                                            <div className="editButtonSection">
                                                <img src={View} alt="view" className="viewButton" onClick={() => handleBookingDetails(data.booking_id)} />
                                            </div>
                                        );
                                    }
                                }
                            ]}
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
            <LockerModal isOpen={isModalOpen} onClose={closeModal} fields={bookingFields} id={cycleId} formData={form} setForm={setForm} isLoading={isLoading} onSubmit={handleSubmitModal} />

        </div>
    );
};

export default RideList;
