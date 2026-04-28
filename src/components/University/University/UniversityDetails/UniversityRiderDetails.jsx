import { useEffect, useState } from 'react';
import styles from '../Universities.module.css';
import { postRequestWithToken } from '../../../../api/Requests';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from "../../../SharedComponent/Loader/Loader.jsx";
import DetailsCards from '../../../SharedComponent/Details/NewBookingDetails/DetailsCards/DetailsCards';
import AppSignupInfoSection from '../../../SharedComponent/Details/NewBookingDetails/AppSignupInfoSection/AppSignupInfoSection';
import moment from 'moment';
import List from '../../../SharedComponent/List/List.jsx';
import Pagination from '../../../SharedComponent/Pagination/Pagination';
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

//Images & Icons
import email from "../../../../assets/images/Email.svg";
import date from "../../../../assets/images/DateCard.svg";
import profile from "../../../../assets/images/ProfileCard.svg";
import mobile from "../../../../assets/images/MobileCard.svg";
import View from '../../../../assets/images/ViewEye.svg'

const UniversityRiderDetails = () => {
  const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
  const navigate                            = useNavigate();
  const { riderId }                         = useParams();
console.log("riderId",riderId)
  const [riderDetails, setRiderDetails]     = useState();
  const [loading, setLoading]               = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [bookingHistory, setBookingHistory] = useState([]);
  const [currentPage, setCurrentPage]       = useState(1);
  const [totalPages, setTotalPages]         = useState(1);

  const obj = {
      userId        : userDetails?.user_id,
      email         : userDetails?.email,
      riderId       : riderId,
      service_type  : 'Ride Details',
      page_no       : currentPage
    };

  const fetchRiderDetails  = () => {
    setLoading(true);
    postRequestWithToken('rider-details', obj, (response) => {
      if (response.code === 200) {
        setRiderDetails(response?.data || {});
      } else {
        console.log('error in rider-details API', response);
      }
      setLoading(false);
    });
  };

  const fetchBookingHistory = () => {
    setLoadingHistory(true);
    postRequestWithToken('cycle-booking-history', obj, async (response) => {
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
    fetchRiderDetails();
  }, []);

  useEffect(() => {
    if (!userDetails || !userDetails.access_token) {
      navigate('/login');
      return;
    }
    fetchBookingHistory();
  }, [currentPage]);

  const handleBookingDetails = (id) => navigate(`/mobility/ride/ride-booking-details/${id}`)
  const handlePageChange = (page) => ( setCurrentPage(page) );

  const headerItems = [
      { label: 'Date',        icon: date,     value: moment(riderDetails?.rider.created_at).format('DD MMM YYYY') },
      { label: 'Rider Name',  icon: profile,  value: riderDetails?.rider.rider_name },
      { label: 'Mobile No.',  icon: mobile,   value: riderDetails?.rider.rider_mobile },
      { label: 'Email ID',    icon: email,    value: riderDetails?.rider.rider_email },
  ];
 
  const riderInfoFields = riderDetails?.rider ? [
    // { label: 'Type of User', value: riderDetails.rider.account_type },
        ...(riderDetails.rider.student_id ? [
          { label: 'University / College Name', value: riderDetails?.rider?.university_name },
          { label: 'Student ID',                value: riderDetails?.rider?.student_id }
        ] : []),
          { label: 'State', value: riderDetails?.rider?.state },
          { label: 'City',  value: riderDetails?.rider?.city },
  ] : [];

  return (
    <div className='main-container'>
        {loading ?  <Loader /> : (
          <>
            <DetailsCards items={headerItems} />
            <div className={styles.bookingDetailsSection}>
                {riderInfoFields.length > 0 ? (
                    <AppSignupInfoSection 
                        imageUrl={ riderDetails?.rider?.id_image ? `${riderDetails.base_url}${riderDetails.rider.id_image}` : null }
                        riderInfoFields={riderInfoFields} fieldCount={riderInfoFields.length}
                    />
                ) : (
                    <div className={styles.noBookingData}>No user info available.</div>
                )}
            </div>
            {/* <div className={styles.bookingDetailsSection}>
              <div className={styles.DetailsMainHeading}>Ride History</div>
            </div>                 */}
              
            {loadingHistory ? <Loader /> :
                bookingHistory.length === 0 ? 
                    <EmptyList
                        tableHeaders={["Date","Rider ID", "Rider Name", "Student /Individual" ,"Cycle Type" ,"Pick Up Station", "Dropoff Station" , "Status", "Action"]}
                        message="No data available"
                    />
                : <>
                    <List
                        tableHeaders={["Date","Rider ID", "Rider Name", "Student /Individual" ,"Cycle Type" ,"Pick Up Station", "Dropoff Station" , "Status", "Action"]}
                        listData={bookingHistory}
                        pageHeading="Ride History"
                        keyMapping={[
                          { key: 'booking_date',    label: 'Date', format: date => moment(date).format('DD MMM YYYY') },
                          { key: 'booking_id',      label: 'Rider ID' },
                          { key: 'rider_name',      label: 'Rider Name' },
                          { key: 'account_type',    label: 'Student /Individual' },
                          { key: 'cycle_type',      label: 'Cycle Type' },
                          { key: 'pickup_station',  label: 'Pickup' },
                          { key: 'dropoff_station', label: 'Drop' },
                          { key: 'status',          label: 'Status' },
                          { key: 'action',          label: 'Action',
                            relatedKeys: ['status'], 
                            format: (data, key, relatedKeys) => {                  
                                return (
                                  <div className="editButtonSection">
                                      <img src={View} alt="view" onClick={() => handleBookingDetails(data.booking_id)} className="viewButton"/>
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
        )}
    </div>
  );
};

export default UniversityRiderDetails;
