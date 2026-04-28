import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { postRequestWithToken } from '../../../api/Requests';
import RideInvoice from '../../../components/SharedComponent/Invoice/RideInvoice';

const RideInvoiceDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                            = useNavigate()
    const {bookingId}                         = useParams();
    const [bookingDetails, setBookingDetails] = useState({});
    
    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            booking_id : bookingId
        };
        postRequestWithToken('cycle-invoice-details', obj, (response) => {
            if (response.status == 1) {
                setBookingDetails(response?.data || {});  
            } else {
                console.log('error in cycle-booking-details', response);
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

  return (
    <div>
        <RideInvoice title = 'Ride Invoice Details' details = {bookingDetails}/>
    </div>
  )
}

export default RideInvoiceDetails