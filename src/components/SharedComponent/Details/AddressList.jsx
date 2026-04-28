import React, { useEffect, useState } from 'react';
import styles from './details.module.css';
import Pagination from '../Pagination/Pagination';

const DetailsList = ({ addressList }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 3;

    useEffect(() => {
        if (addressList) {
            setTotalPages(Math.ceil(addressList.length / itemsPerPage));
        }
    }, [addressList]);
    const currentItems = addressList?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={styles.addressListContainer}>
            <span className={styles.sectionTitle}>Shop Address List</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Ares</th>
                        <th>Location</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems?.map((address, index) => (
                        <tr key={index}>
                            <td>{address.address}</td>
                            <td>{address.area_name}</td>
                            <td>{address.location}</td>
                            <td>{address.latitude}</td>
                            <td>{address.longitude}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
            />
        </div>
    );
};

export default DetailsList;
