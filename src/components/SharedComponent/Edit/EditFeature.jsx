import React, { useState } from 'react'
import styles from './edit.module.css'
import EditImage from './EditImage'

const EditFeature = () => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };
  return (
    <div className="container-fluid">
      <div className={styles.editFeatureSection}>
        <div className="row">
          <div className="col-xxl-9 col-xl-8 col-lg-6 col-12">
            <div className={styles.editfeatureContainer}>
              <div className={styles.editfeatureContentSection}>
                <span className={styles.editfeatureHeading}>Charger Feature</span>
                {/* <span className={styles.editfeatureContent}>For INR 150 Per Charger</span> */}
              </div>
              <div className={styles.editfeatureInputContent}>
                <input type="text" className={styles.editFromSection} />
              </div>
            </div>
          </div>
          <div className="col-xxl-3  col-xl-4 col-lg-6 col-12">
            <div className={styles.toggleContainer}>
              <label className={styles.statusLabel}>Status</label>
              <div className={styles.toggleSwitch} onClick={handleToggle}>
                <span className={`${styles.toggleLabel} ${!isActive ? styles.inactive : ''}`}>
                  Un-active
                </span>
                <div className={`${styles.toggleButton} ${isActive ? styles.active : ''}`}>
                  <div className={styles.slider}></div>
                </div>
                <span className={`${styles.toggleLabel} ${isActive ? styles.active : ''}`}>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditImage />
      {/* start the button section */}
      <div className={styles.editButton}>
        <button className={styles.editCancelBtn}>Cancel</button>
        <button className={styles.editSubmitBtn}>Submit</button>
      </div>
      {/* end the button section */}
    </div>
  )
}

export default EditFeature