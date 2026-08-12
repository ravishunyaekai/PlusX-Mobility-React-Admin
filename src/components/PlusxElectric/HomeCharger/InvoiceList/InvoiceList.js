import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List';
import styles from './invoice.module.css'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { getRequestWithToken, postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import View from '../../../../assets/images/ViewEye.svg'

const ChargerBookingInvoiceList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [invoiceList, setInvoiceList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(null);
    const [filters, setFilters] = useState({ start_date: null, end_date: null });
    const [loading, setLoading] = useState(false);
    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ]
    const fetchList = (page, appliedFilters = {}) => {
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
        }
        postRequestWithToken('charger-booking-invoice-list', obj, async (response) => {
            if (response.code === 200) {
                setInvoiceList(response?.data)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                // toast(response.message, {type:'error'})
                console.log('error in charger-booking-invoice-list api', response);
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

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const handleInvoiceDetails = (id) => navigate(`/electric/mobile-ev-charging/charger-booking-invoice-details/${id}`)

    return (
        <div className='main-container'>
            <SubHeader
                heading="Mobile EV Charging Invoice List"
                filterValues={filters}
                fetchFilteredData={fetchFilteredData}
                searchTerm={searchTerm}
                count={totalCount}
            />

            {loading ? <Loader /> :
                invoiceList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Invoice Date", "Invoice ID", "Customer Name", "Amount", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List
                            tableHeaders={["Invoice Date", "Invoice ID", "Customer Name", "Amount", "Status", "Action"]}
                            listData={invoiceList}
                            pageHeading="Mobile EV Charging Invoice List"
                            keyMapping={[
                                { key: 'invoice_date', label: 'Invoice Date', format: (date) => moment(date).format('DD MMM YYYY ') },
                                { key: 'invoice_id', label: 'Invoice ID' },
                                { key: 'riderDetails', label: 'Customer Name', format: (riderDetails) => { return riderDetails ? riderDetails.split(',')[0] : ''; } },
                                { key: 'amount', label: 'Amount', format: (amount) => (`${(Number(amount)).toFixed(2)} INR`) },
                                { key: 'payment_status', label: 'Status', format: (status) => (status === "succeeded" ? "Completed" : "Approved") },
                                {
                                    key: 'action', label: 'Action', relatedKeys: ['status'],
                                    format: (data, key, relatedKeys) => {
                                        // const isCancelable = data[relatedKeys[0]] !== 'C'; 
                                        const isCancelable = !['C', 'PU', 'RO'].includes(data[relatedKeys[0]]);

                                        return (
                                            <div className="editButtonSection">
                                                {/* View Button (Always Displayed) */}
                                                <img src={View} alt="view" onClick={() => handleInvoiceDetails(data.invoice_id)} className="viewButton" />
                                            </div>
                                        );
                                    }
                                }

                            ]}
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
        </div>
    );
};

export default ChargerBookingInvoiceList;
