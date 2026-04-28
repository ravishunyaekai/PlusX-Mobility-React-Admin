import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './custommodal.module.css';

const FormModal = ({ isOpen, onClose,  }) => {

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>
          Add Brand 
        </div>
        <div className={styles.row}>
            <div className={styles.addShopInputContainer}>
              <label htmlFor="brandName" className={styles.addShopLabel}>Brand Name</label>
              <input type="text" id="brandName" 
              placeholder="Brand Name" 
              className={styles.inputField} 
            //   value={brandName}
            //   onChange={(e) => setBrandName(e.target.value)}
              />
             
            </div>
            
          </div>
        <div className={styles.modalActions}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
          <button className={styles.assignBtn} 
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
