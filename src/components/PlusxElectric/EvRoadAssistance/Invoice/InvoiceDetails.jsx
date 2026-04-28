import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { postRequestWithToken } from '../../../../api/Requests';
import Invoice from '../../../../components/SharedComponent/Invoice/Invoice';

const RoadAssistanceInvoiceDetails = () => {
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
        postRequestWithToken('ev-road-assistance-invoice-data', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});  
            } else {
                console.log('error in ev-road-assistance-invoice-data API', response);
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
        <Invoice title = 'Road Assistance Invoice Details' service = 'Road Assistance' details = {bookingDetails}/>
    </div>
  )
}

export default RoadAssistanceInvoiceDetails