import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AddOfflineleads.module.css';
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';

const EditOfflineleads = () => {
    const navigate = useNavigate();
    const { id } = useParams();

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

    const userDetails = getUserDetails();

    // =========================================================
    // Common State
    // =========================================================

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

    // IMPORTANT:
    // These values are dropdown objects, NOT strings.
    //
    // Example:
    // {
    //     value: 'Tata',
    //     label: 'Tata'
    // }

    const [vehicleMake, setVehicleMake] = useState(null);
    const [vehicleModel, setVehicleModel] = useState(null);

    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStartRequired, setJumpStartRequired] =
        useState(null);

    // =========================================================
    // Vehicle / RSA Lists
    // =========================================================

    const [rsaList, setRsaList] = useState([]);

    const [vehicleList, setVehicleList] = useState([]);
    const [vehicleMakeList, setVehicleMakeList] = useState([]);
    const [vehicleModelList, setVehicleModelList] = useState([]);

    // =========================================================
    // Payment Details
    // =========================================================

    const [paymentProof, setPaymentProof] = useState([]);
    const [paymentProofPreviews, setPaymentProofPreviews] =
        useState([]);

    const [existingPaymentProof, setExistingPaymentProof] =
        useState([]);

    const [paymentMode, setPaymentMode] = useState(null);

    // =========================================================
    // Booking Details
    // =========================================================

    const [bookingStatus, setBookingStatus] = useState(null);

    // IMPORTANT:
    // This must be an option object.
    //
    // Example:
    // {
    //     value: 'AJAY',
    //     label: 'AJAY',
    //     id: '123'
    // }

    const [bookingCompletedBy, setBookingCompletedBy] =
        useState(null);

    const [bookingCompletedById, setBookingCompletedById] =
        useState(null);

    // =========================================================
    // Temporary API Values
    // =========================================================

    // Used because booking API and vehicle API can finish
    // in different orders.

    const [bookingVehicleData, setBookingVehicleData] =
        useState('');

    const [bookingCompletedByName, setBookingCompletedByName] =
        useState('');

    // =========================================================
    // Dropdown Options
    // =========================================================

    const batteryLevelOptions = [
        {
            value: '0%',
            label: '0%',
        },
        {
            value: 'More than 5%',
            label: 'More than 5%',
        },
    ];

    const jumpStartOptions = [
        {
            value: 'No',
            label: 'No',
        },
        {
            value: 'Yes',
            label: 'Yes',
        },
    ];

    const paymentModeOptions = [
        {
            value: 'Cash',
            label: 'Cash',
        },
        {
            value: 'Online',
            label: 'Online',
        },
    ];

    const bookingStatusOptions = [
        {
            value: 'Confirmed',
            label: 'Confirmed',
        },
        {
            value: 'Completed',
            label: 'Completed',
        },
    ];

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
    // Response Message Helper
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
    // Clear Field Error
    // =========================================================

    const clearFieldError = field => {
        setErrors(prev => {
            if (!prev[field]) {
                return prev;
            }

            const updatedErrors = {
                ...prev,
            };

            delete updatedErrors[field];

            return updatedErrors;
        });
    };

    // =========================================================
    // Fetch Booking Details
    // =========================================================

    const getBookingDetails = () => {
        setFetchingData(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            request_id: id,
        };

        postRequestWithToken(
            'ev-road-assistance-offline-booking-details',
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


                        // =================================================
                        // Customer Details
                        // =================================================

                        setCustomerName(
                            booking?.name || ''
                        );

                        setEmailId(
                            booking?.email || ''
                        );

                        setPhoneNumber(
                            booking?.contact_no ||
                            booking?.mobile_no ||
                            ''
                        );

                        setLocationLink(
                            booking?.location_link || ''
                        );

                        setAddress(
                            booking?.pickup_address || ''
                        );

                        setPrice(
                            booking?.price !== null &&
                                booking?.price !== undefined
                                ? String(booking.price)
                                : ''
                        );

                        setBookingVehicleData(
                            booking?.vehicle_data || ''
                        );
                        const batteryValue =
                            Number(
                                booking?.battery_level || 0
                            ) > 0
                                ? 'More than 5%'
                                : '0%';

                        setBatteryLevel(
                            getDropdownValue(
                                batteryLevelOptions,
                                batteryValue
                            )
                        );
                        setJumpStartRequired(
                            getDropdownValue(
                                jumpStartOptions,
                                booking?.jump_start_required
                            )
                        );

                        setPaymentMode(
                            getDropdownValue(
                                paymentModeOptions,
                                booking?.mode_of_payment
                            )
                        );
                        if (
                            booking?.proof_of_transaction_url
                        ) {
                            setExistingPaymentProof([
                                {
                                    url:
                                        booking.proof_of_transaction_url,
                                    name:
                                        booking.proof_of_transaction ||
                                        'Payment Proof',
                                },
                            ]);
                        } else if (
                            booking?.proof_of_transaction
                        ) {
                            setExistingPaymentProof([
                                {
                                    url:
                                        booking.proof_of_transaction,
                                    name:
                                        'Payment Proof',
                                },
                            ]);
                        } else {
                            setExistingPaymentProof([]);
                        }

                        const orderStatus =
                            String(
                                booking?.order_status || ''
                            )
                                .trim()
                                .toUpperCase();

                        let mappedBookingStatus = '';

                        if (
                            orderStatus === 'CNF' ||
                            orderStatus === 'A' ||
                            orderStatus === 'ASSIGNED'
                        ) {
                            mappedBookingStatus =
                                'Confirmed';
                        } else if (
                            orderStatus === 'PU' ||
                            orderStatus === 'C' ||
                            orderStatus === 'COM' ||
                            orderStatus === 'CMP' ||
                            orderStatus === 'COMPLETED'
                        ) {
                            mappedBookingStatus =
                                'Completed';
                        }

                        setBookingStatus(
                            getDropdownValue(
                                bookingStatusOptions,
                                mappedBookingStatus
                            )
                        );
                        setBookingCompletedByName(
                            booking?.driver_name || ''
                        );

                        setBookingCompletedById(
                            booking?.rsa_id || null
                        );

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
    // Fetch RSA Driver List
    // =========================================================

    const getDriverList = () => {
        try {
            const rsaObj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                service_type:
                    'EV Roadside Assistance',
            };

            postRequestWithToken(
                'all-rsa-list',
                rsaObj,
                response => {
                    console.log(
                        'RSA list response:',
                        response
                    );

                    if (
                        response?.code === 200 ||
                        response?.status === 1
                    ) {
                        const drivers =
                            (
                                response?.data || []
                            ).map(item => ({
                                value:
                                    item?.rsa_name ||
                                    '',
                                label:
                                    item?.rsa_name ||
                                    '',
                                id:
                                    item?.rsa_id ||
                                    '',
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
        } catch (error) {
            console.error(
                'Error in getDriverList:',
                error
            );
        }
    };

    // =========================================================
    // Fetch Vehicle List
    // =========================================================

    const getVehicleList = () => {
        try {
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
            };

            postRequestWithToken(
                'ev-road-assistance-offline-vehicle-list',
                obj,
                response => {
                    console.log(
                        'Vehicle list response:',
                        response
                    );

                    if (
                        response?.code === 200 ||
                        response?.status === 1
                    ) {
                        const vehicles =
                            response?.data || [];

                        setVehicleList(
                            vehicles
                        );

                        const makeOptions =
                            vehicles.map(
                                vehicle => ({
                                    value:
                                        vehicle?.value,
                                    label:
                                        vehicle?.label,
                                })
                            );

                        setVehicleMakeList(
                            makeOptions
                        );
                    } else {
                        console.log(
                            'Error in vehicle list API:',
                            response
                        );
                    }
                }
            );
        } catch (error) {
            console.error(
                'Error in getVehicleList:',
                error
            );
        }
    };

    // =========================================================
    // Set Initial Vehicle Make + Model
    // =========================================================

    useEffect(() => {
        if (
            !bookingVehicleData ||
            vehicleList.length === 0
        ) {
            return;
        }

        console.log(
            'Setting initial vehicle:',
            bookingVehicleData
        );

        const vehicleParts =
            String(bookingVehicleData)
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);

        const makeName =
            vehicleParts[0] || '';

        const modelName =
            vehicleParts
                .slice(1)
                .join(', ') || '';

        // =====================================================
        // Find Make
        // =====================================================

        const selectedVehicle =
            vehicleList.find(
                vehicle =>
                    String(
                        vehicle?.value
                    ).toLowerCase() ===
                    String(
                        makeName
                    ).toLowerCase()
            );

        if (!selectedVehicle) {
            console.log(
                'Vehicle make not found:',
                makeName
            );

            setVehicleMake(null);
            setVehicleModel(null);
            setVehicleModelList([]);

            return;
        }

        const makeOption = {
            value:
                selectedVehicle.value,
            label:
                selectedVehicle.label,
        };

        setVehicleMake(
            makeOption
        );

        // =====================================================
        // Models
        // =====================================================

        const modelOptions =
            (
                selectedVehicle.models ||
                []
            ).map(model => ({
                value:
                    model?.value,
                label:
                    model?.label,
            }));

        setVehicleModelList(
            modelOptions
        );

        // =====================================================
        // Find Model
        // =====================================================

        const selectedModel =
            modelOptions.find(
                model =>
                    String(
                        model?.value
                    ).toLowerCase() ===
                    String(
                        modelName
                    ).toLowerCase()
            );

        setVehicleModel(
            selectedModel || null
        );

        console.log(
            'Initial vehicle make:',
            makeOption
        );

        console.log(
            'Initial vehicle model:',
            selectedModel
        );

    }, [
        bookingVehicleData,
        vehicleList,
    ]);

    // =========================================================
    // Set Initial Booking Completed By
    // =========================================================

    useEffect(() => {
        if (
            !bookingCompletedByName ||
            rsaList.length === 0
        ) {
            return;
        }

        console.log(
            'Setting initial driver:',
            bookingCompletedByName
        );

        // First try by RSA ID
        let selectedDriver =
            bookingCompletedById
                ? rsaList.find(
                    driver =>
                        String(
                            driver?.id
                        ) ===
                        String(
                            bookingCompletedById
                        )
                )
                : null;

        // If not found, try by driver name
        if (!selectedDriver) {
            selectedDriver =
                rsaList.find(
                    driver =>
                        String(
                            driver?.value
                        ).toLowerCase() ===
                        String(
                            bookingCompletedByName
                        ).toLowerCase()
                );
        }

        if (selectedDriver) {
            setBookingCompletedBy(
                selectedDriver
            );

            setBookingCompletedById(
                selectedDriver.id
            );

            console.log(
                'Initial driver selected:',
                selectedDriver
            );
        } else {
            console.log(
                'Driver not found:',
                bookingCompletedByName,
                bookingCompletedById
            );

            setBookingCompletedBy(null);
        }

    }, [
        bookingCompletedByName,
        bookingCompletedById,
        rsaList,
    ]);

    // =========================================================
    // Vehicle Make Change
    // =========================================================

    const handleVehicleMakeChange =
        selectedMake => {
            setVehicleMake(
                selectedMake
            );

            setVehicleModel(
                null
            );

            clearFieldError(
                'vehicleMake'
            );

            clearFieldError(
                'vehicleModel'
            );

            if (!selectedMake) {
                setVehicleModelList(
                    []
                );

                return;
            }

            const selectedVehicle =
                vehicleList.find(
                    vehicle =>
                        String(
                            vehicle?.value
                        ) ===
                        String(
                            selectedMake?.value
                        )
                );

            if (
                selectedVehicle?.models
            ) {
                const modelOptions =
                    selectedVehicle.models.map(
                        model => ({
                            value:
                                model?.value,
                            label:
                                model?.label,
                        })
                    );

                setVehicleModelList(
                    modelOptions
                );
            } else {
                setVehicleModelList(
                    []
                );
            }
        };

    // =========================================================
    // File Upload
    // =========================================================

    const handleGalleryChange =
        event => {
            const selectedFiles =
                Array.from(
                    event.target.files ||
                    []
                );

            if (
                selectedFiles.length ===
                0
            ) {
                return;
            }

            const validFiles =
                selectedFiles.filter(
                    file =>
                        [
                            'image/jpeg',
                            'image/png',
                            'image/jpg',
                        ].includes(
                            file.type
                        )
                );

            if (
                validFiles.length !==
                selectedFiles.length
            ) {
                toast.error(
                    'Invalid file. Only .jpg, .jpeg, .png allowed.'
                );

                event.target.value =
                    '';

                return;
            }

            setPaymentProof(
                prevFiles => [
                    ...prevFiles,
                    ...validFiles,
                ]
            );

            const newPreviewUrls =
                validFiles.map(
                    file =>
                        URL.createObjectURL(
                            file
                        )
                );

            setPaymentProofPreviews(
                prevPreviews => [
                    ...prevPreviews,
                    ...newPreviewUrls,
                ]
            );

            event.target.value =
                '';

            clearFieldError(
                'paymentProof'
            );
        };

    // =========================================================
    // Remove New Payment Proof
    // =========================================================

    const handleRemoveGalleryImage =
        index => {
            setPaymentProof(
                prevFiles =>
                    prevFiles.filter(
                        (_, i) =>
                            i !== index
                    )
            );

            setPaymentProofPreviews(
                prevPreviews => {
                    const previewToRemove =
                        prevPreviews[
                        index
                        ];

                    if (
                        previewToRemove
                    ) {
                        URL.revokeObjectURL(
                            previewToRemove
                        );
                    }

                    return prevPreviews.filter(
                        (_, i) =>
                            i !== index
                    );
                }
            );
        };

    // =========================================================
    // Remove Existing Payment Proof
    // =========================================================

    const handleRemoveExistingProof =
        index => {
            setExistingPaymentProof(
                prevFiles =>
                    prevFiles.filter(
                        (_, i) =>
                            i !== index
                    )
            );
        };

    // =========================================================
    // Existing Image URL
    // =========================================================

    const getExistingImageUrl =
        file => {
            if (!file) {
                return '';
            }

            if (
                typeof file ===
                'string'
            ) {
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
    // Validation
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        if (
            !customerName.trim()
        ) {
            newErrors.customerName =
                'Customer Name is required.';
        }

        if (
            !phoneNumber.trim()
        ) {
            newErrors.phoneNumber =
                'Phone Number is required.';
        } else if (
            !/^[0-9]{10}$/.test(
                phoneNumber
            )
        ) {
            newErrors.phoneNumber =
                'Please enter a valid 10 digit phone number.';
        }

        if (
            !emailId.trim()
        ) {
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

        if (
            !locationLink.trim()
        ) {
            newErrors.locationLink =
                'Location Link is required.';
        } else {
            try {
                new URL(
                    locationLink
                );
            } catch {
                newErrors.locationLink =
                    'Please enter a valid location URL.';
            }
        }

        if (
            !address.trim()
        ) {
            newErrors.address =
                'Address is required.';
        }

        if (
            !price.trim()
        ) {
            newErrors.price =
                'Price including GST is required.';
        } else if (
            Number(price) <= 0
        ) {
            newErrors.price =
                'Price must be greater than 0.';
        }

        if (
            !vehicleMake
        ) {
            newErrors.vehicleMake =
                'Vehicle Make is required.';
        }

        if (
            !vehicleModel
        ) {
            newErrors.vehicleModel =
                'Vehicle Model is required.';
        }

        if (
            !batteryLevel
        ) {
            newErrors.batteryLevel =
                'Battery Level is required.';
        }

        if (
            !jumpStartRequired
        ) {
            newErrors.jumpStartRequired =
                'Jump Start Required is required.';
        }

        if (
            !paymentMode
        ) {
            newErrors.paymentMode =
                'Mode of Payment is required.';
        }

        // Payment proof required for Online
        //
        // Existing proof also satisfies requirement.
        if (
            paymentMode?.value ===
            'Online' &&
            paymentProof.length === 0 &&
            existingPaymentProof.length === 0
        ) {
            newErrors.paymentProof =
                'Payment Proof is required.';
        }

        if (
            !bookingStatus
        ) {
            newErrors.bookingStatus =
                'Booking Status is required.';
        }

        if (
            !bookingCompletedBy
        ) {
            newErrors.bookingCompletedBy =
                'Booking Completed By is required.';
        }

        setErrors(
            newErrors
        );

        return (
            Object.keys(
                newErrors
            ).length === 0
        );
    };

    // =========================================================
    // Submit
    // =========================================================

    const handleSubmit = e => {
        e.preventDefault();

        if (loading) {
            return;
        }

        const isValid =
            validateForm();

        if (!isValid) {
            toast.error(
                'Some fields are missing.'
            );

            return;
        }

        const currentUserDetails =
            getUserDetails();

        if (
            !currentUserDetails
        ) {
            toast.error(
                'User session expired. Please login again.'
            );

            navigate(
                '/login'
            );

            return;
        }

        setLoading(true);

        const formData =
            new FormData();

        // =====================================================
        // Common
        // =====================================================

        formData.append(
            'userId',
            currentUserDetails?.user_id ||
            ''
        );

        formData.append(
            'email',
            currentUserDetails?.email ||
            ''
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

        // IMPORTANT:
        // vehicleMake is an object.
        // vehicleModel is an object.

        formData.append(
            'vehicle_make',
            vehicleMake?.value ||
            ''
        );

        formData.append(
            'vehicle_model',
            vehicleModel?.value ||
            ''
        );

        formData.append(
            'battery_level',
            batteryLevel?.value ||
            ''
        );

        formData.append(
            'jump_start_required',
            jumpStartRequired?.value ||
            ''
        );

        // =====================================================
        // Payment Details
        // =====================================================

        formData.append(
            'payment_mode',
            paymentMode?.value ||
            ''
        );

        // =====================================================
        // New Payment Proof
        // =====================================================

        paymentProof.forEach(
            file => {
                formData.append(
                    'payment_proof[]',
                    file
                );
            }
        );

        // =====================================================
        // Existing Payment Proof
        // =====================================================

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
            bookingStatus?.value ||
            ''
        );

        // Driver name
        formData.append(
            'booking_completed_by',
            bookingCompletedBy?.value ||
            ''
        );

        // IMPORTANT:
        // Send RSA ID too.
        formData.append(
            'rsa_id',
            bookingCompletedBy?.id ||
            ''
        );

        // =====================================================
        // Debug
        // =====================================================

        console.log(
            'Updating offline lead ID:',
            id
        );

        console.log(
            'Vehicle Make:',
            vehicleMake
        );

        console.log(
            'Vehicle Model:',
            vehicleModel
        );

        console.log(
            'Booking Completed By:',
            bookingCompletedBy
        );

        console.log(
            'RSA ID:',
            bookingCompletedBy?.id
        );

        for (
            const [
                key,
                value,
            ] of formData.entries()
        ) {
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
                    response?.code ===
                    200 ||
                    response?.status ===
                    1
                ) {
                    toast.success(
                        getResponseMessage(
                            response,
                            'Booking updated successfully.'
                        )
                    );

                    setTimeout(
                        () => {
                            setLoading(
                                false
                            );

                            navigate(
                                '/electric/ev-road-assistance/rsa-offline-leads'
                            );
                        },
                        1000
                    );
                } else {
                    toast.error(
                        getResponseMessage(
                            response,
                            'Something went wrong while updating booking.'
                        )
                    );

                    setLoading(
                        false
                    );
                }
            }
        );
    };

    // =========================================================
    // Authentication + Initial API Calls
    // =========================================================

    useEffect(() => {
        const currentUserDetails =
            getUserDetails();

        if (
            !currentUserDetails ||
            !currentUserDetails.access_token
        ) {
            navigate(
                '/login'
            );

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
        getDriverList();
        getVehicleList();

    }, [
        id,
        navigate,
    ]);

    // =========================================================
    // Cleanup Preview URLs
    // =========================================================

    useEffect(() => {
        return () => {
            paymentProofPreviews.forEach(
                url => {
                    URL.revokeObjectURL(
                        url
                    );
                }
            );
        };
    }, [
        paymentProofPreviews,
    ]);

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
                    Edit EV Road Assistance
                    Offline Booking
                </div>

                <div
                    style={{
                        display:
                            'flex',
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                        minHeight:
                            '300px',
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
                Edit EV Road Assistance
                Offline Booking
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
                    onSubmit={
                        handleSubmit
                    }
                >

                    {/* =================================================
                        CUSTOMER DETAILS
                    ================================================= */}

                    <div className="row">
                        <div className="col-xl-11 col-lg-12">
                            <label
                                className={
                                    styles.featureLabel
                                }
                            >
                                Customer Details
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
                                        onChange={e => {
                                            setCustomerName(
                                                e.target.value
                                            );

                                            clearFieldError(
                                                'customerName'
                                            );
                                        }}
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

                                            clearFieldError(
                                                'phoneNumber'
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
                                        onChange={e => {
                                            setEmailId(
                                                e.target.value
                                            );

                                            clearFieldError(
                                                'emailId'
                                            );
                                        }}
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
                                        onChange={e => {
                                            setLocationLink(
                                                e.target.value
                                            );

                                            clearFieldError(
                                                'locationLink'
                                            );
                                        }}
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

                                    <input
                                        type="text"
                                        placeholder="Address"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            address
                                        }
                                        onChange={e => {
                                            setAddress(
                                                e.target.value
                                            );

                                            clearFieldError(
                                                'address'
                                            );
                                        }}
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

                                                clearFieldError(
                                                    'price'
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

                    <div className="row">
                        <div className="col-xl-11 col-lg-12">
                            <label
                                className={
                                    styles.featureLabel
                                }
                            >
                                Vehicle Details
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

                                    <CustomDropdown
                                        options={
                                            vehicleMakeList
                                        }
                                        value={
                                            vehicleMake
                                        }
                                        onChange={
                                            handleVehicleMakeChange
                                        }
                                        labelledBy="Select Vehicle Make"
                                        closeOnChangedValue={
                                            true
                                        }
                                        closeOnSelect={
                                            true
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

                                    <CustomDropdown
                                        options={
                                            vehicleModelList
                                        }
                                        value={
                                            vehicleModel
                                        }
                                        onChange={selectedModel => {
                                            setVehicleModel(
                                                selectedModel
                                            );

                                            clearFieldError(
                                                'vehicleModel'
                                            );
                                        }}
                                        labelledBy="Select Vehicle Model"
                                        closeOnChangedValue={
                                            true
                                        }
                                        closeOnSelect={
                                            true
                                        }
                                        disabled={
                                            !vehicleMake
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
                                        onChange={value => {
                                            setBatteryLevel(
                                                value
                                            );

                                            clearFieldError(
                                                'batteryLevel'
                                            );
                                        }}
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
                                        onChange={value => {
                                            setJumpStartRequired(
                                                value
                                            );

                                            clearFieldError(
                                                'jumpStartRequired'
                                            );
                                        }}
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

                    <div className="row">
                        <div className="col-xl-11 col-lg-12">
                            <label
                                className={
                                    styles.featureLabel
                                }
                            >
                                Payment Details
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
                                        onChange={value => {
                                            setPaymentMode(
                                                value
                                            );

                                            clearFieldError(
                                                'paymentMode'
                                            );

                                            if (
                                                value?.value !==
                                                'Online'
                                            ) {
                                                clearFieldError(
                                                    'paymentProof'
                                                );
                                            }
                                        }}
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

                        {paymentMode?.value ===
                            'Online' && (
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

                                    {/* Existing Proof */}

                                    {existingPaymentProof.length >
                                        0 && (
                                            <div className="row mt-2">

                                                <div className="col-xl-10 col-lg-12">

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                600,
                                                            marginBottom:
                                                                '10px',
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
                                                                                alt={`Existing Payment Proof ${index + 1}`}
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
                                                                                        '#777',
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
                                                                                        '2px',
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

                                    {/* New Proof */}

                                    {paymentProof.length >
                                        0 && (
                                            <div className="row mt-2">

                                                <div className="col-xl-10 col-lg-12">

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                600,
                                                            marginBottom:
                                                                '10px',
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
                                                                        alt={`Preview ${index + 1}`}
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
                                                                                    '2px',
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
                            )}

                    </div>

                    {/* =================================================
                        BOOKING DETAILS
                    ================================================= */}

                    <div className="row">
                        <div className="col-xl-11 col-lg-12">
                            <label
                                className={
                                    styles.featureLabel
                                }
                            >
                                Booking Details
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
                                        onChange={value => {
                                            setBookingStatus(
                                                value
                                            );

                                            clearFieldError(
                                                'bookingStatus'
                                            );
                                        }}
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

                                    <CustomDropdown
                                        options={
                                            rsaList
                                        }
                                        value={
                                            bookingCompletedBy
                                        }
                                        onChange={value => {
                                            setBookingCompletedBy(
                                                value
                                            );

                                            setBookingCompletedById(
                                                value?.id ||
                                                null
                                            );

                                            clearFieldError(
                                                'bookingCompletedBy'
                                            );
                                        }}
                                        labelledBy="Select Driver"
                                        closeOnChangedValue={
                                            true
                                        }
                                        closeOnSelect={
                                            true
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
