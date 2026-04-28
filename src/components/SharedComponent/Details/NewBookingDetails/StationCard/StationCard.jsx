import styles from "./StationCard.module.css";

function StationCard({ title, value, customContent }) {
  return (
    <div className={styles.card}>
      {title && <div className={styles.title}>{title}</div>}
      {customContent ? customContent : <div className={styles.value}>{value}</div>}
    </div>
  );
};

export default StationCard;