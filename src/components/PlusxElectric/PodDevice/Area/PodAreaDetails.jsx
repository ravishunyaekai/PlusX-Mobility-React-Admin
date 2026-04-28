import React, { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
// import BookingDetailsSection from '../../../SharedComponent/Details/BookingDetails/BookingDetailsSection.jsx'
import BookingLeftDetails from '../../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
// import BookingDetailsAccordion from '../../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../../api/Requests.js';
import moment from 'moment';
// import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from 'react-router-dom';
import BookingDetailsButtons from '../../../SharedComponent/BookingDetails/BookingDetailsButtons.jsx';
    const statusMapping = {
        '1' : 'In Use',
        '0' : 'Available',
        '2' : 'Used'
    };

const DeviceDetails = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate()
    const { deviceId }                      = useParams()
    const [deviceDetails, setDeviceDetails] = useState({})
    // Static data for the table
    const [currentPage, setCurrentPage]         = useState(1);
    const [totalPages, setTotalPages]           = useState(1);
    const [deviceBrandList, setdeviceBrandList] = useState([])
    
    const handlePageChange = (pageNumber) => {
        console.log(pageNumber)
        setCurrentPage(pageNumber);
    };
    const fetchBrandList = (page) => {
        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            deviceId,
        };
        postRequestWithToken('device-brand-list', obj, async (response) => {
            if (response.code === 200) {
                setdeviceBrandList(response?.data);
                setTotalPages(response?.total_page || 1);
            
            } else {
                console.log('error in charger-booking-list api', response);
            }
        });
    };

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            device_id  : deviceId
        };
        postRequestWithToken('pod-device-details', obj, (response) => {
            
            if (response.status === 1) {
                const data = response?.data || {};
                
                setDeviceDetails(data);
        
                // const formattedDate = moment(data?.date_of_manufacturing).format('DD-MM-YYYY');
                // setDateOfManufacturing(formattedDate);
                // setIsActive(data?.status === '1' ? true : false)
                
                

            } else {
                console.error('Error in electric-bike-detail API', response);
            }
        });
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []); 
    useEffect(() => {
        fetchBrandList(currentPage);
    }, [currentPage]); 
    
    const headerTitles = {
        bookingIdTitle       : "Device ID",
        customerDetailsTitle : "Modal Name",
        driverDetailsTitle   : "Capacity",
    };
    const sectionTitles1 = {
        bookingStatus : "Inverter",
        price         : "Charger",
        serviceName   : "Status",
    }
    const sectionTitles2 = {
        vehicle: "Current",
        serviceType: "Voltage",
        serviceFeature: "Percentage",
    }
    // , , , , , 
    const content = {
        bookingId    : deviceId,
        createdAt    : moment(deviceDetails?.date_of_manufacturing).format('DD MMM YYYY'),
        customerName : deviceDetails?.design_model,
        driverName   : deviceDetails?.capacity,
    };
    const sectionContent1 = {
        bookingStatus : deviceDetails?.inverter,
        serviceName   : statusMapping[deviceDetails?.status] || deviceDetails?.status, 
        price         : deviceDetails?.charger,
    }
    const sectionContent2 = {
        vehicle        : deviceDetails?.current,
        serviceType    : deviceDetails?.voltage,
        serviceFeature : deviceDetails?.percentage,
    }
    
    return (
        <div className='main-container'>
            <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1}
                type='PODDeviceDetails'
            />
            <div className={styles.bookingDetailsSection}>
                <BookingLeftDetails titles={sectionTitles1} content={sectionContent1}
                    sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
                    type='PODDeviceDetails' />
                {/* { deviceBrandList.length > 0 &&  */}
                    <BookingDetailsButtons
                    deviceId={deviceId} 
                    deviceBrandList={deviceBrandList}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}/>
                {/* } */}
            </div>
        </div>
    )
}

export default DeviceDetails