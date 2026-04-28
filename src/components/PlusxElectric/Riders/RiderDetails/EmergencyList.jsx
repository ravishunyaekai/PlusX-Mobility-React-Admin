import { useEffect, useState } from 'react';
import styles from './emergency.module.css'
import { Link, useNavigate } from 'react-router-dom';
import Eye from '../../../../assets/images/ViewEye.svg'
import moment from 'moment';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../../api/Requests'; 
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Filter from '../../../../assets/images/Filter.svg';
import AccordionFilter from '../../../SharedComponent/Accordion/Accordions';

    const pickDropStatusMapping = {
        'CNF' : 'Booking Confirmed',
        'A'   : 'Assigned',
        'ER'  : 'Enroute',
        'RL'  : 'POD Reached at Location',
        'CS'  : 'Charging Started',
        'CC'  : 'Charging Completed',
        'PU'  : 'Completed',
        'P'   : 'Open',
        'VP'  : 'Vehicle Pickup',
        'RS'  : 'Reached Charging Spot',
        'WC'  : 'Work Completed',
        'DO'  : 'Drop Off',
        'C'   : "Cancelled",
        'RO' : 'POD Reached at Office'
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
                { value : 'C',   label : 'Cancelled' },
                { value : 'RO',   label : 'POD Reached at Office' },
            ]
        },
    ];

    const EmergencyList = ({rsaId, bookingType}) => {
        const navigate = useNavigate();
        const userDetails                                       = JSON.parse(sessionStorage.getItem('userDetails')); 
        const [history, setHistory]                             = useState([]);
        const [currentPage, setCurrentPage]                     = useState(1);
        const [totalPages, setTotalPages]                       = useState(1);
        const [totalCount, setTotalCount]                       = useState(1);
        const [filters, setFilters]                             = useState({start_date: null,end_date: null});
        const [scheduleFilters, setScheduleFilters]             = useState({start_date: null,end_date: null});
        const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);

        const driverBookingList = (page_no = 1) => {
            const bookingObj = {
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                rsa_id     : rsaId,
                driverType : bookingType, 
                page_no    : page_no,
                ...filters,
                scheduleFilters,
                // rsa_id, bookingTypeValue, page_no, order_status, start_date, end_date, search_text = '', scheduleFilters 
    
            };  
            postRequestWithToken('rsa-booking-list', bookingObj, (response) => {
                if (response.code === 200) {
                
                    setHistory(response?.data || []);
                    setTotalPages(response?.total_page || 1);
                    // setTotalPages(response?.total_page || 1);
                } else {
                    console.log('error in rider-details API', response);
                }
            });
        };
        useEffect(() => {
            driverBookingList(currentPage);

        }, [currentPage, filters, scheduleFilters]);

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

        const toggleFilterAccordion = () => {
            setIsFilterAccordionOpen((prev)=> !prev);
        };
        const renderBooking = (e) => {
            const id = e.target.textContent.trim();
            navigate(`/home-charger/charger-booking-details/${id}`); 
        }
        return (
            <div className={styles.addressListContainer}>
                <div className={styles.headerCharger}>
                    <span className={styles.sectionTitle}>Booking Details</span>
                    <div className={styles.addButtonSection} onClick={toggleFilterAccordion}>
                        <div className={styles.addButtonImg}>
                            <img src={Filter} alt='Filter' />
                        </div>
                        <div className={styles.addButtonText}>Filter</div>
                    </div>
                </div>

                {isFilterAccordionOpen && (
                    <div className={styles.accordian}>
                        <AccordionFilter
                            type={"Driver Details"}
                            isOpen={isFilterAccordionOpen}
                            fetchFilteredData={fetchFilteredData}
                            dynamicFilters={dynamicFilters}
                            filterValues={filters}
                            scheduleDateChange={scheduleFilteredData}
                            scheduleFilters={scheduleFilters}
                        />
                    </div>
                )}
                
                <table className={`table ${styles.customTable}`}>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Schedule Date</th>
                            <th>Schedule Time</th>
                            <th>Booking Date</th>
                            <th>Customer Name</th>
                            {/* <th>Price</th> */}
                            <th>Status</th>
                            {/* <th>Action</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {history && history?.length > 0 ? (
                            history?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        {/* <a onClick={renderBooking} style={{color : "#00b26b !important"}}>{item?.booking_id } </a> */}
                                        {item?.booking_id }
                                    </td>
                                    <td>{moment(item?.slot_date || item?.slot_date_time).format('DD MMM YYYY') }</td>
                                    <td>{moment(item?.slot_time || item?.slot_date_time).format('hh:mm A') }</td>
                                    <td>{moment(item?.created_at).format('DD MMM YYYY') }</td>
                                    <td>{item?.user_name}</td>
                                    {/* <td>{item?.price ? `${item?.price} INR` : '' }</td> */}
                                    <td>{pickDropStatusMapping[item?.status] || 'Confirmed'}</td>
                                    {/* <td>
                                        <div className={styles.editContent}>
                                            {bookingType === 'Valet Charging' ? (
                                                    <Link to={`/pick-and-drop/booking-details/${item?.booking_id}`}>
                                                        <img src={Eye} alt="View" />
                                                    </Link>
                                                ) : (
                                                    <Link to={`/home-charger/charger-booking-details/${item?.booking_id}`}>
                                                        <img src={Eye} alt="View" />
                                                    </Link>
                                                )}
                                        </div>
                                    </td> */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'start', padding: '10px' }}>
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        );
    };
    export default EmergencyList;