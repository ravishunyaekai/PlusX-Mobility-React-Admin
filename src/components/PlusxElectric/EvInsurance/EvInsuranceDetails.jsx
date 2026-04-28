import { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import { postRequestWithToken } from '../../../api/Requests';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
// import OfferHistory from './OfferHistory';
import Loader from '../../SharedComponent/Loader/Loader';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails';
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection';
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages';

const EvInsuranceDetail = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { insurance_id }                         = useParams();
    const [insuranceDetail, setinsuranceDetail]     = useState();
    const [imageGallery, setImageGallery]     = useState();
    const [baseUrl, setBaseUrl]               = useState();
    const [loading, setLoading]               = useState(false);

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId   : userDetails?.user_id,
            email    : userDetails?.email,
            insurance_id : insurance_id
        };
        postRequestWithToken('ev-insurance-detail', obj, (response) => {
            if (response.status == 1) {
                
                setinsuranceDetail(response?.data || {});
                console.log("insuranceDetail",insuranceDetail)
                // setImageGallery(response.galleryData)
                setBaseUrl(response.base_url)
            } else {
                console.log('error in subscription-detail API', response);
            }
            setLoading(false);
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);
    
    const headerTitles = {
        bookingIdTitle       : "Insurance ID",
        customerDetailsTitle : "Customer Details",
    };
    const content = {
        bookingId       : insuranceDetail?.insurance_id, // Offer Expiry Date
        createdAt       :  moment(insuranceDetail?.created_at).format('DD MMM YYYY hh:mm A'),
        customerName    : insuranceDetail?.owner_name,
        customerContact : insuranceDetail?.mobile_no,
    };
   

    
    const sectionTitles1 = {
        vehicle_data : "Vehicle Details",
        current_insurance_expiry         : "Insurance Expires On",
        // serviceName   : "Service Name",
    }
    const sectionContent1 = {
        vehicle_data : insuranceDetail?.vehicle_data,
       
        current_insurance_expiry         : insuranceDetail?.current_insurance_expiry
    }
    const imageTitles = {
        driving_licence    : "driving licence",
        // prev_insurance_image : "prev_insurance_image",
    }
    const imageContent = {
        galleryImages         : insuranceDetail?.gallery_data,
        galleryImagesId    : insuranceDetail?.gallery_id,
        
        baseUrl         : insuranceDetail?.base_url,
        // slotDate        : moment(bookingDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
    }
   

console.log("imageContent",imageContent)
const handleRemoveCoverImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                gallery_id : galleryId 
            };
            // postRequestWithToken('chargers-cover-del', obj, async (response) => {
            //     if (response.code === 200) {
            //         // toast(response.message, { type: "success" });
            //         setTimeout(() => {
            //         fetchDetails();
            //         }, 1000);
            //     } else {
            //         // toast(response.message, { type: 'error' });
            //     }
            // });
        }
    };
     
    return (
        <div className='main-container'>
            {loading ? <Loader/> : 
                <>
                    
                    <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1} type='evInsurance' />
                    <div className={styles.bookingDetailsSection}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                            type='portableChargerBooking' />
                        {/* <BookingDetailsAccordion history={history} rsa={content} /> */}
                    </div>
                        <BookingMultipleImages titles={imageTitles} content={imageContent} type='publicChargingStation' onRemoveImage={handleRemoveCoverImage} />

                    {/* <BookingImageSection titles={imageTitles} content={imageContent} type='publicChargingStation' onRemoveImage={handleRemoveCoverImage} /> */}
                    {/* <BookingDetailsHeader content={content} titles={headerTitles} type='Offer Details' /> */}
                    {/* <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent} type='portableChargerBooking' feedBack={feedBack}/> */}
                    {/* <BookingDetailsHeader content={content} titles={headerTitles} type='Offer Details' /> */}

                    {/* <OfferHistory insurance_id= {insurance_id} /> */}
                </>
            }
        </div>
    )
}

export default EvInsuranceDetail;