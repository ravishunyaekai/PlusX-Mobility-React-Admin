import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddOfflineleads.module.css';
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import { MdOutlineCloudUpload } from "react-icons/md";
import { AiOutlineClose } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';

const AddOfflineleads = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // =========================
    // Customer Details
    // =========================
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [locationLink, setLocationLink] = useState('');
    const [address, setAddress] = useState('');
    const [price, setPrice] = useState('');

    // =========================
    // Vehicle Details
    // =========================
    const [vehicleMake, setVehicleMake] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStartRequired, setJumpStartRequired] = useState(null);

    // =========================
    // Driver, Vehicle List
    // =========================
    const [rsaList, setRsaList] = useState([]);
    const [vehicleList, setVehicleList] = useState([]);
    const [vehicleMakeList, setVehicleMakeList] = useState([]);
    const [vehicleModelList, setVehicleModelList] = useState([]);

    // =========================
    // Payment Details
    // =========================
    const [paymentMode, setPaymentMode] = useState(null);
    const [paymentProof, setPaymentProof] = useState([]);
    const [paymentProofPreviews, setPaymentProofPreviews] = useState([]);

    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        const validFiles = selectedFiles.filter((file) =>
            ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
        );

        if (validFiles.length !== selectedFiles.length) {
            toast.error('Invalid file. Only .jpg, .jpeg, .png allowed.');
            return;
        }

        setPaymentProof((prevFiles) => [
            ...prevFiles,
            ...validFiles,
        ]);

        setPaymentProofPreviews((prevPreviews) => [
            ...prevPreviews,
            ...validFiles.map((file) => URL.createObjectURL(file)),
        ]);

        event.target.value = '';
    };

    const handleRemoveGalleryImage = (index) => {
        URL.revokeObjectURL(paymentProofPreviews[index]);

        setPaymentProof((prevFiles) =>
            prevFiles.filter((_, i) => i !== index)
        );

        setPaymentProofPreviews((prevPreviews) =>
            prevPreviews.filter((_, i) => i !== index)
        );
    };

    // =========================
    // Booking Details
    // =========================
    const [bookingStatus, setBookingStatus] = useState(null);
    const [bookingCompletedBy, setBookingCompletedBy] = useState(null);

    // =========================
    // Dropdown Options
    // =========================
    const batteryLevelOptions = [
        { value: '0%', label: '0%' },
        { value: 'More than 5%', label: 'More than 5%' },
    ];

    const jumpStartOptions = [
        { value: 'No', label: 'No' },
        { value: 'Yes', label: 'Yes' },
    ];

    const paymentModeOptions = [
        { value: 'Cash', label: 'Cash' },
        { value: 'Online', label: 'Online' },
    ];

    const bookingStatusOptions = [
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Completed', label: 'Completed' },
    ];

    // =========================
    // Validation
    // =========================
    const validateForm = () => {
        const newErrors = {};

        if (!customerName.trim()) {
            newErrors.customerName = 'Customer Name is required.';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required.';
        } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
            newErrors.phoneNumber =
                'Please enter a valid 10 digit phone number.';
        }

        if (!emailId.trim()) {
            newErrors.emailId = 'Email ID is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
            newErrors.emailId = 'Please enter a valid email ID.';
        }

        if (!locationLink.trim()) {
            newErrors.locationLink = 'Location Link is required.';
        } else {
            try {
                new URL(locationLink);
            } catch {
                newErrors.locationLink = 'Please enter a valid location URL.';
            }
        }

        if (!address.trim()) {
            newErrors.address = 'Address is required.';
        }

        if (!price.trim()) {
            newErrors.price = 'Price including GST is required.';
        } else if (Number(price) <= 0) {
            newErrors.price = 'Price must be greater than 0.';
        }

        if (!vehicleMake.trim()) {
            newErrors.vehicleMake = 'Vehicle Make is required.';
        }

        if (!vehicleModel.trim()) {
            newErrors.vehicleModel = 'Vehicle Model is required.';
        }

        if (!batteryLevel) {
            newErrors.batteryLevel = 'Battery Level is required.';
        }

        if (!jumpStartRequired) {
            newErrors.jumpStartRequired =
                'Jump Start Required is required.';
        }

        if (!paymentMode) {
            newErrors.paymentMode = 'Mode of Payment is required.';
        }

        // Required only for Online payment
        if (paymentMode?.value === 'Online' && paymentProof.length === 0) {
            newErrors.paymentProof = 'Payment Proof is required.';
        }

        if (!bookingStatus) {
            newErrors.bookingStatus = 'Booking Status is required.';
        }

        if (
            bookingStatus?.value === 'Completed' &&
            !bookingCompletedBy
        ) {
            newErrors.bookingCompletedBy =
                'Booking Completed By is required.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =========================
    // Submit
    // =========================
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Some fields are missing.');
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append('userId', userDetails?.user_id || '');
        formData.append('email', userDetails?.email || '');

        // Customer Details
        formData.append('customer_name', customerName);
        formData.append('phone_number', phoneNumber);
        formData.append('email_id', emailId);
        formData.append('location_link', locationLink);
        formData.append('address', address);
        formData.append('price', price);

        // Vehicle Details
        formData.append('vehicle_make', vehicleMake);
        formData.append('vehicle_model', vehicleModel);
        formData.append('battery_level', batteryLevel?.value || '');
        formData.append(
            'jump_start_required',
            jumpStartRequired?.value || ''
        );

        // Payment Details
        formData.append(
            'payment_mode',
            paymentMode?.value || ''
        );

        paymentProof.forEach((file) => {
            formData.append('payment_proof', file);
        });

        // Booking Details
        formData.append(
            'booking_status',
            bookingStatus?.value || ''
        );

        formData.append(
            'booking_completed_by',
            bookingCompletedBy?.value || ''
        );

        postRequestWithToken(
            'add-ev-road-assistance-offline-lead',
            formData,
            async (response) => {
                if (response.code === 200 || response.status === 1) {
                    toast.success(
                        response.message ||
                        'Booking added successfully.'
                    );

                    setTimeout(() => {
                        setLoading(false);
                        navigate(
                            '/electric/ev-road-assistance/rsa-offline-leads'
                        );
                    }, 1000);
                } else {
                    toast.error(
                        response.message ||
                        response.message?.[0] ||
                        'Something went wrong.'
                    );

                    console.log(
                        'Error in add offline lead API:',
                        response
                    );

                    setLoading(false);
                }
            }
        );
    };

    const getDriverList = () => {
        try {
            const rsaObj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                service_type: 'EV Roadside Assistance',
            };

            postRequestWithToken(
                'all-rsa-list',
                rsaObj,
                async (response) => {
                    if (response.code === 200) {
                        const drivers = (response?.data || []).map((item) => ({
                            value: item?.rsa_name || '',
                            label: item?.rsa_name || '',
                        }));

                        setRsaList(drivers);
                    } else {
                        console.log(
                            'Error in all-rsa-list API:',
                            response
                        );
                    }
                }
            );
        } catch (e) {
            console.log("Error in getDriverList:", e);
        }
    };

    const getVehicleList = () => {
        try {
            postRequestWithToken(
                'ev-road-assistance-offline-vehicle-list',
                {},
                async (response) => {
                    if (response.code === 200) {
                        setVehicleList(response?.data || []);
                        setVehicleMakeList(response?.data || [])?.map((vehicle) => ({
                            value: vehicle.value,
                            label: vehicle.label,
                        }));;
                    } else {
                        console.log(
                            'Error in ev-road-assistance-offline-vehicle-list API:',
                            response
                        );
                    }
                }
            );
        } catch (e) {
            console.log('Error in getVehicleList:', e);
        }
    };

    useEffect(() => {
        if (!userDetails?.access_token) {
            navigate('/login');
            return;
        }

        getDriverList();
        getVehicleList();
    }, [navigate]);

    const handleCancel = () => {
        navigate('/electric/ev-road-assistance/rsa-offline-leads');
    };

    useEffect(() => {
        if (paymentMode?.value !== 'Online') {
            paymentProofPreviews.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            setPaymentProof([]);
            setPaymentProofPreviews([]);
        }
    }, [paymentMode]);

    useEffect(() => {
        if (vehicleMakeList?.length == 0) {
            setVehicleModelList([])
        }
        
    }, [vehicleMakeList])


    return (
        <div className={styles.addStationContainer}>
            <ToastContainer />

            <div className={styles.addHeading}>
                Add EV Road Assistance Offline Booking
            </div>

            <div className={styles.addStationFormSection}>
                <form
                    className={styles.formSection}
                    onSubmit={handleSubmit}
                >

                    {/* =====================================================
                        CUSTOMER DETAILS
                    ====================================================== */}
                    {/* <div className={styles.formSectionHeading}>
                        Customer Details
                    </div> */}

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Customer Details

                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Customer Name */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Customer Name
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Customer Name"
                                        className={styles.inputField}
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                    />

                                    {errors.customerName && (
                                        <p className={styles.error}>
                                            {errors.customerName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Phone Number
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Phone Number"
                                        className={styles.inputField}
                                        value={phoneNumber}
                                        maxLength={10}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ''
                                                );

                                            setPhoneNumber(value);
                                        }}
                                    />

                                    {errors.phoneNumber && (
                                        <p className={styles.error}>
                                            {errors.phoneNumber}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        {/* Email */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Email ID
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="email"
                                        autoComplete="off"
                                        placeholder="Email ID"
                                        className={styles.inputField}
                                        value={emailId}
                                        onChange={(e) =>
                                            setEmailId(e.target.value)
                                        }
                                    />

                                    {errors.emailId && (
                                        <p className={styles.error}>
                                            {errors.emailId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location Link */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Location Link
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="url"
                                        autoComplete="off"
                                        placeholder="Google Maps Location Link"
                                        className={styles.inputField}
                                        value={locationLink}
                                        onChange={(e) =>
                                            setLocationLink(e.target.value)
                                        }
                                    />

                                    {errors.locationLink && (
                                        <p className={styles.error}>
                                            {errors.locationLink}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        {/* Address */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Address
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <textarea
                                        placeholder="Address"
                                        className={styles.inputField}
                                        rows="3"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                    />

                                    {errors.address && (
                                        <p className={styles.error}>
                                            {errors.address}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Price Including GST
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Price Including GST"
                                        className={styles.inputField}
                                        value={price}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d{0,10}(\.\d{0,2})?$/.test(
                                                    value
                                                )
                                            ) {
                                                setPrice(value);
                                            }
                                        }}
                                    />

                                    {errors.price && (
                                        <p className={styles.error}>
                                            {errors.price}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* =====================================================
                        VEHICLE DETAILS
                    ====================================================== */}
                    {/* <div className={styles.formSectionHeading}>
                        Vehicle Details
                    </div> */}

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Vehicle Details

                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Vehicle Make */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Vehicle Make
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Vehicle Make"
                                        className={styles.inputField}
                                        value={vehicleMake}
                                        onChange={(e) =>
                                            setVehicleMake(e.target.value)
                                        }
                                    />

                                    {errors.vehicleMake && (
                                        <p className={styles.error}>
                                            {errors.vehicleMake}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Model */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Vehicle Model
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Vehicle Model"
                                        className={styles.inputField}
                                        value={vehicleModel}
                                        onChange={(e) =>
                                            setVehicleModel(e.target.value)
                                        }
                                    />

                                    {errors.vehicleModel && (
                                        <p className={styles.error}>
                                            {errors.vehicleModel}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        {/* Battery Level */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Battery Level
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={batteryLevelOptions}
                                        value={batteryLevel}
                                        onChange={setBatteryLevel}
                                        labelledBy="Select Battery Level"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.batteryLevel && (
                                        <p className={styles.error}>
                                            {errors.batteryLevel}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Jump Start */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Jump Start Required
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={jumpStartOptions}
                                        value={jumpStartRequired}
                                        onChange={setJumpStartRequired}
                                        labelledBy="Select Option"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.jumpStartRequired && (
                                        <p className={styles.error}>
                                            {errors.jumpStartRequired}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* =====================================================
                        PAYMENT DETAILS
                    ====================================================== */}
                    {/* <div className={styles.formSectionHeading}>
                        Payment Details
                    </div> */}


                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Payment Details

                            </label>
                        </div>
                    </div>
                    <div className="row">

                        {/* Payment Mode */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Mode of Payment
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={paymentModeOptions}
                                        value={paymentMode}
                                        onChange={setPaymentMode}
                                        labelledBy="Select Payment Mode"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.paymentMode && (
                                        <p className={styles.error}>
                                            {errors.paymentMode}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Proof */}
                        {paymentMode?.value === "Online" && (
                            <div className={`col-lg-6`}>
                                <label className={styles.labelText}>
                                    Payment Proof
                                </label>
                                <div className={`row`}>
                                    <div className="col-xl-10 col-lg-12">
                                        <div className={styles.uploadContainer}>
                                            <span className={styles.uploadLabel}>
                                                {paymentProof.length > 0
                                                    ? (
                                                        paymentProof.length > 2 ? `${paymentProof[0].name}, ${paymentProof[1].name}... (${paymentProof.length - 2} more)` : paymentProof.map(file => file.name).join(', ')
                                                    )
                                                    : 'Upload Payment Proof'}
                                            </span>
                                            <label htmlFor="galaryImage" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                            <input type="file" multiple id="galaryImage" accept=".jpg,.jpeg,.png" onChange={handleGalleryChange} className={styles.hiddenInput} />
                                        </div>
                                        {errors.paymentProof && paymentProof.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.paymentProof}</p>}
                                    </div>
                                </div>
                                {paymentProof?.length > 0 && (<div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12`}>
                                        <div className={styles.galleryContainer}>
                                            {paymentProof?.map((file, index) => (
                                                <div className={styles.imageContainer} key={index}>
                                                    {/* <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={URL.createObjectURL(file)} /> */}
                                                    <img
                                                        alt={`Preview ${index + 1}`}
                                                        className={styles.previewImage}
                                                        src={paymentProofPreviews[index]}
                                                    />
                                                    <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>)}
                            </div>
                        )}
                    </div>


                    {/* =====================================================
                        BOOKING DETAILS
                    ====================================================== */}
                    {/* <div className={styles.formSectionHeading}>
                        Booking Details
                    </div> */}

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label
                                className={styles.featureLabel}
                                htmlFor="Features"
                            >
                                Booking Details
                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Booking Status */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Booking Status
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={bookingStatusOptions}
                                        value={bookingStatus}
                                        onChange={setBookingStatus}
                                        labelledBy="Select Booking Status"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.bookingStatus && (
                                        <p className={styles.error}>
                                            {errors.bookingStatus}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Booking Completed By */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Booking Completed By
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={rsaList}
                                        value={bookingCompletedBy}
                                        onChange={setBookingCompletedBy}
                                        labelledBy="Select Driver"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.bookingCompletedBy && (
                                        <p className={styles.error}>
                                            {errors.bookingCompletedBy}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* =====================================================
                        BUTTONS
                    ====================================================== */}
                    <div className="row">
                        <div className="col-xl-11 col-lg-12">
                            <div className="row">
                                <div
                                    className={`col-lg-12 ${styles.editButton}`}
                                >
                                    <button
                                        type="button"
                                        className={styles.editCancelBtn}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className={styles.editSubmitBtn}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Submit...
                                            </>
                                        ) : (
                                            'Submit'
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

export default AddOfflineleads;