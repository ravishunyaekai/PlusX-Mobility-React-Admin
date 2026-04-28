import { createPortal } from 'react-dom';
import style from './Modal.module.css';

const Modal = ({ isOpen, heading, onClose, onSubmit, children, buttonName }) => {
    
    if (!isOpen) return null;

    const modalContent = (
        <div className={style.modalOverlay}>
            <div className={style.modalContent}>
                <h4 className={style.modalHeading}>{heading}</h4>
                <button className={style.closeButton} onClick={onClose}>
                    ×
                </button>
                {children}
                <div className={style.buttonGroup}>
                    <button className={style.closeModalButton} onClick={onClose}>
                        Close
                    </button>
                    <button className={style.assignButton} onClick={onSubmit}>
                        {buttonName || 'Assign'}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(
        modalContent,
        document.getElementById('modal')
    );
};

export default Modal;
