import React from 'react'
import styles from './emergency.module.css'
const EmergencyDetails = () => {
  return (
    <div className="container-fluid">
      <div className={styles.infoSection}>
        <div className="row">
          <div className="col-xl-4 col-lg-6 col-12">
            <div className={styles.infoBlock}>
              <span className={styles.infoHeading}>Area</span>
              <span className={styles.Detailshead}> The Greens</span>
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 col-12">
            <div className={styles.infoBlock}>
              <span className={styles.infoHeading}>Emirates</span>
              <span className={styles.Detailshead}> Dubai</span>
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 col-12">
            <div className={styles.infoBlock}>
              <span className={styles.infoHeading}> Country</span>
              <span className={styles.Detailshead}>United Arab Emirates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyDetails