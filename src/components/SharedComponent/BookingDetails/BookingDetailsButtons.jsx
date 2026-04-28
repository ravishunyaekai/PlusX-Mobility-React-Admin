import React, { useState } from 'react';
import styles from './bookingdetails.module.css';
import BrandingHistory from './BrandHistory';
import PODInput from './PODInput';
// import PODOutput from './PODOutput';
import PODBookingList from './PODBookingList';
import PODZoneHistory from './PODZoneHistory';
import PODBatteryData from './PODBatteryData';

const BookingDetailsButtons = ({ deviceId, deviceBrandList, currentPage, totalPages, onPageChange, brandImagePath, deviceBatteryData }) => {
    const [activeSection, setActiveSection] = useState('brandingHistory');

    return (
        <div className={styles.brandButtonContainer}>
            <span className={styles.brandMainHeading}>History</span>
            <div className={styles.iconContainer}>
                <button
                    className={`${styles.iconButton} ${activeSection === 'brandingHistory' ? styles.active : ''
                        }`} onClick={() => setActiveSection('brandingHistory')} >
                    <span>Branding</span>
                </button>
                <button
                    className={`${styles.iconButton} ${activeSection === 'podInputHistory' ? styles.active : ''}`}
                    onClick={() => setActiveSection('podInputHistory')}
                >
                    <span>POD Charging</span>
                </button>
                {/* <button
                    className={`${styles.iconButton} ${activeSection === 'podOutputHistory' ? styles.active : ''}`}
                    onClick={() => setActiveSection('podOutputHistory')}
                >
                    <span>POD Output</span>
                </button> */}
                <button
                    className={`${styles.iconButton} ${activeSection === 'podZoneHistory' ? styles.active : ''
                        }`}
                    onClick={() => setActiveSection('podZoneHistory')}
                >
                    <span>POD Zone</span>
                </button>
                <button
                    className={`${styles.iconButton} ${activeSection === 'podBookingList' ? styles.active : ''}`}
                    onClick={() => setActiveSection('podBookingList')}
                >
                    <span>Booking List</span>
                </button>
                <button
                    className={`${styles.iconButton} ${activeSection === 'podBatteryData' ? styles.active : ''}`}
                    onClick={() => setActiveSection('podBatteryData')}
                >
                    <span>Battery Data</span>
                </button>
            </div>
            <div className={styles.sectionContent}>
                { activeSection === 'brandingHistory' &&
                    <BrandingHistory
                        deviceId={deviceId}
                        deviceBrandList={deviceBrandList}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        brandImagePath={brandImagePath}
                    />
                }
                { activeSection === 'podInputHistory' && <PODInput podId={deviceId} /> }
                {/* { activeSection === 'podOutputHistory' && <PODOutput podId={deviceId} /> } */}
                { activeSection === 'podZoneHistory' && <PODZoneHistory podId={deviceId} /> }
                { activeSection === 'podBookingList' && <PODBookingList podId={deviceId} /> }
                { activeSection === 'podBatteryData' && <PODBatteryData podId={deviceId} deviceBatteryData={deviceBatteryData} /> }
            </div>
        </div>
    );
};

export default BookingDetailsButtons;
