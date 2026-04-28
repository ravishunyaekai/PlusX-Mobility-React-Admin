import { useEffect, useState } from 'react';
import styles from './chargerbooking.module.css'
import BookingDetailsHeader from '../../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
// import BookingDetailsSection from '../../../SharedComponent/Details/BookingDetails/BookingDetailsSection.jsx'
import BookingLeftDetails from '../../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
// import BookingDetailsAccordion from '../../../SharedComponent/BookingDetails/BookingDetailsAccordion.jsx'
import { postRequestWithToken } from '../../../../api/Requests.js';
import moment from "moment-timezone";
// import { toast, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from 'react-router-dom';
import BookingDetailsButtons from '../../../SharedComponent/BookingDetails/BookingDetailsButtons.jsx';
import BookingStatusSection from '../../../SharedComponent/BookingDetails/BookingStatusSection.jsx';
import Loader from '../../../SharedComponent/Loader/Loader.jsx';
    
const DeviceDetails = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate()
    const { podId }                         = useParams()
    const [deviceDetails, setDeviceDetails] = useState({})
    // Static data for the table
    const [currentPage, setCurrentPage]         = useState(1);
    const [totalPages, setTotalPages]           = useState(1);
    const [deviceBrandList, setdeviceBrandList] = useState([]);
    const [brandImagePath, setBrandImagePath]   = useState('');
    const [loading, setLoading]                 = useState(false);

    const [deviceBatteryData, setDeviceBatteryData] = useState([
        { id : '', batteryId : '', capacity : '' }
    ]);

    const handlePageChange = (pageNumber) => {
        
        setCurrentPage(pageNumber);
    };
    const fetchBrandList = (page) => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            podId,
        };
        postRequestWithToken('device-brand-list', obj, async (response) => {
            if (response.code === 200) {
                setdeviceBrandList(response?.data);
                setBrandImagePath(response?.base_url)
                setTotalPages(response?.total_page || 1);

            } else {
                // console.log('error in charger-booking-list api', response);
            }
        });
    };

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
            pod_id : podId
        };
        postRequestWithToken('pod-device-details', obj, (response) => {

            if (response.status === 1) {
                const data = response?.data || {};

                setDeviceDetails(data);
                setDeviceBatteryData(response?.batteryData);
            } else {
                // console.error('Error in electric-bike-detail API', response);
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
        const interval = setInterval(fetchDetails, 300000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        fetchBrandList(currentPage);

    }, [currentPage]);

    const current    = deviceBatteryData.reduce((sum, row) => sum + (parseFloat(row.current) || 0), 0) ;
    const voltages   = deviceBatteryData.reduce((sum, row) => sum + (parseFloat(row.voltage) || 0), 0) ;
    const percentage = deviceBatteryData.reduce((sum, row) => sum + (parseFloat(row.percentage) || 0), 0) ;

    const capacityArr = deviceBatteryData.map( obj  => ( obj.current * obj.voltage ).toFixed(2) );
    const capacity = parseFloat( capacityArr.reduce((sum, row) => sum + ( parseFloat(row) || 0), 0) );
    const capacityKw = ( capacity / 1000 ) ;
    const batteryLength = deviceBatteryData.length;

    const headerTitles = {
        bookingIdTitle       : "Current",
        customerDetailsTitle : "Voltage", 
        driverDetailsTitle   : "Percentage", 
        podTemp              : "Charging Speed", 
        chargingStatus       : 'Charging Status',
        lastupdate           : 'Last Update',
        consume              : 'Total Consumed',
        discharge            : 'Total Discharged',
    };
    const content = {  
        bookingId      : ( current ).toFixed(2) +" A", 
        createdAt      : '',        
        customerName   : ( voltages > 0 ) ? ( voltages / batteryLength ).toFixed(2) +" V" : "0 V", 
        driverName     : ( percentage > 0 ) ? ( percentage / batteryLength ).toFixed(2) +" %" : '0 %',
        podTemp        : capacityKw.toFixed(2) +" kw", 
        chargingStatus : ( capacityKw > 0) ? 'Charging' : ( capacityKw <= -0 && capacityKw >= -3 ) ? 'Stand By' : 'Discharging',
        lastupdate     : moment(deviceBatteryData[batteryLength-1].updated_at).format('DD MMM YYYY HH:mm A'),
        consume        : deviceDetails?.temp1,   //temp1 Consumed
        discharge      : deviceDetails?.temp2, // temp2 Discharge
    }; 
    const date1 = deviceBatteryData[batteryLength-1].updated_at; 
    if(date1) {
        let date2      = moment().tz("Asia/Dubai");
        let activeTime =  date2.subtract(30, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        if(date1 < activeTime){
            headerTitles.lastupdate = "Device Status";
            content.lastupdate      = 'In-Active'
        }
    }
    
    const sectionTitles1 = {
        bookingStatus : "POD ID",
        price         : "Pod Name",
        serviceName   : "Device ID",
        // design_model  : "Modal",
    }
    const sectionContent1 = {
        bookingStatus : deviceDetails?.pod_id,
        serviceName   : deviceDetails?.pod_name,  
        price         : deviceDetails?.device_id,
        // design_model  : deviceDetails?.design_model,
    }
    const sectionTitles2 = {
        vehicle        : "Modal",
        serviceType    : "Capacity",
        serviceFeature : "Inverter",
    }
    const sectionContent2 = {
        vehicle        : deviceDetails?.design_model,
        serviceType    : deviceDetails?.capacity,
        serviceFeature : deviceDetails?.inverter,
    }
    const sectionTitles3 = {
        charger               : "Charger",
        date_of_manufacturing : "Date Of Manufacturing",
        created_date          : "POD Regs. Date & Time",
    }
    const sectionContent3 = {
        charger               : deviceDetails?.charger,
        date_of_manufacturing : moment(deviceDetails?.date_of_manufacturing).format('DD MMM YYYY'),
        created_date          : moment(deviceDetails?.created_at).format('DD MMM YYYY HH:mm A'),
    }
    return (
        <div className='main-container'>
            { loading ? <Loader />:
                <>
                    <BookingDetailsHeader content={content} titles={headerTitles} sectionContent={sectionContent1} type='PODDeviceDetails' deviceBatteryData={deviceBatteryData} />
                    <div className={styles.bookingDetailsSection}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={sectionTitles2} sectionContent2={sectionContent2}
                            sectionTitles3={sectionTitles3} sectionContent3={sectionContent3} type='PODDeviceDetails' />
                        <BookingStatusSection deviceId={podId} podStatus={deviceDetails?.status} />
                        <BookingDetailsButtons deviceId={podId} deviceBrandList={deviceBrandList} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}
                            brandImagePath={brandImagePath} deviceBatteryData={deviceBatteryData} />
                    </div>
                </>
            }
        </div>
    )
}

export default DeviceDetails