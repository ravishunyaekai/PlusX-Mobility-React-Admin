import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PublicCharger.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection.jsx'
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../api/Requests.js';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../SharedComponent/Loader/Loader.jsx';

    const formatTime = (timeStr) => {
        if (timeStr === "Closed") return "Closed";
        const [start, end] = timeStr?.split('-');
        const format12Hour = (time) => {
            const [hour, minute] = time?.split(':');
            const date = new Date();
            date.setHours(hour);
            date.setMinutes(minute);
            
            // Format the time to always show two digits for minute and ensure AM/PM
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(':', ':'); 
        };

        return `${format12Hour(start)} - ${format12Hour(end)}`;
    };

    /*const getFormattedOpeningHours = (details) => {
        if (details?.always_open === 1) {
            return "Always Open";
        }
        // if (!details?.open_days || !details?.open_timing) {
        //     return "No opening hours available";
        // }
        // const days = details?.open_days.split('_').map((day) => {
        //     // Capitalize the first letter of each day
        //     return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
        // });
        // const timings = details?.open_timing.split('_').map(formatTime);

        // Check if all the timings are the same
        // const allSameTimings = timings.every(time => time === timings[0]);

        // if (allSameTimings) {
        //     // If all days have the same timings, return a consolidated range for the whole week
        //     return `${days[0]}-${days[days.length - 1]}: ${timings[0]}`;
        // }
        // Otherwise, show each day with its corresponding timings
        const formattedOpeningHours = [];
        let i = 0;
        while (i < days.length) {
            let startDay = days[i];
            let currentTiming = timings[i];
            let j = i;

            while (j < days.length - 1 && timings[j + 1] === currentTiming) {
                j++;
            }
            const dayRange = startDay + (i === j ? "" : `-${days[j]}`);
            formattedOpeningHours.push(`${dayRange}: ${currentTiming}`);
            i = j + 1;
        }
        return formattedOpeningHours.join(', ');
    };*/


const ChargeShareDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate();
  const { charger_id }                       = useParams();
  const [bookingDetails, setBookingDetails] = useState();
  const [imageGallery, setImageGallery]     = useState();
  const [imageGalleryId, setImageGalleryId] = useState();
  const [baseUrl, setBaseUrl]               = useState();
   const [openDays, setOpenDays]            = useState("");
   const [openTimes, setOpenTimes]            = useState("");
   //
   const [compatible, setCompatible]            = useState("");



 

  const [loading, setLoading]               = useState(false);

  const fetchDetails = () => {
    setLoading(true);
        const obj = {
        userId     : userDetails?.user_id,
        email      : userDetails?.email,
        charger_id : charger_id
        };
 
        postRequestWithToken('charge-share-detail', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
              setOpenDays(response?.data.open_days.join(", "));
              
              setOpenTimes(response?.data.open_timing.join(", "));
              
              setCompatible(response?.data.compatible_type.join(", "));



                setImageGallery(response.gallery_data)
                setImageGalleryId(response.gallery_id)
                setBaseUrl(response.base_url)
            } else {
                console.log('error in charge-share-detail API', response);
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

    const handleRemoveGalleryImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                gallery_id : galleryId 
            };
            postRequestWithToken('chargers-gallery-del', obj, async (response) => {
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
    const handleRemoveCoverImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = { 
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                gallery_id : galleryId 
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
    const headerTitles = {
        bookingIdTitle      : "Charger ID",
        stationDetailsTitle : "Charger Name",
        feeDetailsTitle     : "Type Of Charger",
        customer_name       :  "Customer Name"
    };
    const content = {
        bookingId     : bookingDetails?.charger_id,
        createdAt     : moment(bookingDetails?.created_at).format('DD MMM YYYY'),
        stationName   : bookingDetails?.charger_name,
        charger_type         : bookingDetails?.charger_type,
        
    };
   
    
    const sectionTitles4 = {
        description : "Description",
        // description : "Description"

    }
    const imageTitles = {
        coverImage    : "Image"
        }
        const imageContent = {
        coverImage      : bookingDetails?.charger_image,
        // galleryImages   : imageGallery,
        // galleryImagesId : imageGalleryId,
        baseUrl         : baseUrl,
        // slotDate        : moment(bookingDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
    }

 const sectionTitles1 = {
     customer_name       :  "Customer Name",
     customer_email       :  "Customer Email",
     customer_conact       :  "Customer Contact",
        address        : "Address",
        chargerType    : "Output Power",
        connector_type   : "Type Of Connector",
        // openingDetails : "Working Hours",
    }
    const sectionContent1 = {
        customer_name : bookingDetails?.rider_name,
        customer_email : bookingDetails?.email,
        customer_conact : bookingDetails?.mobile, 
        address        : bookingDetails?.address,
        output    : bookingDetails?.output,
        connector_type    : bookingDetails?.connector_type,

    }

    const sectionTitles2 = {
        compatible      : "Compatible With",
        park_no         : "Parking Number",
        park_floor      : "Parking Floor",
        charger_status  : "Status",
       open_days        : "Open Days",
       open_time        :  "Open Time"
    }
    const sectionContent2 = {
        // slotDate     : moment(bookingDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
        compatible      : compatible || '',
        park_no         : bookingDetails?.park_no || "-",
        park_floor      : bookingDetails?.park_floor||"-",
        charger_status  : bookingDetails?.charger_status|| "",
        open_days       : openDays,
        open_time       : openTimes
    }
    const sectionContent4 = {
        description: bookingDetails?.description,
    }
    
    const sectionTitles5 = {
        days : "Days",
        time : "Time"

    }
    const sectionContent5={
        days: bookingDetails?.description,
        time:""
    }
    return (
        <div className='main-container'>
            <ToastContainer />
            { loading ? <Loader /> : 
                <>
                    <BookingDetailsHeader content={content} titles={headerTitles} type='chargesharedetails' />
                    <div className={styles.ChargerDetailsSection}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
                            sectionTitles4={sectionTitles4} sectionContent4={sectionContent4} type='portableChargerBooking' />
                         
                            {/* <BookingLeftDetails titles={sectionTitles5} content={sectionContent5} type='portableChargerBooking' /> */}
                            {/* sectionTitles2={sectionTitles6} sectionContent6={sectionContent6}
                            sectionTitles4={sectionTitles4} sectionContent4={sectionContent4}  */}
                        
                        <BookingImageSection titles={imageTitles} content={imageContent} type='publicChargingStation' onRemoveImage={handleRemoveCoverImage} />
                        {/* <BookingMultipleImages titles={imageTitles} content={imageContent} type='publicChargingStation' onRemoveImage={handleRemoveGalleryImage} /> */}
                    </div>
                    
                </>
            }
        </div>
    )
}

export default ChargeShareDetails