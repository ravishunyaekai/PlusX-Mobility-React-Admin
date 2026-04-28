import React from 'react';
import styles from './details.module.css';
import '../../../assets/css/main.css';
import moment from 'moment';
import Person from '../../../assets/images/Person.svg';
import Mobile from '../../../assets/images/Mobile.svg';
import Email from '../../../assets/images/Email.svg';
import DateofBirth from '../../../assets/images/DateofBirth.svg';

const RiderInfo = ({ headerDetails }) => {
    const details = [
        {
            label: 'Customer Name',
            icon: Person,
            value: headerDetails?.rider_name,
        }, {
            label: 'Mobile No',
            icon: Mobile,
            value: `${headerDetails?.country_code} ${headerDetails?.rider_mobile}`,
        }, {
            label: 'Email',
            icon: Email,
            value: headerDetails?.rider_email,
        }, 
        // {
        //     label: 'Date of Birth',
        //     icon: DateofBirth,
        //     value: moment(headerDetails?.date_of_birth).format('DD MMM YYYY'),
        // },
    ];

    return (
        <div className={styles.infoCard}>
            <div className="row">
                    {details.map((detail, index) => (
                        <div key={index} className="col-xl-3 col-lg-6 col-12">
                            <div className={styles.detailsHeaderSection}>
                                <div className={styles.detailsImageSection}>
                                    <img src={detail.icon} alt={detail.label} />
                                </div>
                                <div className={styles.infoBlock}>
                                    <span className={styles.infoHeading}>{detail.label}</span>
                                    <span className={styles.infoText}>{detail.value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default RiderInfo;
