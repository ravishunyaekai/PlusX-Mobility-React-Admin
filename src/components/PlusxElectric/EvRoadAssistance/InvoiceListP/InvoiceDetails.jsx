import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { postRequestWithToken } from '../../../api/Requests';
import Invoice from '../../../components/SharedComponent/Invoice/Invoice';

const InvoiceDetails = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                            = useNavigate()
    const {invoiceId}                         = useParams()
    const [bookingDetails, setBookingDetails] = useState()
    
    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            invoice_id : invoiceId
        };
        postRequestWithToken('charger-booking-invoice-details', obj, (response) => {
            // console.log(response?.data?.bookingHistory)
            if (response.code === 200) {
                setBookingDetails(response?.data || {});  
            } else {
                console.log('error in charger-booking-invoice-details API', response);
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
        <Invoice title = 'Portable Charger Invoice Details' service = 'Portable Charger Service' details = {bookingDetails}/>
    </div>
  )
}

export default InvoiceDetails