import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import List from '../../SharedComponent/List/List';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader';
import Pagination from '../../SharedComponent/Pagination/Pagination';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const dynamicFilters = [];

const PublicInvoiceList = () => {
    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const navigate = useNavigate();

    const [invoiceList, setInvoiceList] = useState([]);
    const [scheduleFilters, setScheduleFilters] = useState({
        start_date: null,
        end_date: null,
        search_text: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(null);

    const [filters, setFilters] = useState({
        start_date: null,
        end_date: null,
        search_text: ''
    });

    const [loading, setLoading] = useState(false);

    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ];

    const addButtonProps = {
        heading: "Create Invoice",
        link: "/electric/community/create-invoice"
    };

    const fetchList = (page, appliedFilters = {}) => {

        if (
            page === 1 &&
            Object.keys(appliedFilters).length === 0
        ) {
            setLoading(false);
        } else {
            setLoading(true);
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            ...appliedFilters,
        };

        postRequestWithToken(
            'scan-charge-invoice-list',
            obj,
            async (response) => {

                if (response.code === 200) {

                    setInvoiceList(
                        response?.data || []
                    );

                    setTotalPages(
                        response?.total_page || 1
                    );

                    setTotalCount(
                        response?.total || 0
                    );

                } else {

                    console.log(
                        'error in scan-charge-invoice-list api',
                        response
                    );

                    setInvoiceList([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }

                setLoading(false);
            }
        );
    };

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate('/login');
            return;
        }

        fetchList(
            currentPage,
            filters
        );

    }, [currentPage, filters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    const fetchFilteredData = (newFilters = {}) => {
        console.log("Selected filters:", newFilters);

        setFilters({
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null,
            search_text: newFilters?.search_text || ''
        });

        setCurrentPage(1);
    };
    const scheduleFilteredData = (newFilters = {}) => {
        console.log("Selected filters:", newFilters);

        setScheduleFilters({
            start_date: newFilters?.start_date || null,
            end_date: newFilters?.end_date || null,
            search_text: newFilters?.search_text || ''
        });

        setCurrentPage(1);
    };

    const handleDeleteInvoice = (invoiceId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this invoice?"
        );

        if (!confirmDelete) {
            return;
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            invoice_id: invoiceId
        };

        // Change this API endpoint if you have a different
        // invoice delete API.
        postRequestWithToken(
            'scan-charge-invoice-delete',
            obj,
            async (response) => {

                if (response.code === 200) {

                    toast(
                        response.message,
                        { type: "success" }
                    );

                    setTimeout(() => {
                        fetchList(
                            currentPage,
                            filters
                        );
                    }, 1000);

                } else {

                    toast(
                        response.message,
                        { type: 'error' }
                    );

                    console.log(
                        'error in invoice delete api',
                        response
                    );
                }
            }
        );
    };

    return (
        <div className='main-container'>

            <ToastContainer />

            <SubHeader
                heading="Total Invoice List"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={dynamicFilters}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
                scheduleDateChange={scheduleFilteredData}
                scheduleFilters={scheduleFilters}
            />

            {loading ? (

                <Loader />

            ) : invoiceList.length === 0 ? (

                <EmptyList
                    tableHeaders={[
                        "Resident Name",
                        "Community",
                        "Area",
                        "kWh Allocated",
                        "kWh Used",
                        "Per kWh Charge",
                        "Price (INR)",
                        "Over Time (INR)",
                        "Status",
                        "Action"
                    ]}
                    message="No data available"
                />

            ) : (

                <>
                    <List
                        tableHeaders={[
                            "Resident Name",
                            "Community",
                            "Area",
                            "kWh Allocated",
                            "kWh Used",
                            "Per kWh Charge",
                            "Price (INR)",
                            "Over Time (INR)",
                            "Status",
                            "Action"
                        ]}
                        listData={invoiceList}
                        pageHeading="Total Invoice List"
                        onDeleteSlot={handleDeleteInvoice}

                        keyMapping={[
                            {
                                key: 'resident_name',
                                label: 'Resident Name'
                            },
                            {
                                key: 'community_name',
                                label: 'Community'
                            },
                            {
                                key: 'area_name',
                                label: 'Area'
                            },
                            {
                                key: 'kwh_allocated',
                                label: 'kWh Allocated'
                            },
                            {
                                key: 'total_consumption',
                                label: 'kWh Used'
                            },
                            {
                                key: 'per_kwh_charge',
                                label: 'Per kWh Charge',
                                format: (value) =>
                                    value !== null &&
                                        value !== undefined &&
                                        value !== ''
                                        ? `INR ${value}`
                                        : ''
                            },
                            {
                                key: 'energy_price_total',
                                label: 'Price (INR)',
                                format: (value) =>
                                    value !== null &&
                                        value !== undefined &&
                                        value !== ''
                                        ? `INR ${value}`
                                        : ''
                            },
                            {
                                key: 'extra_charge_total',
                                label: 'Over Time (INR)',
                                format: (value) =>
                                    value !== null &&
                                        value !== undefined &&
                                        value !== ''
                                        ? `INR ${value}`
                                        : ''
                            },
                            {
                                key: 'invoice_status',
                                label: 'Status'
                            }
                        ]}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>

            )}
        </div>
    );
};

export default PublicInvoiceList;