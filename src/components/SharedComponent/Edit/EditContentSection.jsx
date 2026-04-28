import React, { useState } from 'react';
import styles from './edit.module.css';

const EditChargerContentSection = () => {
  const [chargerType, setChargerType] = useState('On Demand Service'); 

  const handleChargerTypeChange = (e) => {
    setChargerType(e.target.value);
  };

  return (
    <div className="container-fluid">
      <div className={styles.editChargerContentSection}>
        <div className="row">
          <div className="col-xl-4 col-lg-6 col-12">
            <div className={styles.editChargerContainer}>
              <span className={styles.editChargerChargerHeading}>Charger Name</span>
              <input type="text" className={styles.editChargerContent} placeholder='Super Charger' />
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 col-12">
            <div className={styles.editChargerContainer}>
              <span className={styles.editChargerChargerHeading}>Charger Type</span>
              <select
                value={chargerType}
                onChange={handleChargerTypeChange}
                className={styles.editChargerDropdown}
              >
                <option value="On Demand Service">On Demand Service</option>
                <option value="Get Monthly Subscription">Get Monthly Subscription</option>
              </select>
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 col-12">
            <div className={styles.editChargerContainer}>
              <span className={styles.editChargerChargerHeading}>Charger Price</span>
              <input type="text" className={styles.editChargerContent} placeholder='INR 150' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditChargerContentSection;
