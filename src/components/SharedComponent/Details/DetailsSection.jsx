import React from 'react'
import styles from './details.module.css'

const DetailsSection = ({sectionDetails}) => {
    return (
        <div className="container-fluid">
            <div className={styles.infoSection}>
                <div className="row">
                <div className="col-xl-3 col-lg-6 col-12">
                    <div className={styles.infoBlock}>
                    <span className={styles.infoHeading}>Area</span>
                    <span className={styles.Detailshead}> {sectionDetails?.area}</span>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-12">
                    <div className={styles.infoBlock}>
                    <span className={styles.infoHeading}>Emirates</span>
                    <span className={styles.Detailshead}> {sectionDetails?.emirates}</span>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-12">
                    <div className={styles.infoBlock}>
                    <span className={styles.infoHeading}> Country</span>
                    <span className={styles.Detailshead}>{sectionDetails?.country}</span>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-12">
                    <div className={styles.infoBlock}>
                    <span className={styles.infoHeading}>Vehicle Type</span>
                    <span className={styles.Detailshead}>{sectionDetails?.vehicle_type}</span>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default DetailsSection