import { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List.jsx';
import styles from './RideList.module.css';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader.jsx';
import Pagination from '../../SharedComponent/Pagination/Pagination.jsx';
import { postRequestWithToken } from '../../../api/Requests.js';
import moment from 'moment';
// import AddDriver from '../../../assets/images/AddDriver.svg';
// import Cancel from '../../../assets/images/Cancel.svg';
//import View from '../../../assets/images/ViewEye.svg'
// import ModalAssign from '../../SharedComponent/BookingDetails/ModalAssign.jsx'
// import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
// import Custommodal from '../../SharedComponent/CustomModal/CustomModal.jsx';
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import View from '../../../assets/images/ViewEye.svg'
import AddDriver from '../../../assets/images/AddDriver.svg';

// import { utils, writeFile } from 'xlsx';
// import axios from 'axios';

const searchTerm = [
    {
        label: 'search',
        name: 'search_text',
        type: 'text'
    }
]
const supportStatus = {
    1: "Open",
    2: "In Progress",
    3: "Resolved"
};

const RefundRequestList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const { customerId } = useParams()
    const [chargerBookingList, setChargerBookingList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState('');
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [filters, setFilters] = useState({ start_date: null, end_date: null });
    const [scheduleFilters, setScheduleFilters] = useState({ start_date: null, end_date: null });

    const [loading, setLoading] = useState(false);
    const [downloadClicked, setDownloadClicked] = useState(false)

    //const handleBookingDetails = (id) => navigate(`/mobility/ride/support-request-details/${id}`)
    const openDescriptionModal = (row) => {
        console.log("Row =>", row);

        setSelectedRefund(row);
        setDescription('');
        setShowModal(true);
    };

    const submitDescription = () => {
        console.log("selectedRefund =>", selectedRefund);

        if (!description.trim()) {
            alert('Please enter description');
            return;
        }

        const obj = {
            id: selectedRefund?.id,
            remark: description,
            userId: userDetails?.user_id,
            email: userDetails?.email
        };
        console.log("Payload =>", obj);


        postRequestWithToken(
            'refund-action',
            obj,
            (response) => {
                if (response.code === 200) {
                    setShowModal(false);
                    setDescription('');
                    fetchList(currentPage, filters);
                }
            }
        );
    };
    const fetchList = (page, appliedFilters = {}, scheduleFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            customerId,
            ...appliedFilters,
            scheduleFilters,
        };
        postRequestWithToken('refund-requests-list', obj, async (response) => {
            if (response.code === 200) {
                setChargerBookingList(response?.data);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in issue-cycle-booking-list', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters, scheduleFilters);
    }, [currentPage, filters, scheduleFilters]);

const handleApprove = (refundRequestId) => {

    const obj = {
        refund_request_id: refundRequestId,
        userId: userDetails?.user_id,
        email: userDetails?.email
    };
    console.log("Payload =>", obj);

    postRequestWithToken(
        'approve-refund-request',
        obj,
        (response) => {

            if (response.status === 1 || response.code === 200) {
                alert('Refund approved successfully');
                fetchList(currentPage, filters);
            } else {
                alert(response.message);
            }
        }
    );
};
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

    const handleBookingDetails = (id) => navigate(`/mobility/ride/refund-action/${id}`)

    return (
        <div className='main-container'>
            <SubHeader
                heading="Refund Request List" // Incomplete Ride Booking List
                fetchFilteredData={fetchFilteredData}
                // dynamicFilters      = {dynamicFilters}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            // scheduleDateChange  = {scheduleFilteredData}
            // scheduleFilters     = {scheduleFilters}
            />
            {loading ? <Loader /> :
                chargerBookingList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Date", "Customer ID", "Customer Name", "Mobile No.", "Refundable Amount", "Action"]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List
                            tableHeaders={["Date", "Customer ID", "Customer Name", "Mobile No.", "Refundable Amount", "Status", "Action"]}
                            listData={chargerBookingList}
                            keyMapping={[
                                { key: 'created_at', label: 'Date & Time', format: (date) => moment(date).format('DD MMM YYYY') },
                                { key: 'rider_id', label: 'Customer ID' },
                                { key: 'user_name', label: 'Customer Name' },
                                { key: 'contact_no', label: 'Mobile No.' },

                                { key: 'requested_amount', label: 'Refundable Amount' },
                                {
                                key: 'status',
                                label: 'Status',
                                format: (status) => (
                                    <span
                                    className={
                                        status === 'approved'
                                        ? styles.approvedStatus
                                        : styles.pendingStatus
                                    }
                                    >
                                    {status === 'approved' ? 'Approved' : 'Pending'}
                                    </span>
                                )
                                },
                        // {
                        //     key: 'id',
                        //     label: 'Action',
                        //     relatedKeys: ['status'],
                        //     format: (id, status) => (
                        //         status?.toLowerCase() === 'approved'
                        //             ? '-'
                        //             : (
                        //                 <button
                        //                     className={styles.approveBtn}
                        //                     onClick={() => handleApprove(id)}
                        //                 >
                        //                     Approve
                        //                 </button>
                        //             )
                        //     )
                        // }
                                //{ key: 'status', label: 'Status', format: (status) => supportStatus[status] },
                                //{ key: 'issue_text', label: 'Issue' },
                                // {
                                //     key: 'id',
                                //     label: 'Action',
                                //     format: (id) => (
                                //         <div className="editButtonSection">
                                //             <img
                                //                 src={AddDriver}
                                //                 alt="Add"
                                //                 onClick={() => navigate(`refund-action/${id}`)}
                                //             />
                                //         </div>
                                //     )
                                // }
                                // {
                                //     key: 'action', label: 'Action', relatedKeys: ['status'],
                                //     format: (data, key, relatedKeys) => {
                                //         return (
                                //             <div className="editButtonSection">
                                //                 <img src={View} alt="view" className="viewButton" onClick={() => handleBookingDetails(data.booking_id)} />
                                //             </div>
                                //         );
                                //     }
                                // }
                            ]}
                            pageHeading="Refund Request List"
                            handleApprove={handleApprove}
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        {showModal && (
                            <div className={styles.modalOverlay}>
                                <div className={styles.modalContainer}>
                                    <h3 className={styles.modalTitle}>
                                        Add Description
                                    </h3>

                                    <textarea
                                        className={styles.descriptionInput}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter description"
                                        rows={5}
                                    />

                                    <div className={styles.buttonSection}>
                                        <button
                                            className={styles.closeBtn}
                                            onClick={() => setShowModal(false)}
                                        >
                                            Close
                                        </button>

                                        <button
                                            className={styles.submitBtn}
                                            onClick={submitDescription}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                    //</>
                )}
        </div>
    );
};

export default RefundRequestList;
