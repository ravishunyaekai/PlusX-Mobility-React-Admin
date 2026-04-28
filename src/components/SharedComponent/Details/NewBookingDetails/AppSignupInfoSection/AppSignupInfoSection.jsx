import styles from './AppSignupInfoSection.module.css';

function AppSignupInfoSection({ imageUrl, riderInfoFields, fieldCount }) {
  const isFullWidth = fieldCount > 4;
  return (
    <div className={`${styles.appSignupInfoSection} ${isFullWidth ? styles.fullWidth : styles.shrinkWidth }`}>
      {imageUrl && (
        <div className={styles.studentIdCard}>
          <img src={imageUrl} alt="Student ID" />
        </div>
      )}
      {riderInfoFields.map((item, idx) => (
        <DetailField key={idx} label={item.label} value={item.value || "N/A"} />
      ))}
    </div>
  );
}

const DetailField = ({ label, value }) => (
  <div className={styles.infoCardSection}>
    <div className={styles.infoTitle}>{label}</div>
    <div className={styles.infoValue}>{value}</div>
  </div>
);

export default AppSignupInfoSection;
