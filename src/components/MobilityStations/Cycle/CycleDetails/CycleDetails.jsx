import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { postRequestWithToken } from '../../../../api/Requests.js';
import { ToastContainer } from "react-toastify";
import styles from '../Cycle.module.css'
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from "../../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards.jsx";

//Images and icons
import Contact from "../../../../assets/images/ContactCard.svg";
import CycleBrand from "../../../../assets/images/CycleBrand.svg";
import Station from "../../../../assets/images/Station.svg";
import Rented from "../../../../assets/images/Rented.svg";
import CycleType from "../../../../assets/images/CycleType.svg";

const CycleDetails = () => {
    
    const userDetails                        = JSON.parse(sessionStorage.getItem('userDetails'));
    const [CycleDetails, setCycleDetails]    = useState();
    const { cycleId }                        = useParams();
    const [currentPage, setCurrentPage]      = useState(1);
    const [loading, setLoading]              = useState(false);
        
    const headerItems = [
        { label: 'Cycle ID',        icon: Contact,     value: CycleDetails?.cycle.cycle_id },
        { label: 'Cycle Brand',     icon: CycleBrand,  value: CycleDetails?.cycle.brand },
        { label: 'Station',         icon: Station,     value: CycleDetails?.cycle.station_name },
        { label: 'Type of Cycle',   icon: CycleType,   value: CycleDetails?.cycle.cycle_type==="cycle"?"Cycle":"E-Cycle" },
        { label: 'Cycle Used For',  icon: Rented,      value:CycleDetails?.cycle?.used_for === 'rent' ? "Rent" : "Lease" },
        { label: 'Battery Health',  icon: Rented,      value:CycleDetails?.cycle?.battery_health === 1 ? "High" : "Low" },

    ];

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            cycleId      : cycleId,
            service_type : 'cycle_details',
            page_no      : currentPage
        };

        postRequestWithToken('cycle-details', obj, (response) => {
            if (response.code === 200) {
                setCycleDetails(response?.data || {});
            } else {
                console.log('error in cycle-details API', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            Navigate('/login');
            return;
        }
        fetchDetails();
    }, [currentPage]);
  
    // const handlePageChange = (page) => {
    //   setCurrentPage(page);
    // };
    
    return (
        <div className='main-container'>
            <ToastContainer />
            { loading ? <Loader /> : 
                <>
                    <DetailsCards items={headerItems} />

                    <div className={styles.mobilityContainer}>
                        <div className={styles.infoGallerySection}>
                        
                            <div className={styles.rightPanel}>
                                <div className={styles.cardSections}>
                                    <div className={styles.serviceCard}>
                                        <div className={styles.title}>Base Price</div>
                                        <div className={styles.value}>{CycleDetails?.cycle.base_price} INR</div>
                                    </div>
                                </div>
                                
                                <div className={styles.coverImage}>
                                    <img src={`${CycleDetails?.base_url}${CycleDetails?.cycle.cover_image}`} alt="Cover" className={styles.imageCover} />
                                </div>
                                <div className={styles.galleryRow}>
                                    {CycleDetails?.imgName.map((img, index) => (
                                                                        <div key={index} className={styles.galleryImage}>
                                                                        <img src={`${CycleDetails.base_url}${img}`} alt={`Gallery ${index + 1}`} className={styles.imageGallery} />
                                                                        </div>
                                                                    ))}
                                    {/* <div className={styles.galleryImage}>
                                        <img src={''} alt="Gallery 1" className={styles.imageGallery} />
                                    </div>
                                    <div className={styles.galleryImage}>
                                        <img src={''} alt="Gallery 2" className={styles.imageGallery} />
                                    </div> */}
                                </div>
                            </div>

                            <div className={styles.leftPanel}>
                                <div className={styles.cardSections}>
                                    <div className={styles.qrContainer}>
                                        <img src={CycleDetails?.cycle.qr_image} alt="qr" className={styles.qrCode} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            }
        </div>
  );
}

export default CycleDetails;