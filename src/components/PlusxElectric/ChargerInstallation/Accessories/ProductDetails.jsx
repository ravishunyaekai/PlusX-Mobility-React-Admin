import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './productDetails.module.css'
import moment from 'moment';
import BookingDetailsHeader from '../../../SharedComponent/Details/BookingDetails/BookingDetailsHeader'
import BookingImageSection from '../../../SharedComponent/Details/BookingDetails/BookingImageSection'
import BookingMultipleImages from '../../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../../api/Requests';
import BookingLeftDetails from '../../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import Loader from '../../../SharedComponent/Loader/Loader.jsx';
import { toast } from 'react-toastify';

const ProductDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { chargerId }                       = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [loading, setLoading]               = useState(false);
    const [baseUrl, setBaseUrl]               = useState();
    const [imageGallery, setImageGallery]     = useState();
     const [imageGalleryId, setImageGalleryId] = useState();

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            charger_id : chargerId,
        };
        postRequestWithToken('ev-accessories-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
                setImageGallery(response?.gallery_data)
                setImageGalleryId(response?.gallery_id)
                setBaseUrl(response.base_url)
            } else {
                console.log('error in details API', response);
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
        bookingIdTitle      : "Product ID",
        customerDetailsTitle : "Product Details",
    };
    const content = {
        bookingId     : bookingDetails?.charger_id,
        createdAt     : moment(bookingDetails?.created_at).format('DD MMM YYYY hh:mm A'),
        customerName   : bookingDetails?.charger_name,
    
    };
    const sectionTitles1 = {
        compatible    : "Compatible",
        outputPower   : 'Output Power',
        warrantyType  : 'Warranty Type',
        price         : 'Price',
        // specification : 'Vehicle Specification',
        vehicle_brand : 'Vehicle Brand',
        vehicle_modal : 'Vehicle Model',
        charger_type  : 'Charger Type',
        connector_type  : 'Connector Type',
        status        : "Status", 
    }
    const sectionContent1 = {
        // compatible    : bookingDetails?.compatible.map(f => f.label).join(", "),
        compatible    : bookingDetails?.compatible,
        outputPower   : bookingDetails?.outputPower,
        warrantyType  : bookingDetails?.warrantyType,
        price         : 'INR '+bookingDetails?.price,
        // specification : bookingDetails?.vehicle_specification,
        vehicle_brand : bookingDetails?.vehicle_brand,
        vehicle_modal : bookingDetails?.vehicle_modal,
        charger_type  : bookingDetails?.charger_type,
        connector_type  : bookingDetails?.connector_type,
        status        : bookingDetails?.status === 1 ? "Active" : "Un-Active",
    }

    const sectionTitles2 = {
        description : "Features"
    }
    const sectionContent2 = {
        description : (<>
            <ul className="list-disc list-inside">
                {bookingDetails?.charger_feature.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
        </>),
    }
    const sectionTitles4 = {
        description : "Description"
    }
    const sectionContent4 = {
        description : bookingDetails?.description,
    }
    const imageTitles = {
        coverImage : "Charger Image",
        galleryImages : "Gallery",
    }
    const imageContent = {
        coverImage : bookingDetails?.charger_image,
        galleryImages   : imageGallery,
        galleryImagesId : imageGalleryId,
        baseUrl    : baseUrl,
    }
    const pdfTitles = {
        evChargerFiles : "Specification PDF",
    }
    const pdfContent = {
        evChargerFiles : bookingDetails?.specification_pdf,
        baseUrl        : baseUrl,
    }

    const handleRemoveCoverImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = {
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                charger_id : chargerId,
            };
            postRequestWithToken('chargers-cover-del', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });
                    setTimeout(() => {
                    fetchDetails();
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                }
            });
        }
    };
const handleRemoveGalleryImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                gallery_id : galleryId 
            };
            postRequestWithToken('ev-charger-gallery-del', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });

                    setTimeout(() => {
                    fetchDetails();
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                }
            });
        }
    };
    return (
        <div className='main-container'>
            { loading ? <Loader /> : 
                <>
                    <BookingDetailsHeader content={content} titles={headerTitles} type='evChargerDetails' />
                    <div className={styles.ChargerDetailsSection}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}
                            sectionTitles7={sectionTitles2} sectionContent7={sectionContent2} type='evChargerDetails' />
                        <BookingImageSection titles={imageTitles} content={imageContent} type='evChargerDetails'  />
                        <BookingMultipleImages titles={imageTitles} content={imageContent} type='EvchargerDetailGallery'  />
                        <BookingMultipleImages titles={pdfTitles} content={pdfContent} type='evChargerDetails' />
                    </div>
                </>
            }
        </div>
    )
}

export default ProductDetails;