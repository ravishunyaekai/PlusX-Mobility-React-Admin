import { useEffect, useState } from "react";
import styles from "./profile.module.css";
import EmailIcon from "../../assets/images/Email.svg";
import PhoneIcon from "../../assets/images/MobileCard.svg";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const storedDetails = sessionStorage.getItem("userDetails");
    if (storedDetails) {
      const parsedDetails = JSON.parse(storedDetails);
      setUserDetails(parsedDetails);
      const imagePath = `${parsedDetails.base_url}${parsedDetails.image}`;
      setProfileImage(imagePath);
    }
  }, []);

  if (!userDetails) {
    return (
      <div className={styles.mainProfileContainer}>
        <div className={styles.profileSection}>
          <div className={styles.profileHeading}>...</div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.mainProfileContainer}>
      <div className={styles.profileSection}>
        <div className={styles.profileHeading}>Profile</div>
        <div className={styles.profileCardSection}>
          <div className={styles.profileCardImg}>
            <img src={profileImage} alt="User" />
          </div>
          <div className={styles.profileCardContainer}>
            <div className={styles.profileCardHeading}>{userDetails.name}</div>
            <div className={styles.profileBasicSection}>
              <div className={styles.profileCardMainContent}>
                <div className={styles.profileCardIcon}>
                  <img src={EmailIcon} alt="Email" />
                </div>
                <div className={styles.profileCardText}>{userDetails.email}</div>
              </div>
              <div className={styles.profileCardMainContent}>
                <div className={styles.profileCardIcon}>
                  <img src={PhoneIcon} alt="Phone" />
                </div>
                <div className={styles.profileCardText}>{userDetails.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
