import React, { useState, useEffect } from "react";
import styles from "./history.module.css";
import { getRequestWithToken } from '../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';


const statusMapping = {
    '0': 'Under Maintenance',
    '1': 'In Use',
    '2': 'In Service'
};

const BookingStatusSection = ({deviceId, podStatus}) => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const [selectedStatus, setSelectedStatus] = useState('');
    
    const handleStatusChange = (status) => {
        const userConfirmed = window.confirm("Are you sure you want to change status ?");
        if (userConfirmed) {
            let key = Object.keys(statusMapping).find((key) => statusMapping[key] === status);  
            console.log( key, statusMapping[key] )
            setSelectedStatus(statusMapping[key]);

            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            
            formData.append("podId", deviceId);
            formData.append("deviceStatus", key);
            getRequestWithToken('pod-device-status-change', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    // setTimeout(() => {
                        
                    // }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in change status api', response);
                }
            });
        } 
        return false;
    };
    useEffect( () => {
        
        setSelectedStatus(statusMapping[podStatus]);
    }, [podStatus]);
    return (
        <div className={styles.bookingStatusContainer}>
            <ToastContainer />
            <div className={styles.bookingStatusHead}>Status</div>
            <div className={styles.statusOptions}>
                {["In Use", "Under Maintenance", "In Service"].map((status) => (
                    <div
                        key={status}
                        className={`${styles.statusOption} ${
                            selectedStatus === status ? styles.active : ""
                        }`}
                        onClick={() => handleStatusChange(status)}
                    >
                        <span
                            className={`${styles.radioSection} ${
                                selectedStatus === status
                                    ? styles.radioSectionActive
                                    : ""
                            }`}
                        >
                            <span
                                className={`${styles.radio} ${
                                    selectedStatus === status
                                        ? styles.radioActive
                                        : ""
                                }`}
                            ></span>
                        </span>
                        <span className={`${styles.statusHead} ${
                                    selectedStatus === status
                                        ? styles.statusHeadActive
                                        : ""
                                }`}>{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingStatusSection;
