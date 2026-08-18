import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './AddOfflineleads.module.css';

import {
    postRequestWithToken,
    getRequestWithToken
} from '../../../../api/Requests';

import {
    toast,
    ToastContainer
} from 'react-toastify';

import {
    MdOutlineCloudUpload
} from 'react-icons/md';

import {
    AiOutlineClose
} from 'react-icons/ai';

import 'react-toastify/dist/ReactToastify.css';

import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';

const EditOfflineleads = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    // =========================================================
    // Customer Details
    // =========================================================

    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [locationLink, setLocationLink] = useState('');
    const [address, setAddress] = useState('');
    const [price, setPrice] = useState('');

    // =========================================================
    // Vehicle Details
    // =========================================================

    const [vehicleMake, setVehicleMake] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');

    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStartRequired, setJumpStartRequired] =
        useState(null);

    // =========================================================
    // Payment Details
    // =========================================================

    // Newly selected files
    const [paymentProof, setPaymentProof] = useState([]);

    // Preview URLs for newly selected files
    const [paymentProofPreviews, setPaymentProofPreviews] =
        useState([]);

    // Already uploaded files
    const [existingPaymentProof, setExistingPaymentProof] =
        useState([]);

    const [paymentMode, setPaymentMode] = useState(null);

    // =========================================================
    // Booking Details
    // =========================================================

    const [bookingStatus, setBookingStatus] = useState(null);
    const [bookingCompletedBy, setBookingCompletedBy] =
        useState('');

    // =========================================================
    // Dropdown Options
    // =========================================================

    const batteryLevelOptions = [
        {
            value: '0%',
            label: '0%'
        },
        {
            value: 'more_than_5%',
            label: 'More than 5%'
        }
    ];

    const jumpStartOptions = [
        {
            value: 'yes',
            label: 'Yes'
        },
        {
            value: 'no',
            label: 'No'
        }
    ];

    const paymentModeOptions = [
        {
            value: 'cash',
            label: 'Cash'
        },
        {
            value: 'online',
            label: 'Online'
        }
    ];

    const bookingStatusOptions = [
        {
            value: 'confirmed',
            label: 'Confirmed'
        },
        {
            value: 'completed',
            label: 'Completed'
        }
    ];

    // =========================================================
    // User Details
    // =========================================================

    const getUserDetails = () => {
        try {
            const storedUserDetails =
                sessionStorage.getItem('userDetails');

            if (!storedUserDetails) {
                return null;
            }

            return JSON.parse(storedUserDetails);
        } catch (error) {
            console.error(
                'Unable to parse userDetails:',
                error
            );

            return null;
        }
    };

    // =========================================================
    // Dropdown Helper
    // =========================================================

    const getDropdownValue = (options, value) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return null;
        }

        return (
            options.find(
                option =>
                    String(option.value).toLowerCase() ===
                    String(value).toLowerCase()
            ) || null
        );
    };

    // =========================================================
    // Get Response Message
    // =========================================================

    const getResponseMessage = (
        response,
        defaultMessage
    ) => {
        if (Array.isArray(response?.message)) {
            return (
                response.message[0] ||
                defaultMessage
            );
        }

        return (
            response?.message ||
            defaultMessage
        );
    };

    // =========================================================
    // Normalize Existing Payment Proof
    // =========================================================

    const normalizePaymentProof = paymentProofData => {
        if (!paymentProofData) {
            return [];
        }

        if (Array.isArray(paymentProofData)) {
            return paymentProofData;
        }

        return [paymentProofData];
    };

    // =========================================================
    // Get Existing Image URL
    // =========================================================

    const getExistingImageUrl = file => {
        if (!file) {
            return '';
        }

        if (typeof file === 'string') {
            return file;
        }

        return (
            file?.url ||
            file?.image ||
            file?.file_url ||
            file?.path ||
            file?.image_url ||
            ''
        );
    };

    // =========================================================
    // Fetch Existing Booking
    // =========================================================

    const getBookingDetails = () => {
        setFetchingData(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            request_id: id
        };

        postRequestWithToken(
            'ev-road-assistance-booking-details',
            obj,
            response => {
                console.log(
                    'Get booking details response:',
                    response
                );

                try {
                    if (
                        response?.status === 1 ||
                        response?.code === 200
                    ) {
                        const booking =
                            response?.data?.booking || {};

                        const history =
                            response?.data?.history || [];

                        console.log(
                            'Booking:',
                            booking
                        );

                        console.log(
                            'History:',
                            history
                        );

                        // =================================================
                        // Customer Details
                        // =================================================

                        setCustomerName(
                            booking?.name || ''
                        );

                        setPhoneNumber(
                            booking?.contact_no || ''
                        );

                        /*
                         * Your API response does not contain email.
                         * Keep the existing form field empty.
                         */
                        setEmailId('');

                        /*
                         * Your API response does not contain
                         * location_link separately.
                         *
                         * We can create Google Maps link from
                         * latitude + longitude.
                         */
                        if (
                            booking?.pickup_latitude &&
                            booking?.pickup_longitude
                        ) {
                            setLocationLink(
                                `https://www.google.com/maps?q=${booking.pickup_latitude},${booking.pickup_longitude}`
                            );
                        } else {
                            setLocationLink('');
                        }

                        setAddress(
                            booking?.pickup_address || ''
                        );

                        setPrice(
                            booking?.price !== null &&
                                booking?.price !== undefined
                                ? String(booking.price)
                                : ''
                        );

                        // =================================================
                        // Vehicle Details
                        // =================================================

                        /*
                         * vehicle_data:
                         * "BMW, BMW i5, DL 26 SC 0009"
                         *
                         * Format:
                         * [0] Make
                         * [1] Model
                         * [2] Registration Number
                         */

                        const vehicleData =
                            booking?.vehicle_data || '';

                        const vehicleParts =
                            vehicleData
                                .split(',')
                                .map(item => item.trim());

                        setVehicleMake(
                            vehicleParts?.[0] || ''
                        );

                        setVehicleModel(
                            vehicleParts?.[1] || ''
                        );

                        /*
                         * The API response does not contain:
                         *
                         * battery_level
                         * jump_start_required
                         *
                         * So keep these fields empty.
                         */
                        setBatteryLevel(null);

                        setJumpStartRequired(null);

                        // =================================================
                        // Payment Details
                        // =================================================

                        /*
                         * API response does not contain:
                         *
                         * payment_mode
                         * payment_proof
                         *
                         * So keep existing fields empty.
                         */

                        setPaymentMode(null);

                        setExistingPaymentProof([]);

                        // =================================================
                        // Booking Details
                        // =================================================

                        /*
                         * API:
                         *
                         * order_status: "A"
                         *
                         * Your existing dropdown has:
                         *
                         * confirmed
                         * completed
                         *
                         * Therefore map API status to your
                         * existing dropdown values.
                         *
                         * CNF = confirmed
                         * A   = confirmed/assigned
                         * C   = completed (if your backend uses C)
                         * COM = completed (if your backend uses COM)
                         */

                        let mappedBookingStatus = '';

                        const orderStatus =
                            String(
                                booking?.order_status || ''
                            ).toUpperCase();

                        if (
                            orderStatus === 'CNF' ||
                            orderStatus === 'A'
                        ) {
                            mappedBookingStatus =
                                'confirmed';
                        } else if (
                            orderStatus === 'C' ||
                            orderStatus === 'COM' ||
                            orderStatus === 'CMP' ||
                            orderStatus === 'COMPLETED'
                        ) {
                            mappedBookingStatus =
                                'completed';
                        }

                        setBookingStatus(
                            getDropdownValue(
                                bookingStatusOptions,
                                mappedBookingStatus
                            )
                        );

                        // =================================================
                        // Booking Completed By
                        // =================================================

                        /*
                         * RSA data:
                         *
                         * "AJAY,+91-9312800125"
                         *
                         * This gives us the RSA/driver name.
                         */

                        let completedBy = '';

                        if (booking?.rsa_data) {
                            completedBy =
                                String(
                                    booking.rsa_data
                                )
                                    .split(',')[0]
                                    .trim();
                        }

                        /*
                         * If the history contains rsa_name,
                         * use that as the preferred value.
                         */

                        const latestHistory =
                            history.length > 0
                                ? history[
                                history.length - 1
                                ]
                                : null;

                        if (
                            latestHistory?.rsa_name
                        ) {
                            completedBy =
                                latestHistory.rsa_name;
                        }

                        setBookingCompletedBy(
                            completedBy || ''
                        );

                        // =================================================
                        // Clear Errors
                        // =================================================

                        setErrors({});
                    } else {
                        toast.error(
                            getResponseMessage(
                                response,
                                'Unable to load booking details.'
                            )
                        );
                    }
                } catch (error) {
                    console.error(
                        'Error processing booking response:',
                        error
                    );

                    toast.error(
                        'Unable to process booking details.'
                    );
                } finally {
                    setFetchingData(false);
                }
            }
        );
    };

    // =========================================================
    // File Upload
    // =========================================================

    const handleGalleryChange = event => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        if (selectedFiles.length === 0) {
            return;
        }

        const validFiles = selectedFiles.filter(file =>
            [
                'image/jpeg',
                'image/png',
                'image/jpg'
            ].includes(file.type)
        );

        if (
            validFiles.length !==
            selectedFiles.length
        ) {
            toast.error(
                'Invalid file. Only .jpg, .jpeg, .png allowed.'
            );

            event.target.value = '';
            return;
        }

        // =====================================================
        // Add Files
        // =====================================================

        setPaymentProof(prevFiles => [
            ...prevFiles,
            ...validFiles
        ]);

        // =====================================================
        // Create Preview URLs
        // =====================================================

        const newPreviewUrls =
            validFiles.map(file =>
                URL.createObjectURL(file)
            );

        setPaymentProofPreviews(
            prevPreviews => [
                ...prevPreviews,
                ...newPreviewUrls
            ]
        );

        // Allows selecting same file again
        event.target.value = '';

        // Clear validation error
        setErrors(prevErrors => ({
            ...prevErrors,
            paymentProof: ''
        }));
    };

    // =========================================================
    // Remove New Payment Proof
    // =========================================================

    const handleRemoveGalleryImage = index => {
        setPaymentProof(prevFiles =>
            prevFiles.filter(
                (_, i) => i !== index
            )
        );

        setPaymentProofPreviews(prevPreviews => {
            const previewToRemove =
                prevPreviews[index];

            if (previewToRemove) {
                URL.revokeObjectURL(
                    previewToRemove
                );
            }

            return prevPreviews.filter(
                (_, i) => i !== index
            );
        });
    };

    // =========================================================
    // Remove Existing Payment Proof
    // =========================================================

    const handleRemoveExistingProof = index => {
        setExistingPaymentProof(prevFiles =>
            prevFiles.filter(
                (_, i) => i !== index
            )
        );
    };

    // =========================================================
    // Validation
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        // =====================================================
        // Customer Details
        // =====================================================

        if (!customerName.trim()) {
            newErrors.customerName =
                'Customer Name is required.';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber =
                'Phone Number is required.';
        } else if (
            !/^[0-9]{10}$/.test(phoneNumber)
        ) {
            newErrors.phoneNumber =
                'Please enter a valid 10 digit phone number.';
        }

        if (!emailId.trim()) {
            newErrors.emailId =
                'Email ID is required.';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                emailId
            )
        ) {
            newErrors.emailId =
                'Please enter a valid email ID.';
        }

        if (!locationLink.trim()) {
            newErrors.locationLink =
                'Location Link is required.';
        }

        if (!address.trim()) {
            newErrors.address =
                'Address is required.';
        }

        if (!price.trim()) {
            newErrors.price =
                'Price including GST is required.';
        }

        // =====================================================
        // Vehicle Details
        // =====================================================

        if (!vehicleMake.trim()) {
            newErrors.vehicleMake =
                'Vehicle Make is required.';
        }

        if (!vehicleModel.trim()) {
            newErrors.vehicleModel =
                'Vehicle Model is required.';
        }

        if (!batteryLevel) {
            newErrors.batteryLevel =
                'Battery Level is required.';
        }

        if (!jumpStartRequired) {
            newErrors.jumpStartRequired =
                'Jump Start Required is required.';
        }

        // =====================================================
        // Payment Details
        // =====================================================

        if (!paymentMode) {
            newErrors.paymentMode =
                'Mode of Payment is required.';
        }

        if (
            paymentProof.length === 0 &&
            existingPaymentProof.length === 0
        ) {
            newErrors.paymentProof =
                'Payment Proof is required.';
        }

        // =====================================================
        // Booking Details
        // =====================================================

        if (!bookingStatus) {
            newErrors.bookingStatus =
                'Booking Status is required.';
        }

        if (
            bookingStatus?.value === 'completed' &&
            !bookingCompletedBy.trim()
        ) {
            newErrors.bookingCompletedBy =
                'Booking Completed By is required.';
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    // =========================================================
    // Submit / Update
    // =========================================================

    const handleSubmit = e => {
        e.preventDefault();

        if (loading) {
            return;
        }

        const isValid = validateForm();

        if (!isValid) {
            toast.error(
                'Some fields are missing.'
            );
            return;
        }

        const userDetails = getUserDetails();

        if (!userDetails) {
            toast.error(
                'User session expired. Please login again.'
            );

            navigate('/login');
            return;
        }

        setLoading(true);

        const formData = new FormData();

        // =====================================================
        // Common
        // =====================================================

        formData.append(
            'userId',
            userDetails?.user_id || ''
        );

        formData.append(
            'email',
            userDetails?.email || ''
        );

        formData.append(
            'id',
            id || ''
        );

        // =====================================================
        // Customer Details
        // =====================================================

        formData.append(
            'customer_name',
            customerName.trim()
        );

        formData.append(
            'phone_number',
            phoneNumber.trim()
        );

        formData.append(
            'email_id',
            emailId.trim()
        );

        formData.append(
            'location_link',
            locationLink.trim()
        );

        formData.append(
            'address',
            address.trim()
        );

        formData.append(
            'price',
            price.trim()
        );

        // =====================================================
        // Vehicle Details
        // =====================================================

        formData.append(
            'vehicle_make',
            vehicleMake.trim()
        );

        formData.append(
            'vehicle_model',
            vehicleModel.trim()
        );

        formData.append(
            'battery_level',
            batteryLevel?.value || ''
        );

        formData.append(
            'jump_start_required',
            jumpStartRequired?.value || ''
        );

        // =====================================================
        // Payment Details
        // =====================================================

        formData.append(
            'payment_mode',
            paymentMode?.value || ''
        );

        // =====================================================
        // New Payment Proof Files
        // =====================================================

        paymentProof.forEach(file => {
            formData.append(
                'payment_proof[]',
                file
            );
        });

        // =====================================================
        // Existing Payment Proof
        // =====================================================

        /*
         * This contains only the existing files that
         * the user has NOT removed.
         */

        formData.append(
            'existing_payment_proof',
            JSON.stringify(
                existingPaymentProof
            )
        );

        // =====================================================
        // Booking Details
        // =====================================================

        formData.append(
            'booking_status',
            bookingStatus?.value || ''
        );

        formData.append(
            'booking_completed_by',
            bookingCompletedBy.trim()
        );

        // =====================================================
        // Debug FormData
        // =====================================================

        console.log(
            'Updating offline lead ID:',
            id
        );

        for (const [
            key,
            value
        ] of formData.entries()) {
            console.log(
                key,
                value
            );
        }

        // =====================================================
        // Update API
        // =====================================================

        postRequestWithToken(
            `update-ev-road-assistance-offline-lead/${id}`,
            formData,
            response => {
                console.log(
                    'Update offline booking response:',
                    response
                );

                if (
                    response?.code === 200 ||
                    response?.status === 1
                ) {
                    toast.success(
                        getResponseMessage(
                            response,
                            'Booking updated successfully.'
                        )
                    );

                    setTimeout(() => {
                        setLoading(false);

                        navigate(
                            '/electric/ev-road-assistance/rsa-offline-leads'
                        );
                    }, 1000);
                } else {
                    toast.error(
                        getResponseMessage(
                            response,
                            'Something went wrong while updating booking.'
                        )
                    );

                    setLoading(false);
                }
            }
        );
    };

    // =========================================================
    // Authentication + Fetch
    // =========================================================

    useEffect(() => {
        const userDetails =
            getUserDetails();

        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate('/login');
            return;
        }

        if (!id) {
            toast.error(
                'Booking ID is missing.'
            );

            navigate(
                '/electric/ev-road-assistance/rsa-offline-leads'
            );

            return;
        }

        getBookingDetails();
    }, [id, navigate]);

    // =========================================================
    // Cleanup Preview URLs
    // =========================================================

    useEffect(() => {
        return () => {
            paymentProofPreviews.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [paymentProofPreviews]);

    // =========================================================
    // Cancel
    // =========================================================

    const handleCancel = () => {
        if (loading) {
            return;
        }

        navigate(
            '/electric/ev-road-assistance/rsa-offline-leads'
        );
    };

    // =========================================================
    // Loading Screen
    // =========================================================

    if (fetchingData) {
        return (
            <div
                className={
                    styles.addStationContainer
                }
            >
                <ToastContainer />

                <div
                    className={
                        styles.addHeading
                    }
                >
                    Edit EV Road Assistance Offline
                    Booking
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '300px'
                    }}
                >
                    <div
                        className="spinner-border"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className={
                styles.addStationContainer
            }
        >
            <ToastContainer />

            <div
                className={
                    styles.addHeading
                }
            >
                Edit EV Road Assistance Offline
                Booking
            </div>

            <div
                className={
                    styles.addStationFormSection
                }
            >
                <form
                    className={
                        styles.formSection
                    }
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        CUSTOMER DETAILS
                    ================================================= */}

                    

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Customer Details

                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Customer Name */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Customer Name
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Customer Name"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            customerName
                                        }
                                        onChange={e =>
                                            setCustomerName(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.customerName && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.customerName
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Phone Number */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Phone Number
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Phone Number"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            phoneNumber
                                        }
                                        maxLength={10}
                                        onChange={e => {
                                            const value =
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ''
                                                );

                                            setPhoneNumber(
                                                value
                                            );
                                        }}
                                    />

                                    {errors.phoneNumber && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.phoneNumber
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        {/* Email */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Email ID
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="email"
                                        autoComplete="off"
                                        placeholder="Email ID"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            emailId
                                        }
                                        onChange={e =>
                                            setEmailId(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.emailId && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.emailId
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Location */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Location Link
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="url"
                                        autoComplete="off"
                                        placeholder="Google Maps Location Link"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            locationLink
                                        }
                                        onChange={e =>
                                            setLocationLink(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.locationLink && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.locationLink
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        {/* Address */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Address
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <textarea
                                        rows="3"
                                        placeholder="Address"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            address
                                        }
                                        onChange={e =>
                                            setAddress(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.address && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.address
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Price */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Price Including GST
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Price Including GST"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            price
                                        }
                                        onChange={e => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d{0,10}(\.\d{0,2})?$/.test(
                                                    value
                                                )
                                            ) {
                                                setPrice(
                                                    value
                                                );
                                            }
                                        }}
                                    />

                                    {errors.price && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.price
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                    {/* =================================================
                        VEHICLE DETAILS
                    ================================================= */}

                    

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Vehicle Details

                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Vehicle Make */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Vehicle Make
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Vehicle Make"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            vehicleMake
                                        }
                                        onChange={e =>
                                            setVehicleMake(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.vehicleMake && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.vehicleMake
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Vehicle Model */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Vehicle Model
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Vehicle Model"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            vehicleModel
                                        }
                                        onChange={e =>
                                            setVehicleModel(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.vehicleModel && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.vehicleModel
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="row">

                        {/* Battery Level */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Battery Level
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <CustomDropdown
                                        options={
                                            batteryLevelOptions
                                        }
                                        value={
                                            batteryLevel
                                        }
                                        onChange={
                                            selectedOption => {
                                                setBatteryLevel(
                                                    selectedOption
                                                );

                                                setErrors(
                                                    prev => ({
                                                        ...prev,
                                                        batteryLevel:
                                                            ''
                                                    })
                                                );
                                            }
                                        }
                                        labelledBy="Select Battery Level"
                                        closeOnChangedValue
                                        closeOnSelect
                                    />

                                    {errors.batteryLevel && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.batteryLevel
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Jump Start */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Jump Start Required
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <CustomDropdown
                                        options={
                                            jumpStartOptions
                                        }
                                        value={
                                            jumpStartRequired
                                        }
                                        onChange={
                                            selectedOption => {
                                                setJumpStartRequired(
                                                    selectedOption
                                                );

                                                setErrors(
                                                    prev => ({
                                                        ...prev,
                                                        jumpStartRequired:
                                                            ''
                                                    })
                                                );
                                            }
                                        }
                                        labelledBy="Select Option"
                                        closeOnChangedValue
                                        closeOnSelect
                                    />

                                    {errors.jumpStartRequired && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.jumpStartRequired
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                    {/* =================================================
                        PAYMENT DETAILS
                    ================================================= */}

                    

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Payment Details

                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Payment Mode */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Mode of Payment
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <CustomDropdown
                                        options={
                                            paymentModeOptions
                                        }
                                        value={
                                            paymentMode
                                        }
                                        onChange={
                                            selectedOption => {
                                                setPaymentMode(
                                                    selectedOption
                                                );

                                                setErrors(
                                                    prev => ({
                                                        ...prev,
                                                        paymentMode:
                                                            ''
                                                    })
                                                );
                                            }
                                        }
                                        labelledBy="Select Payment Mode"
                                        closeOnChangedValue
                                        closeOnSelect
                                    />

                                    {errors.paymentMode && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.paymentMode
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Payment Proof */}

                        <div className="col-lg-6">

                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Payment Proof
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <div
                                        className={
                                            styles.uploadContainer
                                        }
                                    >

                                        <span
                                            className={
                                                styles.uploadLabel
                                            }
                                        >
                                            {paymentProof.length >
                                                0
                                                ? paymentProof.length >
                                                    2
                                                    ? `${paymentProof[0].name}, ${paymentProof[1].name}... (${paymentProof.length - 2} more)`
                                                    : paymentProof
                                                        .map(
                                                            file =>
                                                                file.name
                                                        )
                                                        .join(
                                                            ', '
                                                        )
                                                : 'Upload Payment Proof'}
                                        </span>

                                        <label
                                            htmlFor="galleryImage"
                                            className={
                                                styles.uploadButton
                                            }
                                        >
                                            <MdOutlineCloudUpload />
                                            Upload
                                        </label>

                                        <input
                                            type="file"
                                            multiple
                                            id="galleryImage"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={
                                                handleGalleryChange
                                            }
                                            className={
                                                styles.hiddenInput
                                            }
                                        />

                                    </div>

                                    {errors.paymentProof &&
                                        paymentProof.length ===
                                        0 &&
                                        existingPaymentProof.length ===
                                        0 && (
                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.paymentProof
                                                }
                                            </p>
                                        )}

                                </div>
                            </div>

                            {/* =================================================
                                Existing Payment Proof
                            ================================================= */}

                            {existingPaymentProof.length >
                                0 && (
                                    <div className="row mt-2">

                                        <div className="col-xl-10 col-lg-12">

                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom:
                                                        '10px'
                                                }}
                                            >
                                                Existing Payment
                                                Proof
                                            </div>

                                            <div
                                                className={
                                                    styles.galleryContainer
                                                }
                                            >

                                                {existingPaymentProof.map(
                                                    (
                                                        file,
                                                        index
                                                    ) => {
                                                        const imageUrl =
                                                            getExistingImageUrl(
                                                                file
                                                            );

                                                        return (
                                                            <div
                                                                className={
                                                                    styles.imageContainer
                                                                }
                                                                key={
                                                                    file?.id ||
                                                                    index
                                                                }
                                                            >

                                                                {imageUrl ? (
                                                                    <img
                                                                        src={
                                                                            imageUrl
                                                                        }
                                                                        alt={`Existing Payment Proof ${index +
                                                                            1
                                                                            }`}
                                                                        className={
                                                                            styles.previewImage
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        style={{
                                                                            width:
                                                                                '100%',
                                                                            height:
                                                                                '100px',
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            justifyContent:
                                                                                'center',
                                                                            background:
                                                                                '#f5f5f5',
                                                                            color:
                                                                                '#777'
                                                                        }}
                                                                    >
                                                                        Image
                                                                        not
                                                                        available
                                                                    </div>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        styles.removeButton
                                                                    }
                                                                    onClick={() =>
                                                                        handleRemoveExistingProof(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <AiOutlineClose
                                                                        size={
                                                                            20
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                '2px'
                                                                        }}
                                                                    />
                                                                </button>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>
                                    </div>
                                )}

                            {/* =================================================
                                Newly Selected Payment Proof
                            ================================================= */}

                            {paymentProof.length >
                                0 && (
                                    <div className="row mt-2">

                                        <div className="col-xl-10 col-lg-12">

                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom:
                                                        '10px'
                                                }}
                                            >
                                                New Payment
                                                Proof
                                            </div>

                                            <div
                                                className={
                                                    styles.galleryContainer
                                                }
                                            >

                                                {paymentProof.map(
                                                    (
                                                        file,
                                                        index
                                                    ) => (
                                                        <div
                                                            className={
                                                                styles.imageContainer
                                                            }
                                                            key={`${file.name}-${file.lastModified}-${index}`}
                                                        >

                                                            <img
                                                                src={
                                                                    paymentProofPreviews[
                                                                    index
                                                                    ]
                                                                }
                                                                alt={`Preview ${index +
                                                                    1
                                                                    }`}
                                                                className={
                                                                    styles.previewImage
                                                                }
                                                            />

                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.removeButton
                                                                }
                                                                onClick={() =>
                                                                    handleRemoveGalleryImage(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <AiOutlineClose
                                                                    size={
                                                                        20
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            '2px'
                                                                    }}
                                                                />
                                                            </button>

                                                        </div>
                                                    )
                                                )}

                                            </div>

                                        </div>
                                    </div>
                                )}

                        </div>

                    </div>

                    {/* =================================================
                        BOOKING DETAILS
                    ================================================= */}

                    

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Booking Details

                            </label>
                        </div>
                    </div>

                    <div className="row">

                        {/* Booking Status */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Booking Status
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <CustomDropdown
                                        options={
                                            bookingStatusOptions
                                        }
                                        value={
                                            bookingStatus
                                        }
                                        onChange={
                                            selectedOption => {
                                                setBookingStatus(
                                                    selectedOption
                                                );

                                                setErrors(
                                                    prev => ({
                                                        ...prev,
                                                        bookingStatus:
                                                            '',
                                                        bookingCompletedBy:
                                                            ''
                                                    })
                                                );

                                                if (
                                                    selectedOption?.value !==
                                                    'completed'
                                                ) {
                                                    setBookingCompletedBy(
                                                        ''
                                                    );
                                                }
                                            }
                                        }
                                        labelledBy="Select Booking Status"
                                        closeOnChangedValue
                                        closeOnSelect
                                    />

                                    {errors.bookingStatus && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.bookingStatus
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* Completed By */}

                        <div className="col-lg-6">
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Booking Completed By
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Booking Completed By"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            bookingCompletedBy
                                        }
                                        onChange={e => {
                                            setBookingCompletedBy(
                                                e.target.value
                                            );

                                            setErrors(
                                                prev => ({
                                                    ...prev,
                                                    bookingCompletedBy:
                                                        ''
                                                })
                                            );
                                        }}
                                        disabled={
                                            bookingStatus?.value !==
                                            'completed'
                                        }
                                    />

                                    {errors.bookingCompletedBy && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.bookingCompletedBy
                                            }
                                        </p>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>

                    {/* =================================================
                        BUTTONS
                    ================================================= */}

                    <div className="row">

                        <div className="col-xl-11 col-lg-12">

                            <div className="row">

                                <div
                                    className={`col-lg-12 ${styles.editButton}`}
                                >

                                    <button
                                        type="button"
                                        className={
                                            styles.editCancelBtn
                                        }
                                        onClick={
                                            handleCancel
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={
                                            loading
                                        }
                                        type="submit"
                                        className={
                                            styles.editSubmitBtn
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>

                                                Updating...
                                            </>
                                        ) : (
                                            'Update'
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

export default EditOfflineleads;