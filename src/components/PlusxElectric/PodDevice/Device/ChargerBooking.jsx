import React from 'react'
import styles from './chargerbooking.module.css'
import EditHeader from '../../../SharedComponent/Edit/EditHeader'
import EditContentSection from '../../../SharedComponent/Edit/EditContentSection'
import EditFeature from '../../../SharedComponent/Edit/EditFeature'
import EditImage from '../../../SharedComponent/Edit/EditImage'

const ChargerBooking = () => {
  return (
    <div className={styles.chargerBookingContainer} >
      <EditHeader />
      <EditContentSection />
      <EditFeature />
      <EditImage />
    </div>
  )
}

export default ChargerBooking