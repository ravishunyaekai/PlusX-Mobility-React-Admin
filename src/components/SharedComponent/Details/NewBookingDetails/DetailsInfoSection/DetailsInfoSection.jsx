import styles from "./DetailsInfoSection.module.css";

    function DetailsInfoSection({ userInfoSection = [], rideInfoSection = [] }) {

        const renderSection = (fields) => (
            <div className={styles.infoCardSection}>
                {fields.map((item, index) =>  <InfoDetails key={index} label={item.label} value={item.value} /> )}
            </div>
        );
        return (
            <>
                { userInfoSection.length > 0 && renderSection(userInfoSection)}
                { rideInfoSection.length > 0 && renderSection(rideInfoSection) }
            </>
        );
    }
    const InfoDetails = ({ label, value }) => {
        const isFailedStatus = label.toLowerCase() === "status" && value?.toLowerCase() === "failed";
        return (
            <div className={styles.infoSection}>
                <span className={styles.infoTitle}>{label}</span>
                <span className={`${styles.infoValue} ${isFailedStatus ? styles.failedStatus : ''}`}>
                    {value || "N/A"}
                </span>
            </div>
        );
    };

export default DetailsInfoSection;
