import { useEffect, useState } from 'react';
import styles from './emergency.module.css'
import { useNavigate } from 'react-router-dom';
import Eye from '../../../assets/images/ViewEye.svg'
import moment from 'moment';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests'; 
import Filter from '../../../assets/images/Filter.svg';
import AccordionFilter from '../../SharedComponent/Accordion/Accordions';

const OfferHistory = ({offerId}) => {
    const navigate                                          = useNavigate();
    const userDetails                                       = JSON.parse(sessionStorage.getItem('userDetails')); 
    const [history, setHistory]                             = useState([]);
    const [currentPage, setCurrentPage]                     = useState(1);
    const [totalPages, setTotalPages]                       = useState(1);
    const [filters, setFilters]                             = useState({start_date: null,end_date: null});
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);

    const offerClickHistory = (page_no = 1) => {
        const bookingObj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            offerId : offerId,
            page_no : page_no,
            ...filters
        };  
        postRequestWithToken('offer-click-history', bookingObj, (response) => {
            if (response.code === 200) {
                setHistory(response?.data || []);
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in rider-details API', response);
            }
        });
    };
    useEffect(() => {
        offerClickHistory(currentPage);

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
    
    return (
        <div className={styles.addressListContainer}>
            <div className={styles.headerCharger}>
                <span className={styles.sectionTitle}>History</span>
                <div className={styles.addButtonSection} onClick={toggleFilterAccordion}>
                    <div className={styles.addButtonImg}>
                        <img src={Filter} alt='Filter' />
                    </div>
                    <div className={styles.addButtonText}>Filter</div>
                </div>
            </div>

            {isFilterAccordionOpen && (
                <div className={styles.accordian}>
                    <AccordionFilter type={"Offer Details"} isOpen={isFilterAccordionOpen} fetchFilteredData={fetchFilteredData} filterValues={filters} />
                </div>
            )}
            
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        {/* <th>Sr. No.</th> */}
                        <th>Date</th>
                        <th>No of clicks</th>
                    </tr>
                </thead>
                <tbody>
                    {history && history?.length > 0 ? (
                        history?.map((item, index) => (
                            <tr key={index}>
                                {/* <td>{ index + 1 }</td> */}
                                <td>{ moment(item?.created_at).format('DD MMM YYYY') }</td>
                                <td>{item?.click_count }</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" style={{ textAlign: 'start', padding: '10px' }}>
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
export default OfferHistory;