import { useState } from 'react';
// import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './custommodal.module.css';
import CustomDropdown from '../UI/CustomDropdown/CustomDropdown';

const Custommodal = ({ isOpen, onClose, driverList, onSelectDriver, bookingId, onAssignDriver }) => {
  
  const [selectedDriver, setSelectedDriver] = useState(null);
  if (!isOpen) return null;

  const getStatusLabel = (status) => {
    if (status === 0) return "In-Active";
    if (status === 1) return "Un-Available";
    if (status === 2) return "Available";
    return "Unknown";
  };

  const driverOptions = driverList.map((driver) => ({
    value     : driver.rsa_id,
    label     : `${driver.rsa_name} (${getStatusLabel(driver.status)})`,
    isDisabled: driver.isUnavailable,
  }));

  const handleDriverChange = (selectedOption) => {
    setSelectedDriver(selectedOption);
    onSelectDriver(selectedOption?.value);
  };

  const handleClose = () => {
    setSelectedDriver(null);
    onClose();
  };

  const handleAssignDriver = () => {
    onAssignDriver();
    setSelectedDriver(null);
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHead}>Select Driver <span>( {bookingId} )</span></div>
          <CustomDropdown options={driverOptions} value={selectedDriver} onChange={handleDriverChange} placeholder="Select Driver" />
        <div className={styles.modalActions}>
          <button className={styles.closeBtn} onClick={handleClose}>Close</button>
          <button className={styles.assignBtn} onClick={handleAssignDriver} disabled={!selectedDriver}>Assign</button>
        </div>
      </div>
    </div>
  );
};

export default Custommodal;
