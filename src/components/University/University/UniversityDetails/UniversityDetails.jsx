import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postRequestWithToken } from '../../../../api/Requests.js';
import { ToastContainer } from "react-toastify";
import moment from 'moment';
import styles from '../Universities.module.css';
import 'react-toastify/dist/ReactToastify.css';
import StationCard from "../../../SharedComponent/Details/NewBookingDetails/StationCard/StationCard.jsx";
import DetailsCards from "../../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards.jsx";
import List from '../../../SharedComponent/List/List.jsx';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import Loader from "../../../SharedComponent/Loader/Loader.jsx";

//Images & Icons
import Contact from "../../../../assets/images/ContactCard.svg";
import city from "../../../../assets/images/CityCard.svg";
import View from '../../../../assets/images/ViewEye.svg'
// import Station from "../../../../assets/images/Station.svg";
// import date from "../../../../assets/images/DateCard.svg";
// import profile from "../../../../assets/images/ProfileCard.svg";
// import mobile from "../../../../assets/images/MobileCard.svg";

const UniversityDetails = () => {
    const userDetails                               = JSON.parse(sessionStorage.getItem('userDetails'));
    const { universityId }                          = useParams();
    const navigate                                  = useNavigate();
    const [univerityDetails, setUniverityDetails]   = useState();
    const [loading, setLoading]                     = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [bookingHistory, setBookingHistory] = useState([]);
    const [currentPage, setCurrentPage]       = useState(1);
    const [totalPages, setTotalPages]         = useState(1);

    const obj = {
        userId          : userDetails?.user_id,
        email           : userDetails?.email,
        universityId    : universityId,
        service_type    : 'university_details',
        page_no         : currentPage
    };

    const headerItems = [
        { label: 'University ID',   icon: Contact,     value: universityId },
        { label: 'University Name', icon: city,     value: univerityDetails?.name },
        { label: 'State',           icon: city,        value: univerityDetails?.state},
        { label: 'City',            icon: city,        value: univerityDetails?.city },
        { label: 'Adress',            icon: city,        value: univerityDetails?.address },

    ];
    
    const fetchDetails = () => {
        setLoading(true);
        postRequestWithToken('university-details', obj, (response) => {
            if (response.code === 200) {
                console.log('university-details API response', response);
                setUniverityDetails(response?.university || {});
            } else {
                console.log('error in university-details API', response);
            }
            setLoading(false);
        });
    };

    const fetchBookingHistory = () => {
        setLoadingHistory(true);
        postRequestWithToken('university-student-list', obj, async (response) => {
        if (response.code === 200) {
            setBookingHistory(response?.data || []);
            setTotalPages(response?.total_page || 1);
        } else {
            console.log('error in Cycle-booking-list api', response);
        }
        setLoadingHistory(false);
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
        if (!userDetails || !userDetails.access_token) {
        navigate('/login');
        return;
        }
        fetchBookingHistory();
    }, [currentPage]);
  
    const handlePageChange = (page) => ( setCurrentPage(page) );
    // const handleBookingDetails = (id) => navigate(`/mobility/universities/university-details/rider-details/${id}/`)
    const handleBookingDetails = (id) => navigate(`/mobility/universities/rider-details/${id}/`)

    return (
        <div className='main-container'>
            <ToastContainer />
            { loading ? <Loader /> : 
                <>
                    <DetailsCards items={headerItems} />

                    {loadingHistory ? <Loader /> :
                        bookingHistory.length === 0 ? 
                            <EmptyList
                                tableHeaders={["Rider ID", "Rider Name", "Contact Number" ,"Email ID" ,"Student ID ", "Action"]}
                                message="No data available"
                            />
                        : <>
                            <List
                                tableHeaders={["Rider ID", "Rider Name", "Contact Number" ,"Email ID" ,"Student ID ", "Action"]}
                                listData={bookingHistory}
                                pageHeading="Student Details"
                                keyMapping={[
                                //   { key: 'booking_date',    label: 'Date', format: date => moment(date).format('DD MMM YYYY') },
                                { key: 'rider_id',        label: 'Rider ID' },
                                { key: 'rider_name',      label: 'Rider Name' },
                                { key: 'rider_mobile',  label: 'Contact Number' },
                                { key: 'rider_email',        label: 'Email ID' },
                                { key: 'student_id',      label: 'Student ID' },
                                { key: 'action',          label: 'Action',
                                    relatedKeys: ['status'], 
                                    format: (data, key, relatedKeys) => {    
                                                   
                                        return (
                                        <div className="editButtonSection">
                                            <img src={View} alt="view" onClick={() => handleBookingDetails(data.rider_id)} className="viewButton"/>
                                        </div>
                                        );
                                    }
                                }
                                ]}
                            />
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                        </> 
                    }
                </>
            }
        </div>
  );
}

export default UniversityDetails;