import React, { useState, useEffect } from 'react';
import GenericTable from './GenericTable';
import Pagination from '../Pagination/Pagination';
import styles from './history.module.css';
import { getRequestWithToken } from '../../../api/Requests';
import moment from 'moment';

const PODBookingList = ({podId, deviceBatteryData}) => {
    const userDetails                            = JSON.parse(sessionStorage.getItem('userDetails'));
    const [currentPage, setCurrentPage]          = useState(1);
    const [totalPages, setTotalPages]            = useState(1);
    const[podBookingHistory, setPodBookingHistory] = useState([]);

    useEffect(() => {
        let AreaObj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            podId   : podId, 
            page_no : currentPage
        }
        getRequestWithToken('pod-booking-history', AreaObj, (response) => {
            if (response.code === 200) {
                // console.log(response.code)
                setPodBookingHistory(response?.data || []);  
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in brand-list API', response);
            }
        });
    }, [currentPage]);

    const itemsPerPage  = 3;
    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    // Table columns
    const columns = [
        { label : 'Battery ID',     field : 'battery_id' },
        { label : 'Current',     field : 'current' },
        { label : 'Voltage Diff',     field : 'cell' },
        { label : 'Voltage',     field : 'voltage' },
        { label : 'Percentage',  field : 'percentage' },
        { label : 'Temperature 1', field : 'temperature1' },
        { label : 'Temperature 2', field : 'temperature2' },
        { label : 'Temperature 3', field : 'temperature3' },
        { label : 'Cycle', field : 'charge_cycle' },
    ];
    var tableVal = []
    deviceBatteryData.map((item) =>{ 
        if(item.percentage){
            tableVal.push({ 
                battery_id   : item.batteryId,  
                current      : item.current+" A",
                cell         : item.cells+" mv",    
                voltage      : item.voltage +" V", 
                percentage   : item.percentage ? item.percentage.toFixed(2)+" %" : '',
                temperature1 : item.temp1 +" C", 
                temperature2 : item.temp2 +" C",
                temperature3 : item.temp3 +" C",
                charge_cycle : item.charge_cycle,
            });
        }
        // 
    });
    return (
        <div className={styles.addressListContainer}>
            <div className={styles.brandHistorySection}>
                <span className={styles.sectionTitle}>POD Booking List</span>
            </div>
            <GenericTable columns={columns} data={tableVal} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default PODBookingList;
