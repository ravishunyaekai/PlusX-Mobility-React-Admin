import {useState, useEffect} from 'react';
import styles from './emergency.module.css'
import { Link } from 'react-router-dom';
import Eye from '../../../../assets/images/ViewEye.svg'
import moment from 'moment';
// import { getAddressFromLatLong } from '../../../api/Requests'; 
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import AccordionFilter from '../../../SharedComponent/Accordion/Accordions';
import { postRequestWithToken } from '../../../../api/Requests'; 
import Filter from '../../../../assets/images/Filter.svg';

const DriverLocationList = ({rsaId}) => {  // postRequest
    const userDetails                                       = JSON.parse(sessionStorage.getItem('userDetails')); 
    const [currentPage, setCurrentPage]                     = useState(1);
    const [totalPages, setTotalPages]                       = useState(1);
    // const [totalCount, setTotalCount]                       = useState(1);
    const [filters, setFilters]                             = useState({start_date: null,end_date: null});
    const [history, setHistory]                             = useState([]);
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);

    const driverlocationList = (page_no = 1) => {
        const bookingObj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            rsa_id     : rsaId,
            page_no    : page_no,
            ...filters,
        };  
        postRequestWithToken('rsa-location-list', bookingObj, (response) => {
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
        driverlocationList(currentPage);

    }, [currentPage, filters]);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const toggleFilterAccordion = () => {
        setIsFilterAccordionOpen((prev)=> !prev);
    };
    // const getAddrea = (latitude, longitude) => {
    //     getAddressFromLatLong(latitude, longitude, (response) => {
    //         let resp =  response ? response : 'No address found';
    //         console.log(resp)
    //         return resp;
    //     });
    // }
    return (
        <div className={styles.addressListContainer}>
            {/* <span className={styles.sectionTitle}>Driver Location Details</span> */}
            <div className={styles.headerCharger}>
                    <span className={styles.sectionTitle}>Driver Location Details</span>
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
                        type={"Driver Location"}
                        isOpen={isFilterAccordionOpen}
                        fetchFilteredData={fetchFilteredData}
                        filterValues={filters}
                    />
                </div>
            )}
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Sr No.</th>
                        <th>Date </th>
                        <th>Time</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {history && history?.length > 0 ? (
                        history?.map((item, index) => (
                            <tr key={index}>
                                <td>{ index+1 }</td>
                                <td>{moment(item?.created_at).format('DD MMM YYYY') }</td>
                                <td>{moment(item?.created_at).format('HH:mm A') }</td>
                                <td>
                                    <a href={`https://www.google.com/maps?q=${item?.latitude},${item?.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='linkSection'
                                    >
                                        {'Location View on Map'}
                                    </a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'start', padding: '10px' }}>
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

export default DriverLocationList;