import { useEffect, useState } from 'react';
import styles from './LandingPage.module.css';
import PanelLogo from '../SharedComponent/CompanyLogo';
import Plusx from "../../assets/images/Portable.png";
import mobility from "../../assets/images/Cycle.png";
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const LandingPage = () => {
    const navigate      = useNavigate()
    const userDetails   = JSON.parse(sessionStorage.getItem("userDetails"));

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate("/login"); 
            return; 
        }
    }, [navigate, userDetails]);

    function navigateToApp(appName) {
        sessionStorage.setItem("selectedApp", appName);
        navigate(`/${appName}/dashboard`);
    }

    return (
        <div className={styles.landingPageMainContainer}>
            <ToastContainer />
            <div className="container">
                <div className={styles.formMainContainer}>
                    <div className={styles.formSection}>
                        <div className={styles.formImgSection}>
                            <PanelLogo />
                        </div>
                        <div className={styles.loginCardSection}>
                            <div className={styles.serviceCard}  onClick={()=> navigateToApp("electric")}>
                                <div className={styles.serviceCardTitle}>PlusX Charging</div>
                                <img src={Plusx} alt="charging" />
                            </div>
                            <div className={styles.serviceCard} onClick={()=> navigateToApp("mobility")}>
                                <div className={styles.serviceCardTitle}>PlusX Mobility</div>
                                <img src={mobility} alt="mobility" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default LandingPage;
