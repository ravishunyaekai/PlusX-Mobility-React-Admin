import styles from './DetailsCards.module.css';

const DetailsCards = ({ items = [] }) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardWrapper}>
        {items.map((item, index) => (
          <div key={index} className={styles.cardItem}>
            <div className={styles.innerSection}>
              <div className={styles.imageSection}>
                <img src={item.icon} alt="icon" />
              </div>
              <div className={styles.contentSection}>
                <span className={styles.cardTitle} title={item.label}>{item.label}</span>
                <span className={styles.cardValue} title={item.value}>{item.value || "N/A"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetailsCards;
