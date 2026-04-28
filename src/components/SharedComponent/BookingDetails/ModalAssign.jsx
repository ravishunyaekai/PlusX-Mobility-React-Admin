import styles from "./history.module.css";

const Modal = ({ isOpen, onClose, onAssign, children, buttonName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        {children}
        <div className={styles.buttonGroup}>
          <button className={styles.closeModalButton} onClick={onClose}>
            Close
          </button>
          <button className={styles.assignButton} onClick={onAssign}>
            {buttonName || "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
