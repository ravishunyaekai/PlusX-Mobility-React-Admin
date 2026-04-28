import { useEffect, useState } from 'react';
import styles from '../AppSignup.module.css';
import { postRequestWithToken } from '../../../api/Requests';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from '../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards';
import AppSignupInfoSection from '../../SharedComponent/Details/NewBookingDetails/AppSignupInfoSection/AppSignupInfoSection';
import moment from 'moment';
import List from '../../SharedComponent/List/List.jsx';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

//Images & Icons
import email from "../../../assets/images/Email.svg";
import date from "../../../assets/images/DateCard.svg";
import profile from "../../../assets/images/ProfileCard.svg";
import mobile from "../../../assets/images/MobileCard.svg";
import View from '../../../assets/images/ViewEye.svg'

import WalletModal from '../../SharedComponent/CustomModal/WalletModal.jsx';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const typeBoject   = { crd : "Wallet Charge", debt : "Ride", refund : "Wallet Charge", sd_refund : "SD Refunded" }
const statusBoject = { crd : "Credited", debt : "Debited", refund : "Refunded", sd_refund : "SD Refunded" }

const AppSignupDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { riderId }                         = useParams();

    const [riderDetails, setRiderDetails]     = useState();
    const [loading, setLoading]               = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingTransaction, setLoadingTransaction] = useState(false);

    const [bookingHistory, setBookingHistory] = useState([]);
    const [currentPage, setCurrentPage]       = useState(1);
    const [totalPages, setTotalPages]         = useState(1);

    const [transactionHistory, setTransactionHistory]         = useState([]);
    const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);
    const [transactiontotalPages, setTransactionTotalPages]   = useState(1);

    // Modal Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading]     = useState(false);
    const [form, setForm]               = useState({ payment_type: {label : 'Refund Amount', value: 'refund'}, amount: "" });

    const bookingFields = [
        { name: "payment_type", type: "dropdown", placeholder: "Select Type", fieldLabel: "Payment Type",    options: [{label : 'Add Amount', value: 'crd'}, {label : 'Refund Amount', value: 'refund'}],},
        { name: "amount", type: "text", placeholder: "Enter Amount", fieldLabel: "Amount"},
    ]; //value={formData[item.name] || null}

    const obj = {
        userId       : userDetails?.user_id,
        email        : userDetails?.email,
        riderId      : riderId,
        service_type : 'App Signup',
        page_no      : currentPage
    };
    const fetchRiderDetails  = () => {
        setLoading(true);
        postRequestWithToken('rider-details', obj, (response) => {
            if (response.code === 200) {
                setRiderDetails(response?.data || {});
            }
            setLoading(false);
        });
    };
    const fetchBookingHistory = () => {
        setLoadingHistory(true);
        postRequestWithToken('cycle-booking-history', obj, async (response) => {
            if (response.code === 200) {
                setBookingHistory(response?.data || []);
                setTotalPages(response?.total_page || 1);
            } 
            setLoadingHistory(false);
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchRiderDetails();
    }, []);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchBookingHistory();
    }, [currentPage]);

    const handleBookingDetails = (id) => navigate(`/mobility/ride/ride-booking-details/${id}`)
    const handlePageChange = (page) => ( setCurrentPage(page) );

    const headerItems = [
        { label: 'Date',       icon: date,  value: moment(riderDetails?.rider.created_at).format('DD MMM YYYY') },
        { label: 'Rider Name', icon: profile, value : riderDetails?.rider.rider_name },
        { label: 'Mobile No.', icon: mobile,  value : riderDetails?.rider.rider_mobile },
        { label: 'Email ID',   icon: email,   value : riderDetails?.rider.rider_email },
        { label: 'outstanding amount',  icon : email,  value : riderDetails?.rider.out_standing_cost },
        { label: 'Wallet Amount',       icon : email,  value : riderDetails?.rider.wallet_money },
        { label: 'Device',              icon : email,  value : riderDetails?.rider.added_from_data },
    ];

    const riderInfoFields = riderDetails?.rider ? [
        ...(riderDetails.rider.student_id ? [
            { label: 'University / College Name', value: riderDetails.rider.university },
            { label: 'Student ID', value: riderDetails.rider.student_id }
        ] : []),
        { label: 'State', value: riderDetails.rider.state },
        { label: 'City',  value: riderDetails.rider.city },
    ] : [];

    const fetchTransactionHistory = () => {
        setLoadingTransaction(true);
        const objH = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            riderId      : riderId,
            page_no      : transactionCurrentPage
        };
        postRequestWithToken('user-transaction-list', objH, async (response) => {
            if (response.code === 200) {
                setTransactionHistory(response?.data || []);
                setTransactionTotalPages(response?.total_page || 1);
            } 
            setLoadingTransaction(false);
        }); //loadingTransaction, setLoadingTransaction
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchTransactionHistory();
    }, [transactionCurrentPage]);

    const handleTransactionPageChange = (page) => ( setTransactionCurrentPage(page) );

    const openModal = () => {
        setForm({
            payment_type : {label : 'Refund Amount', value: 'refund'}, 
            amount       : null,
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setForm({payment_type: {label : 'Refund Amount', value: 'refund'}, amount: "" });
    };
    const handleSubmitModal = () => {
        setIsLoading(true);
        console.log(form.payment_type );
        if(form.payment_type == "" || form.payment_type == null) {
            toast("Please select payment type", { type: 'error' });
            setIsLoading(false);
            return false ;
        } 
        if(form.amount == "" || form.amount == null) {
            toast("Please enter amount", { type: 'error' });
            setIsLoading(false);
            return false ;
        }
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            riderId      : riderId,
            payment_type : form.payment_type?.value,
            amount       : form.amount,
        };
        postRequestWithToken('/add-refund-amount', obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, { type: 'success' });
                setIsModalOpen(false);
                setTimeout(() => {
                    fetchTransactionHistory();
                    fetchRiderDetails();
                }, 1000);
            } else {
                toast(response.message[0], { type: 'error' });
            }
            setIsLoading(false);
        });
    };
    return (
        <div className='main-container'>
            <ToastContainer />
            {loading ?  <Loader /> : (
            <>
                <DetailsCards items={headerItems} />
                <div className={styles.bookingDetailsSection}>
                    {riderInfoFields.length > 0 ? (
                        <AppSignupInfoSection 
                            imageUrl={ riderDetails?.rider?.id_image ? `${riderDetails.base_url}${riderDetails.rider.id_image}` : null }
                            riderInfoFields={riderInfoFields} fieldCount={riderInfoFields.length}
                        />
                    ) : (
                        <div className={styles.noBookingData}>No user info available.</div>
                    )}
                </div>
                
                <div className={styles.bookingDetailsSection}>
                    <div className={styles.DetailsMainHeading}>Ride History</div>
                </div>                
                
                {loadingHistory ? <Loader /> :
                    bookingHistory.length === 0 ? 
                        <EmptyList
                            tableHeaders={["Date", "Booking ID", "Rider Name" ,"Cycle Type" ,"Pick Up Station", "Dropoff Station" , "Status", "Action"]}
                            message="No data available"
                        />
                    : <>
                        <List
                            tableHeaders={["Date", "Booking ID", "Rider Name" ,"Cycle Type" ,"Pick Up Station", "Dropoff Station" , "Status", "Action"]}
                            listData={bookingHistory}
                            pageHeading="Ride History"
                            keyMapping = {[
                                { key: 'created_at',    label: 'Date', format: date => moment(date).format('DD MMM YYYY') },
                                { key: 'booking_id',      label: 'Booking ID' },
                                { key: 'rider_name',      label: 'Rider Name' },
                                { key: 'cycle_type',      label: 'Cycle Type' },
                                { key: 'pickup_station',  label: 'Pickup' },
                                { key: 'dropoff_station', label: 'Drop' },
                                { key: 'status',          label: 'Status' },
                                { key: 'action',          label: 'Action',
                                    relatedKeys: ['status'], 
                                    format: (data, key, relatedKeys) => {                  
                                        return (
                                            <div className="editButtonSection">
                                                <img src={View} alt="view" onClick={() => handleBookingDetails(data.booking_id)} className="viewButton"/>
                                            </div>
                                        );
                                    }
                                }
                            ]}
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </> 
                }
                <div className={styles.bookingHeading}>
                    <div className={styles.DetailsMainHeading}>Transaction History</div>

                    <button className={styles.button} onClick={openModal}>Refund/ Add Amount</button>
                </div> 
                {loadingTransaction ? <Loader /> :
                    transactionHistory.length === 0 ? 
                        <EmptyList
                            tableHeaders={[ "Date", "Amount", "Payment Type", "Outstanding Bal.", "Current Wallet Bal.", "Status", "Ride ID"]}
                            message="No data available"
                        />
                        // "Date", "Amount", "Outstanding", "Previous Bal.", "Current Bal.", "Payment Type", "Payment Ref. ID"
                    : <>
                        <List
                            tableHeaders = {[ "Date", "Amount", "Payment Type", "Outstanding Bal.", "Current Wallet Bal.", "Status", "Ride ID" ]}
                            listData={transactionHistory}
                            pageHeading="Transaction History"
                            keyMapping = {[
                                { key: 'created_at', format: date => moment(date).format('DD MMM YYYY')},
                                { key: 'amount',          format : date => Number(date || 0).toFixed(2) },
                                { key: 'payment_type',    format : data => !typeBoject[data] ? '' : typeBoject[data] },
                                { key: 'outstanding',     format : date => Number(date || 0).toFixed(2)  },
                                // { key: 'prev_balance',    format : date => Number(date || 0).toFixed(2)  },
                                { key: 'current_balance', format : date => Number(date || 0).toFixed(2)  },
                                { key: 'payment_type',    format : data => !statusBoject[data] ? '' : statusBoject[data] },
                                { key: 'order_id' },
                            ]}
                        />
                        <Pagination currentPage={transactionCurrentPage} totalPages={transactiontotalPages} onPageChange={handleTransactionPageChange} />
                    </> 
                }

            </>
            )}
            <WalletModal isOpen={isModalOpen} onClose={closeModal} fields={bookingFields} formData={form} setForm={setForm} isLoading={isLoading} onSubmit={handleSubmitModal} />
        </div>
    );
};

export default AppSignupDetails;
