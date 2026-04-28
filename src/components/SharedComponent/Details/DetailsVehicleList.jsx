import React, { useEffect, useState } from 'react';
import styles from './details.module.css';
import Pagination from '../Pagination/Pagination';

const DetailsVehicleList = ({ vehicleList }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 3; 

    useEffect(() => {
        if (vehicleList) {
            setTotalPages(Math.ceil(vehicleList.length / itemsPerPage));
        }
    }, [vehicleList]);
    const currentItems = vehicleList?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className={styles.addressListContainer}>
            <span className={styles.sectionTitle}>Vehicle List</span>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Vehicle Type</th>
                        <th>Plate Code</th>
                        <th>Plate No.</th>
                        <th>Vehicle Brand</th>
                        <th>Vehicle Model</th>
                        <th>Vehicle Specification</th>
                        <th>Emirates</th>
                    </tr>
                </thead>
                <tbody>
                {currentItems && currentItems.length > 0 ? (
                    currentItems?.map((vehicle, index) => (
                        <tr key={index}>
                            <td>{vehicle.vehicle_type}</td>
                            <td>{vehicle.vehicle_code}</td>
                            <td>{vehicle.vehicle_number}</td>
                            <td>{vehicle.vehicle_make}</td>
                            <td>{vehicle.vehicle_model}</td>                           
                            <td>{vehicle.vehicle_specification}</td>
                            <td>{vehicle.emirates}</td>
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

export default DetailsVehicleList;
