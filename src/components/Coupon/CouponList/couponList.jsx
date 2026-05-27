import { useEffect, useState } from 'react';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';
import style from "./coupon.module.css";

const CouponList = () => {

    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();

    const [couponList, setCouponList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(false);

    const searchTerm = [
        {
            label: 'Search',
            name: 'search_text',
            type: 'text'
        }
    ];

    const addButtonProps = {
        heading: "Add Coupon",
        link: "/coupon/add-coupon"
    };

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
            ...appliedFilters
        };

        postRequestWithToken('coupon-list', obj, (response) => {
            if (response.code === 200) {
                setCouponList(response?.data || []);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0);
            } else {
                console.log('error in coupon-list api', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchList(currentPage, filters);
    }, [currentPage, filters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this coupon?");
        if (!confirmDelete) return;

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            coupon_id: id
        };

        postRequestWithToken('coupon-delete', obj, (res) => {
            if (res.code === 200) {
                toast(res.message, { type: "success" });
                fetchList(currentPage);
            } else {
                toast(res.message, { type: "error" });
            }
        });
    };

    const handleStatusChange = (e, id) => {
        const confirmChange = window.confirm("Change coupon status?");
        if (!confirmChange) return;

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            coupon_id: id,
            status: e.target.checked ? 1 : 0
        };

        postRequestWithToken('coupon-status-change', obj, (res) => {
            if (res.code === 200) {
                toast(res.message, { type: "success" });
                fetchList(currentPage);
            } else {
                toast(res.message, { type: "error" });
            }
        });
    };

    return (
        <div className='main-container'>
            <ToastContainer />

            <SubHeader
                heading="List of Coupons"
                addButtonProps={addButtonProps}
                fetchFilteredData={fetchFilteredData}
                dynamicFilters={[]}
                filterValues={filters}
                searchTerm={searchTerm}
                count={totalCount}
            />

            {loading ? <Loader /> :
                couponList.length === 0 ? (
                    <EmptyList
                        tableHeaders={[
                            "Coupon Name",
                            "Coupon Code",
                            "Discount %",
                            "Usage Limit",
                            "Expiry Date",
                            "Type",
                            "Status",
                            "Action"
                        ]}
                        message="No data available"
                    />
                ) : (
                    <>
                      <List
                            tableHeaders={[
                                "Coupon Name",
                                "Coupon Code",
                                "Discount %",
                                "Usage Limit",
                                "Expiry Date",
                                "Type",
                                "Status",
                                "Action"
                            ]}
                            listData={couponList}
                            pageHeading="Coupon List"   
                            onDeleteSlot={handleDelete} 
                            keyMapping={[
                                { key: 'coupan_name', label: 'Coupon Name' },
                                { key: 'coupan_code', label: 'Coupon Code' },
                                { key: 'coupan_percentage', label: 'Discount %' },
                                { key: 'user_per_user', label: 'Usage Limit' },
                                { key: 'end_date', label: 'Expiry Date' },

                                {
                                key: 'coupon_type',
                                label: 'Type',
                                format: (value) =>
                                    value === 'universal' ? 'Universal' : 'Station'
                                },

                                {
                                key: 'status',
                                label: 'Status',
                                relatedKeys: ['id'],
                                format: (value) => {
                                    return (
                                    <label className={style.switch}>
                                        <input
                                        type="checkbox"
                                        className={style.switchInput}
                                        checked={value.status === "1"}
                                        onChange={(e) => handleStatusChange(e, value.id)}
                                        />
                                        <span className={style.slider}></span>
                                    </label>
                                    );
                                }
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

export default CouponList;