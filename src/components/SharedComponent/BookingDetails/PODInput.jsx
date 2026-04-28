import React, { useState, useEffect } from 'react';
import GenericTable from './GenericTable';
import Pagination from '../Pagination/Pagination';
import styles from './history.module.css';
import { getRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
const PODInput = ({podId}) => {

    const userDetails                          = JSON.parse(sessionStorage.getItem('userDetails'));
    const [currentPage, setCurrentPage]        = useState(1);
    const [totalPages, setTotalPages]          = useState(1);
    const[podInputHistory, setPodInputHistory] = useState([]);
    
    useEffect(() => {
        let AreaObj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            podId   : podId, 
            page_no : currentPage
        }
        getRequestWithToken('pod-output-history', AreaObj, (response) => {
            if (response.code === 200) {
                // console.log(response.code)
                setPodInputHistory(response?.data || []);  
                setTotalPages(response?.total_page || 1);
            } else {
                console.log('error in brand-list API', response);
            }
        });
    }, [currentPage]);
    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Table columns
    const columns = [
        { label : 'Start Date & Time', field: 'start_date' },
        { label : 'End Date & Time', field: 'end_date' },
        // { label : 'Time', field: 'time' },
        { label : 'KW', field: 'kilowatt' },
    ];
    var tableVal = []
    podInputHistory.map((item) =>{ 
        // console.log( 'item', item.end_charging_level - item.start_charging_level );  //;
        tableVal.push({ 
            start_date : moment(item.date_time).format('DD-MM-YYYY'), 
            end_date   : moment(item.date_time).tz('Asia/Dubai').format('HH:mm A'), 
            kilowatt   : ( item.end_charging_level - item.start_charging_level ) * 0.25 +' kw'
        });
    });
    console.log(tableVal.length)
    return (
        <div className={styles.addressListContainer}>
            <div className={styles.brandHistorySection}>
                <span className={styles.sectionTitle}>POD Charging List</span>
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

export default PODInput;
