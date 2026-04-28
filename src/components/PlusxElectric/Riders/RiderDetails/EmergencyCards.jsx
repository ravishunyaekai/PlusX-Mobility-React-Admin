import styles from './emergency.module.css';
import Person from '../../../../assets/images/ProfileCard.svg';
import Mobile from '../../../../assets/images/MobileCard.svg';
import Email from '../../../../assets/images/Email.svg';

const EmergencyCards = ({ details, baseUrl}) => {
    const infoData = [
        { icon : Person, label : 'Driver Name', value: details?.rsa_name, image: details?.profile_img },
        { icon : Mobile, label : 'Mobile No',   value: `${details?.country_code} ${details?.mobile}` },
        { icon : Email,  label : 'Email',       value: details?.email },
    ];

    return (
        <div className={styles.infoCard}>
            <div className="row">
                {infoData.map((item, index) => (
                    <div className="col-xl-4 col-lg-6 col-12" key={index}>
                        <div className={styles.detailsHeaderSection}>
                            <div className={styles.detailsImageSection}>
                                {item.image ? <img src={baseUrl + item.image} alt='img' /> :
                                    <img src={item.icon} alt={item.label} />
                                }
                            </div>
                            <div className={styles.infoBlock}>
                                <span className={styles.infoHeading}>{item.label}</span>
                                <span className={styles.infoText}>{item.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmergencyCards;
