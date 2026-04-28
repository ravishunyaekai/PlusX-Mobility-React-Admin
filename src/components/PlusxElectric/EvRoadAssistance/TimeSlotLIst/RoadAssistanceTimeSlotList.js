import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Delete from '../../../../assets/images/Delete.svg';
import Edit from '../../../../assets/images/Pen.svg';
import styles from './AddTimeSlot.module.css';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const RoadAssistanceTimeSlotList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails'));
    const access                          = userDetails.access?.split('_') || [];
    const navigate                        = useNavigate();
    const [timeSlotList, setTimeSlotList] = useState([])
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(1);
    const [refresh, setRefresh]           = useState(false)
    const [filters, setFilters]           = useState({start_date: null,end_date: null});
    const [loading, setLoading]           = useState(false);

    const dynamicFilters = [
        {
            label : 'Days', 
            name  : 'days', 
            type  : 'select', 
            options : [
                { value : '',         label : 'Select Days' },
                { value: 'Sunday',    label: 'Sunday' },
                { value: 'Monday',    label: 'Monday' },
                { value: 'Tuesday',   label: 'Tuesday' },
                { value: 'Wednesday', label: 'Wednesday' },
                { value: 'Thursday',  label: 'Thursday' },
                { value: 'Friday',    label: 'Friday' },
                { value: 'Saturday',  label: 'Saturday' },
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
    const addButtonProps = {
        heading : "Add Slot",
        link    : '/electric/ev-road-assistance/add-time-slot'
    };
    const groupBySlotDate = (slots) => {
        const grouped = slots.reduce((acc, slot) => {
            const date = slot.slot_date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(slot);
            return acc;
        }, {});
        return Object.entries(grouped)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([slot_date, slots]) => ({ slot_date, slots }));
    };
    const groupedData = groupBySlotDate(timeSlotList);

    const fetchList = (page, appliedFilters = {}) => {
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
        }
        postRequestWithToken('road-assistance-slot-list', obj, async (response) => {
            if (response.code === 200) {
                // setTimeSlotList(response?.data)
                const updatedData = response.data.map((item) => ({
                    ...item,
                    remaining_booking: (item.booking_limit || 0) - (item.slot_booking_count || 0),
                }));
                setTimeSlotList(updatedData)
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 1)
            } else {
                toast(response.message, { type: 'error' })
                console.log('error in road-assistance-slot-list api', response);
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
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const handleDeleteSlot = (slotDate) => {
        console.log("slotDate",slotDate)
        const confirmDelete = window.confirm("Are you sure you want to delete this slot?");
        if (confirmDelete) {
            const obj = {
                userId    : userDetails?.user_id,
                email     : userDetails?.email,
                slot_date : slotDate
            };
            postRequestWithToken('road-assistance-delete-time-slot', obj, async (response) => {
                if (response.code === 200) {
                    setRefresh(prev => !prev);
                    toast(response.message[0], { type: "success" });
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in road-assistance-delete-time-slot api', response);
                }
            });
        }
    };
    const handleChargerEditTimeSlot = (slotDate) => navigate(`/electric/ev-road-assistance/edit-time-slot/${slotDate}`)
    const checkpermission  = (group) => {
        const canEdit   = access.includes("edit");
        const canDelete = access.includes("delete");

        if (!canEdit && !canDelete) return null;

        return (
            <div className={styles.editContent}>
                {canEdit && <img src={Edit} alt="edit" onClick={() => handleChargerEditTimeSlot(group.slots[0]?.slot_date)} /> }
                {canDelete && <img src={Delete} alt="delete" onClick={() => handleDeleteSlot(group.slots[0]?.slot_date)} /> }
            </div>
        );
    }

    return (
        <div className='main-container'>
            <ToastContainer />
            <SubHeader
                heading="Roadside Assistance Slot List"
                addButtonProps={addButtonProps}
                filterValues={filters}
                dynamicFilters = {dynamicFilters}
                fetchFilteredData={fetchFilteredData}
                searchTerm={searchTerm}
                count = {totalCount}
            />

            {loading ? <Loader /> :
                timeSlotList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Slot ID","Timing", "Slot Price", "Status"]}
                        // tableHeaders={["Slot ID","Timing", "Booking Limit", "Total Booking",  "Remaining Booking", "Status"]}
                        message="No data available"
                    />
                ) : (
                <>
                    <div className={styles.TimeslotcontainerCharger}>

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Slot ID</th>
                                    <th>Timing</th>
                                    <th>Slot Price</th>
                                    {/* <th>Booking Limit</th>
                                    <th>Total Booking</th>
                                    <th>Remaining Booking</th> */}
                                    <th>Status</th>
                                </tr>
                            </thead>

                            {groupedData.map((group, index) => (
                                <React.Fragment key={index} className={styles.groupContainer}>
                                    {/* Date row */}
                                    <tr className={styles.dateRow}>
                                        <td className={styles.listSpan}>
                                            <div className={styles.timeSlotContent}>
                                                <span>Date: {group.slot_date}</span>
                                                { checkpermission(group) }
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Slot details for the date */}
                                    <tbody className={styles.timeSlotGroup}>
                                        {group.slots.map((slot, slotIndex) => (
                                            <tr key={slotIndex} className={styles.slotRow}>
                                                <td>{slot.slot_id}</td>
                                                <td>
                                                    {slot.timing ? (() => {
                                                        const [startTime, endTime] = slot.timing.split(' - ');
                                                        const formattedStart = moment(startTime, 'HH:mm:ss').format('HH:mm');
                                                        const formattedEnd = moment(endTime, 'HH:mm:ss').format('HH:mm');
                                                        return `${formattedStart} - ${formattedEnd}`;
                                                    })() : 'N/A'}
                                                </td>
                                                <td>{slot.slot_price || 0} INR</td>
                                                {/* <td>{slot.booking_limit || '0'}</td>
                                                <td>{slot.slot_booking_count || '0'}</td>
                                                <td>{slot.remaining_booking || '0'}</td> */}
                                                <td>{slot.status === 1 ? "Active" : "Inactive"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </React.Fragment>
                            ))}
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
            )}
        </div>
    );
};

export default RoadAssistanceTimeSlotList;
