import React, { useEffect, useState } from 'react';
import styles from './details.module.css';
import Pagination from '../Pagination/Pagination';

const DetailsList = ({ addressList }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);
    const itemsPerPage                  = 5;

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
            <span className={styles.sectionTitle}>Address List</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Building Name</th>
                        <th>Street Name</th>
                        <th>Area Name</th>
                        <th>Flat No</th>
                        <th>Nick Name</th>
                        <th>Emirates</th>
                        {/* <th>Landmark</th> */}
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((address, index) => (
                            <tr key={index}>
                                <td>{address.building_name}</td>
                                <td>{address.street_name}</td>
                                <td>{address.landmark}</td>
                                <td>{address.unit_no}</td>
                                <td>{address.nick_name}</td>
                                <td>{address.emirate}</td>
                                {/* <td>{address.}</td>
                                 <td>{address.area}</td> */}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" className={styles.noData}>No Data Available</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {currentItems.length > 0 &&  
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            }            
        </div>
    );
};

export default DetailsList;
