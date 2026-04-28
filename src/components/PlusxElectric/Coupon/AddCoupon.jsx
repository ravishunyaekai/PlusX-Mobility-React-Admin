import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './addcoupon.module.css';
// import UploadIcon from '../../../assets/images/uploadicon.svg';
// import { AiOutlineClose } from 'react-icons/ai';
import InputMask from 'react-input-mask';
import { postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";

const AddCoupon = () => {
  const userDetails                               = JSON.parse(sessionStorage.getItem('userDetails')); 
  const navigate                                  = useNavigate()
  const [errors, setErrors]                       = useState({});
  const [couponName, setCouponName]               = useState('')
  const [couponCode, setCouponCode]               = useState('')
  const [couponPercentage, setCouponPercentage]   = useState('')
  const [expiryDate, setExpiry]                   = useState('')
  const [perCustomer, setPerCustomer]             = useState('')
  const [serviceType, setServiceType]             = useState([]);
  const [loading, setLoading]                     = useState(false);

  const typeOpetions = [
      // { value: "",                              label: "Select Vehicle Type" },
      { value: "Charger Installation",          label: "Charger Installation" },
      { value: "EV Pre-Sale",                   label: "EV Pre-Sale" },
      { value: "POD-On Demand Service",         label: "POD-On Demand Service" },
      { value: "POD-Get Monthly Subscription",  label: "POD-Get Monthly Subscription" },
      { value: "Roadside Assistance",           label: "Roadside Assistance" },
      { value: "Valet Charging",                label: "Valet Charging" },
  ];

  const handleVehicleType = (selectedOption) => {
      setServiceType(selectedOption)
  }

  const validateForm = () => {
    const fields = [
        { name: "couponName",       value: couponName,        errorMessage: "Coupon Name is required." },
        { name: "couponCode",       value: couponCode,        errorMessage: "Coupon Code is required." },
        { name: "serviceType",      value: serviceType,       errorMessage: "Service Type is required.", isArray: true },
        { name: "perCustomer",      value: perCustomer,       errorMessage: "Usage Per Customer is required." },
        { name: "couponPercentage", value: couponPercentage,  errorMessage: "Percentagae is required."},
        { name: "expiryDate",       value: expiryDate,        errorMessage: "Expiry Date is required."},
    ];

    const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
      if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
            errors[name] = errorMessage;
      }
      return errors;
      }, {});
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      setLoading(true);
      if (validateForm()) {
          const formData = new FormData();
          formData.append("userId", userDetails?.user_id);
          formData.append("email", userDetails?.email);
          formData.append("coupan_name", couponName);
          formData.append("coupan_code", couponCode);
          formData.append("coupan_percentage", couponPercentage);
          const convertToDateFormat = (date) => {
              const [day, month, year] = date.split('-');
              return `${year}-${month}-${day}`;
            };
          const formattedExpiryDate = convertToDateFormat(expiryDate);
            
          formData.append("expiry_date", formattedExpiryDate);
          formData.append("user_per_user", perCustomer);
          formData.append("status", '1');
          if (serviceType) {
              formData.append("service_type", serviceType.value);
          }
        
          postRequestWithToken('add-coupan', formData, async (response) => {
              if (response.status === 1) {
                  toast(response.message || response.message[0], {type:'success'})
                  setTimeout(() => {
                      setLoading(false);
                      navigate('/electric/coupon/coupon-list');
                  }, 1000);
              } else {
                  toast(response.message || response.message[0], {type:'error'})
                  console.log('Error in add-coupan API:', response);
                  setLoading(false);
              }
          } )
      } else {
        toast.error("Some fields are missing");
        setLoading(false);
      }
  };

  useEffect(() => {
    if (!userDetails || !userDetails.access_token) {
        navigate('/login');
        return;
    }
  }, []);

  const handleCancel = () => {
      navigate('/electric/coupon/coupon-list')
  }

  return (
    <div className={styles.addStationContainer}>
      <ToastContainer />
      <div className={styles.addHeading}>Add Coupon</div>
      <div className={styles.addStationFormSection}>
        <form className={styles.formSection} onSubmit={handleSubmit}>
          
          <div className={`row`}>
              <div className={`col-lg-6`}>
                  <label htmlFor="couponName" className={styles.labelText}>Coupon Name</label>
                  <div className={`row`}>
                      <div className={`col-xl-10 col-lg-12`}>
                          <input type="text" autoComplete="off" id="couponName" placeholder="Coupon Name" className={styles.inputField} value={couponName} onChange={(e) => setCouponName(e.target.value)} />
                          {errors.couponName && couponName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.couponName}</p>}
                      </div>
                  </div>
              </div>
              <div className={`col-lg-6`}>
                  <label htmlFor="couponCode" className={styles.labelText}>Coupon Code</label>
                  <div className={`row`}>
                      <div className={`col-xl-10 col-lg-12`}>
                          <input type="text" autoComplete="off" id="couponCode" placeholder="Coupon Code" className={styles.inputField} value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                          {errors.couponCode && couponCode === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.couponCode}</p>}
                      </div>
                  </div>
              </div>
          </div>
         
          <div className={`row`}>
              <div className={`col-lg-6`}>
                  <label htmlFor="serviceType" className={styles.labelText}>Service Type</label>
                  <div className={`row`}>
                      <div className={`col-xl-10 col-lg-12`}>
                          <CustomDropdown options={typeOpetions} value={serviceType} onChange={handleVehicleType} labelledBy="Select Service Type" closeOnChangedValue={false} closeOnSelect={false}/>
                          {errors.serviceType && serviceType.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.serviceType}</p>}
                      </div>
                  </div>
              </div>
              <div className={`col-lg-6`}>
                  <label htmlFor="perCustomer" className={styles.labelText}>Usage Per Customer</label>
                  <div className={`row`}>
                      <div className={`col-xl-10 col-lg-12`}>
                          <input type="text" autoComplete="off" id="perCustomer" placeholder="Usage Per Customer" className={styles.inputField} value={perCustomer} 
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d{0,5}$/.test(value)) { setPerCustomer(value) }
                            }} 
                          />
                          {errors.perCustomer && perCustomer === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.perCustomer}</p>}
                      </div>
                  </div>
              </div>
          </div>
         

          <div className={`row`}>
              <div className={`col-lg-6`}>
                  <label htmlFor="couponPercentage" className={styles.labelText}>Coupon Percentage</label>
                  <div className={`row`}>
                      <div className={`col-xl-10 col-lg-12`}>
                          <input type="text" autoComplete="off" id="couponPercentage" placeholder="Coupon Percentage" className={styles.inputField} value={couponPercentage} 
                            onChange={(e) => {
                              const value = e.target.value;
                              const decimalPattern = /^\d{0,3}(\.\d{0,3})?$/;
                              if (decimalPattern.test(value)) {
                                  setCouponPercentage(value);
                                  if (errors.couponPercentage) {
                                      setErrors((prevErrors) => ({ ...prevErrors, couponPercentage: "" }));
                                  }
                              } else {
                                  setErrors((prevErrors) => ({
                                      ...prevErrors,
                                      couponPercentage: "Only up to 3 digits before and after the decimal are allowed.",
                                  }));
                              }
                            }}
                           />
                          {errors.couponPercentage && couponPercentage === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.couponPercentage}</p>}
                      </div>
                  </div>
              </div>
              <div className={`col-lg-6`}>
                  <label htmlFor="expiryDate" className={styles.labelText}>Expiry Date</label>
                  <div className={`row`}>
                      <div className={`col-xl-10 col-lg-12`}>
                          <InputMask mask="99-99-9999" value={expiryDate} placeholder="DD-MM-YYYY" className={styles.inputField}
                            onChange={(e) => {
                              setExpiry(e.target.value);
                              if (errors.expiryDate && e.target.value.length === 10) {
                                setErrors((prevErrors) => ({ ...prevErrors, expiryDate: "" }));
                              }
                              }}
                              onBlur={() => {
                                if (expiryDate.length === 10) {
                                  const [day, month, year] = expiryDate.split('-');
                                  const isValidDate =
                                    !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                    day <= 31 && month <= 12; 
                                  if (!isValidDate) {
                                    setErrors((prevErrors) => ({
                                      ...prevErrors,
                                      expiryDate: "Invalid date in DD-MM-YYYY format",
                                    }));
                                  }
                                }
                              }}
                          />
                          {errors.expiryDate && expiryDate === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.expiryDate}</p>}
                      </div>
                  </div>
              </div>
          </div>

          <div className={`row`}>
              <div className={`col-xl-11 col-lg-12`}>
                  <div className={`row`}>
                      <div className={`col-lg-12 ${styles.editButton}`}>
                          <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                          <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                          {loading ? (
                              <> <span className="spinner-border spinner-border-sm me-2"></span> Submit... </>
                          ) : (
                              "Submit"
                          )}
                          </button>
                      </div>
                  </div>
              </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCoupon;
