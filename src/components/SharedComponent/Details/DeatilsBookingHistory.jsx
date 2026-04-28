import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './details.module.css';
import Eye from '../../../assets/images/ViewEye.svg';
import Pagination from '../Pagination/Pagination';

const DeatilsBookingHistory = ({ title, headers, bookingData, bookingType }) => {
    const navigate = useNavigate();

    const handleViewClick = (id) => {
        if (bookingType === 'portableCharger') {
            navigate(`/home-charger/charger-booking-details/${id}`);
        } else if (bookingType === 'pickAndDrop') {
            navigate(`/pick-and-drop/booking-details/${id}`);
        }
        else if (bookingType === 'Roadside Assistance') {
            navigate(`/ev-road-assistance/booking-details/${id}`);
        }
    };
    return (
        <div className={styles.addressListContainer}>
            <span className={styles.sectionsTitle}>{title}</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        { headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bookingData.length > 0 ? (
                        bookingData.map((booking, index) => (
                            <tr key={index}>
                                <td>{booking.datetime}</td>
                                <td>{booking.id}</td>                            
                                <td>{booking.price}</td>
                                <td>{booking.status}</td>
                                <td>{booking?.rsa_name}</td>
                                <td>{booking?.vehicle_type}</td>
                                <td>
                                    <div className={styles.editContent}>
                                        <img
                                            src={Eye}
                                            alt="Eye"
                                            onClick={() => handleViewClick(booking.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className={styles.noData}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Pagination */}
            {/* {currentItems.length > 0 && 
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            } */}
        </div>
    );
};

export default DeatilsBookingHistory;
