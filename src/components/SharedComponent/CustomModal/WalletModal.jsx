import styles from './custommodal.module.css';
import CustomDropdown from '../UI/CustomDropdown/CustomDropdown';

const LockerModal = ({ isOpen, onClose, id, fields = [], formData = {}, setForm, isLoading, onSubmit }) => {
  if (!isOpen) return null;
  
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
                <div className={styles.modalHead}>
                    { id && <span> {id} </span>}
                </div>
                {fields.map((item, index) => (
                    <div key={index}>
                        {item.type === "text" && (
                            <>
                                <label htmlFor={item.name} className={styles.labelText}>{item.fieldLabel}</label>
                                <input disabled={item.disabled} type="text" name={item.name} placeholder={item.placeholder} value={formData[item.name] || ""} className={styles.inputField} onChange={(e) => handleChange(item.name, e.target.value)}/>
                            </>
                        )}
                        {item.type === "dropdown" && (
                            <>
                                <label htmlFor={item.name} className={styles.labelText}>{item.fieldLabel}</label>
                                <CustomDropdown options={item.options} placeholder={item.placeholder}  value={formData[item.name] || null} onChange={(selected) => handleChange(item.name, selected)} isLoading={item.loading || false} onMenuOpen={() => item.onOpen?.()} />
                            </>
                        )}
                    </div>
                ))}
                <div className={styles.modalActions}>
                    <button className={styles.closeBtn} onClick={onClose}>Close</button>
                    <button className={styles.assignBtn} onClick={onSubmit}  disabled={isLoading}>

                        {isLoading ? (
                            <> <span className="spinner-border spinner-border-sm me-2"></span> Submit... </>
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockerModal;
