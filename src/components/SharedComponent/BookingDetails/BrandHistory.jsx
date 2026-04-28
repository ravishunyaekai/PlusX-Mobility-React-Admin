import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import styles from './brandinghistory.module.css';
import Pagination from '../Pagination/Pagination';
import Add from '../../../assets/images/Plus.svg';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const BrandHistory = ({ deviceId, deviceBrandList, currentPage, totalPages, onPageChange, brandImagePath }) => {
  
  const [paginatedData, setPaginatedData] = useState(deviceBrandList);
  const [openModal, setOpenModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  const navigate = useNavigate();
  const addBrandHref = () => {
    navigate(`/electric/home-charger/add-brand/${deviceId}`);
  };

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setOpenModal(true);
  };
  
  return (
    <div className={styles.addressListContainer}>
      <div className={styles.brandHistorySection}>
        <span className={styles.sectionTitle}>Brand History List</span>
        <Link onClick={addBrandHref}>
          <button className={styles.brandHistoryButton}>
            <img className={styles.brandImg} src={Add} alt="Plus" />
            <span> Add Brand</span>
          </button>
        </Link>
      </div>
      <table className={`table ${styles.customTable}`}>
        <thead>
          <tr>
            <th>Brand Image</th>
            <th>Brand Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
            { deviceBrandList.length === 0 ? (
                <tr>
                    <td colSpan={12} className='border-0 p-0'>
                      <div style={{backgroundColor: "#fff", padding: "10px", borderRadius: "10px", color: "#000", boxShadow:"0 4px 8px rgba(0, 0, 0, 0.1)"}}> No data available</div>
                    </td>
                </tr>
              ) : (
              <>  
                { deviceBrandList.map((vehicle, index) => {
                    return (
                        <tr key={index}>
                            <td>
                                {vehicle.brand_image && (
                                <img src={`${brandImagePath}${vehicle.brand_image}`} alt={vehicle.brand_name} className={styles.brandImage} onClick={(e) => openImageModal(e.target.src)} />
                                )}
                            </td>
                            <td>{vehicle.brand_name}</td>
                            <td>{moment(vehicle.start_date).format('DD MMM YYYY')}</td>
                            <td>{moment(vehicle.end_date).format('DD MMM YYYY')}</td>
                            <td className={styles.descriptionCell}>
                                {vehicle.description} <div className={styles.tooltip}>{vehicle.description}</div>
                            </td>
                        </tr>
                    );
                })}   
              </>
            )}
        </tbody>
      </table>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      <Modal open={openModal} onClose={() => setOpenModal(false)} center>
        <img src={modalImage} alt="Brand" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default BrandHistory;  
