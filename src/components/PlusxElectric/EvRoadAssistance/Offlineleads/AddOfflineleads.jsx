import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AddOfflineleads.module.css';
import { postRequestWithToken, postRequestWithTokenAndFile } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { State, City } from 'country-state-city';
import { MdOutlineCloudUpload } from "react-icons/md";
import { AiOutlineClose } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';

const AddOfflineleads = () => {
    const location = useLocation();
    const status = new URLSearchParams(location.search).get("status");

    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);;

    // =========================
    // Rider Lookup Details
    // =========================
    const [riderLookupLoading, setRiderLookupLoading] = useState(false);
    const [riderLookupMessage, setRiderLookupMessage] = useState('');
    const [lookupTrigger, setLookupTrigger] = useState('');

    const lastLookupRef = useRef('');
    const lookupRequestRef = useRef(0);

    // =========================
    // Customer Details
    // =========================
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);
    const [locationLink, setLocationLink] = useState('');
    const [address, setAddress] = useState('');
    const [price, setPrice] = useState('');

    // =========================
    // State Dropdown Options - India
    // =========================
    const stateOptions = useMemo(() => {
        return State.getStatesOfCountry('IN')
            .map((item) => ({
                value: item.name,
                label: item.name,
                isoCode: item.isoCode,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    // =========================
    // City Dropdown Options
    // Depends on selected state
    // =========================
    const cityOptions = useMemo(() => {
        if (!state?.isoCode) {
            return [];
        }

        return City.getCitiesOfState('IN', state.isoCode)
            .map((item) => ({
                value: item.name,
                label: item.name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [state]);

    // =========================
    // Handle State Change
    // =========================
    const handleStateChange = (selectedOption) => {
        setState(selectedOption || null);

        // Reset city whenever state changes
        setCity(null);

        setErrors((prev) => ({
            ...prev,
            state: '',
            city: '',
        }));
    };

    // =========================
    // Handle City Change
    // =========================
    const handleCityChange = (selectedOption) => {
        setCity(selectedOption || null);

        setErrors((prev) => ({
            ...prev,
            city: '',
        }));
    };

    // =========================
    // Vehicle Details
    // =========================
    const [vehicleList, setVehicleList] = useState([]);
    const [vehicleListLoading, setVehicleListLoading] = useState(false);
    const [vehicleMake, setVehicleMake] = useState(null);
    const [vehicleModel, setVehicleModel] = useState(null);
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStartRequired, setJumpStartRequired] = useState(null);

    // =========================
    // Payment Details
    // =========================
    const [paymentMode, setPaymentMode] = useState(null);
    const [paymentProof, setPaymentProof] = useState([]);

    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        // const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        const validFiles = selectedFiles.filter(file => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type));

        if (validFiles.length !== selectedFiles.length) {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
            return;
        }
        setPaymentProof((prevFiles) => [...prevFiles, ...validFiles]);
    };

    const handleRemoveGalleryImage = (index) => {
        setPaymentProof((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    // =========================
    // Booking Details
    // =========================
    const [bookingStatus, setBookingStatus] = useState(null);
    const [bookingCompletedDate, setBookingCompletedDate] = useState('');
    const [bookingCompletedBy, setBookingCompletedBy] = useState('');
    const [driverOptions, setDriverOptions] = useState([]);
    const [driverListLoading, setDriverListLoading] = useState(false);

    // =========================
    // Fetch Driver List
    // =========================
    useEffect(() => {
        if (!userDetails?.access_token) return;

        setDriverListLoading(true);

        postRequestWithToken(
            'all-rsa-list',
            {
                email: userDetails?.email,
                userId: userDetails?.user_id,
                service_type: 'EV Roadside Assistance',
            },
            (response) => {
                if (
                    response?.code === 200 &&
                    response?.status === 1
                ) {
                    const options = (response?.data || []).map(
                        (driver) => ({
                            value: driver.rsa_name,
                            label: driver.rsa_name,
                        })
                    );

                    setDriverOptions(options);
                } else {
                    toast.error(
                        response?.message?.[0] ||
                        'Unable to fetch drivers.'
                    );
                }

                setDriverListLoading(false);
            }
        );
    }, [userDetails?.access_token]);

    // =========================================================
    // COUNTRY CODE OPTIONS
    // =========================================================
    const [countryCode, setCountryCode] = useState("+91");
    const countryCodeOptions = useMemo(() => {
        const displayNames = new Intl.DisplayNames(
            ["en"],
            {
                type: "region",
            }
        );

        return getCountries()
            .map((country) => {
                let countryName = country;

                try {
                    countryName =
                        displayNames.of(country) || country;
                } catch (error) {
                    countryName = country;
                }

                let callingCode = "";

                try {
                    callingCode =
                        `+${getCountryCallingCode(country)}`;
                } catch (error) {
                    console.error(
                        `Unable to get calling code for ${country}`,
                        error
                    );

                    return null;
                }

                return {
                    value: callingCode,
                    label: `${countryName} (${callingCode})`,
                    countryName,
                    country,
                };
            })
            .filter(Boolean)
            .sort((a, b) =>
                a.countryName.localeCompare(
                    b.countryName
                )
            );
    }, []);

    // =========================================================
    // SELECTED COUNTRY CODE
    // =========================================================

    const selectedCountryCode =
        countryCodeOptions.find(
            (option) =>
                option.value === countryCode
        ) || null;

    // =========================================================
    // COUNTRY CODE CHANGE
    // =========================================================

    const handleCountryCodeChange = (
        selectedOption
    ) => {
        let selectedValue = "";

        if (
            selectedOption &&
            typeof selectedOption === "object"
        ) {
            selectedValue =
                selectedOption?.value || "";
        } else {
            selectedValue =
                selectedOption || "";
        }

        setCountryCode(selectedValue);

        if (selectedValue) {
            setErrors((prev) => ({
                ...prev,
                countryCode: "",
            }));
        }
    };

    const applyRiderDetails = (rider) => {
        if (!rider) return;

        if (rider.customer_name) {
            setCustomerName(rider.customer_name);
        }

        if (rider.mobile_no) {
            const digits = String(rider.mobile_no).replace(/\D/g, '');

            // Remove the country calling code if the API returns it
            // as part of the mobile number.
            const callingCode = String(rider.country_code || countryCode)
                .replace(/\D/g, '');

            const localNumber =
                digits.length > 10 && digits.startsWith(callingCode)
                    ? digits.slice(callingCode.length)
                    : digits;

            setPhoneNumber(localNumber.slice(-10));
        }

        if (rider.email_id) {
            setEmailId(rider.email_id);
        }

        if (rider.country_code) {
            const matchedCode = countryCodeOptions.find(
                (option) => option.value === rider.country_code
            );

            if (matchedCode) {
                setCountryCode(matchedCode.value);
            }
        }

        // Your current state dropdown contains Indian states only.
        // Autofill only when the returned emirates value matches
        // an existing dropdown option.
        if (rider.emirates) {
            const matchedState = stateOptions.find(
                (option) =>
                    option.label.toLowerCase() ===
                    String(rider.emirates).trim().toLowerCase()
            );

            if (matchedState) {
                setState(matchedState);
                setCity(null);
            }
        }

        setErrors((prev) => ({
            ...prev,
            customerName: '',
            phoneNumber: '',
            emailId: '',
            state: '',
            city: '',
        }));
    };

    useEffect(() => {
        let timer;

        const lookupValue =
            lookupTrigger === 'mobile'
                ? phoneNumber.trim()
                : emailId.trim();

        if (!lookupTrigger || !lookupValue) {
            return;
        }

        // Mobile lookup requires exactly 10 digits.
        if (
            lookupTrigger === 'mobile' &&
            !/^\d{10}$/.test(lookupValue)
        ) {
            setRiderLookupMessage('');
            return;
        }

        // Email lookup requires a complete, valid email address.
        if (
            lookupTrigger === 'email' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupValue)
        ) {
            setRiderLookupMessage('');
            return;
        }

        const lookupKey = `${lookupTrigger}:${lookupValue.toLowerCase()}`;

        if (lastLookupRef.current === lookupKey) {
            return;
        }

        timer = setTimeout(() => {
            lastLookupRef.current = lookupKey;

            const requestId = ++lookupRequestRef.current;

            setRiderLookupLoading(true);
            setRiderLookupMessage('Checking existing rider...');

            const payload = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                country_code: countryCode,
            };

            if (lookupTrigger === 'mobile') {
                payload.mobile_no = lookupValue;
            } else {
                payload.email_id = lookupValue;
            }

            postRequestWithToken(
                'ev-road-assistance-offline-rider-lookup',
                payload,
                (response) => {
                    // Ignore an older response if a newer lookup started.
                    if (requestId !== lookupRequestRef.current) {
                        return;
                    }

                    setRiderLookupLoading(false);

                    if (
                        response?.code === 200 &&
                        response?.found === 1 &&
                        response?.data
                    ) {
                        applyRiderDetails(response.data);

                        setRiderLookupMessage(
                            'Existing rider found. Details autofilled.'
                        );
                    } else if (
                        response?.code === 200 &&
                        response?.found === 0
                    ) {
                        setRiderLookupMessage(
                            'No existing rider found. Enter new rider details.'
                        );
                    } else {
                        // Allow retrying if the API returns an error.
                        lastLookupRef.current = '';

                        setRiderLookupMessage(
                            response?.message?.[0] ||
                            response?.message ||
                            'Unable to look up rider details.'
                        );
                    }
                }
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [
        lookupTrigger,
        phoneNumber,
        emailId,
        countryCode,
        countryCodeOptions,
        stateOptions,
        userDetails?.user_id,
        userDetails?.email,
    ]);

    // =========================
    // Dropdown Options
    // =========================
    const batteryLevelOptions = [
        { value: '0%', label: '0%' },
        { value: 'more_than_5%', label: 'More than 5%' },
    ];

    const jumpStartOptions = [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
    ];

    const paymentModeOptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'online', label: 'Online' },
    ];

    const bookingStatusOptions = [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
    ];

    // =========================
    // Normalize Vehicle API Data
    // Supports:
    // [{ make: 'Tata', model: 'Nexon EV' }]
    // [{ make: 'Tata', models: ['Nexon EV'] }]
    // [{ make: 'Tata', models: [{ model: 'Nexon EV' }] }]
    // =========================
    const normalizeVehicleData = (responseData) => {
        let rows = responseData;

        // Handle common nested response structures.
        if (!Array.isArray(rows)) {
            rows =
                rows?.vehicles ||
                rows?.vehicleList ||
                rows?.vehicle_brand_list ||
                rows?.data ||
                [];
        }

        if (!Array.isArray(rows)) {
            return [];
        }

        const normalized = [];

        rows.forEach((item) => {
            if (!item || typeof item !== 'object') {
                return;
            }

            const make = String(
                item.make ?? item.value ?? ''
            ).trim();

            if (!make) {
                return;
            }

            // Response contains a flat make/model row.
            if (item.model != null && !Array.isArray(item.models)) {
                const model = String(item.model).trim();

                if (model) {
                    normalized.push({ make, model });
                }

                return;
            }

            // Response contains a make with a models array.
            if (Array.isArray(item.models)) {
                item.models.forEach((modelItem) => {
                    const model =
                        typeof modelItem === 'string'
                            ? modelItem.trim()
                            : String(
                                modelItem?.model ??
                                modelItem?.label ??
                                modelItem?.value ??
                                ''
                            ).trim();

                    if (model) {
                        normalized.push({ make, model });
                    }
                });

                return;
            }

            // Handle a make-only item if returned by the API.
            normalized.push({ make, model: '' });
        });

        // Remove duplicate make/model combinations.
        const unique = new Map();

        normalized.forEach(({ make, model }) => {
            const key = `${make.toLowerCase()}::${model.toLowerCase()}`;

            if (!unique.has(key)) {
                unique.set(key, { make, model });
            }
        });

        return Array.from(unique.values());
    };

    // =========================
    // Fetch Vehicle Makes/Models
    // =========================
    useEffect(() => {
        if (!userDetails?.access_token) {
            return;
        }

        setVehicleListLoading(true);

        postRequestWithToken(
            'vehicle-brand-list',
            {
                email: userDetails?.email,
                userId: userDetails?.user_id
            },
            (response) => {
                if (
                    response?.code === 200 ||
                    response?.status === 1
                ) {
                    const responseData = response?.data ?? [];

                    const normalizedVehicles =
                        normalizeVehicleData(responseData);

                    setVehicleList(normalizedVehicles);

                    if (normalizedVehicles.length === 0) {
                        toast.error(
                            'No vehicle makes or models were returned by the API.'
                        );
                    }
                } else {
                    toast.error(
                        response?.message?.[0] ||
                        response?.message ||
                        'Unable to fetch vehicle makes and models.'
                    );
                }

                setVehicleListLoading(false);
            }
        );
    }, [userDetails?.access_token]);

    // =========================
    // Vehicle Make Dropdown
    // =========================
    const vehicleMakeOptions = useMemo(() => {
        const uniqueMakes = [
            ...new Set(
                vehicleList
                    .map((vehicle) => vehicle.make)
                    .filter(Boolean)
            )
        ];

        return uniqueMakes
            .sort((a, b) => a.localeCompare(b))
            .map((make) => ({
                value: make,
                label: make
            }));
    }, [vehicleList]);

    // =========================
    // Vehicle Model Dropdown
    // Filter models by selected make.
    // =========================
    const vehicleModelOptions = useMemo(() => {
        if (!vehicleMake?.value) {
            return [];
        }

        const uniqueModels = [
            ...new Set(
                vehicleList
                    .filter(
                        (vehicle) =>
                            vehicle.make === vehicleMake.value
                    )
                    .map((vehicle) => vehicle.model)
                    .filter(Boolean)
            )
        ];

        return uniqueModels
            .sort((a, b) => a.localeCompare(b))
            .map((model) => ({
                value: model,
                label: model
            }));
    }, [vehicleList, vehicleMake]);

    const handleVehicleMakeChange = (selectedOption) => {
        setVehicleMake(selectedOption || null);

        // Reset the model when its make changes.
        setVehicleModel(null);

        setErrors((prev) => ({
            ...prev,
            vehicleMake: '',
            vehicleModel: ''
        }));
    };

    const handleVehicleModelChange = (selectedOption) => {
        setVehicleModel(selectedOption || null);

        setErrors((prev) => ({
            ...prev,
            vehicleModel: ''
        }));
    };


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
            newErrors.phoneNumber = 'Please enter a valid 10 digit phone number.';
        }

        if (!emailId.trim()) {
            newErrors.emailId = 'Email ID is required.';
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)
        ) {
            newErrors.emailId = 'Please enter a valid email ID.';
        }

        if (!state?.value) {
            newErrors.state = 'State is required.';
        }

        if (!city?.value) {
            newErrors.city = 'City is required.';
        }

        if (!locationLink.trim()) {
            newErrors.locationLink = 'Location Link is required.';
        }

        if (!address.trim()) {
            newErrors.address = 'Address is required.';
        }

        if (!price.trim()) {
            newErrors.price = 'Price including GST is required.';
        }

        if (!vehicleMake?.value) {
            newErrors.vehicleMake = 'Vehicle Make is required.';
        }

        if (!vehicleModel?.value) {
            newErrors.vehicleModel = 'Vehicle Model is required.';
        }

        if (!batteryLevel?.value) {
            newErrors.batteryLevel = 'Battery Level is required.';
        }

        if (!jumpStartRequired?.value) {
            newErrors.jumpStartRequired = 'Jump Start Required is required.';
        }

        if (!paymentMode?.value) {
            newErrors.paymentMode = 'Mode of Payment is required.';
        }

        if (!paymentProof) {
            newErrors.paymentProof = 'Payment Proof is required.';
        }

        if (!bookingStatus?.value) {
            newErrors.bookingStatus = 'Booking Status is required.';
        }

        if (
            bookingStatus?.value === 'completed' &&
            !bookingCompletedBy.trim()
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

        if (loading) {
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append('status', status == 1 ? 'completed' : 'not completed');
        formData.append('userId', userDetails?.user_id ?? '');
        formData.append('email', userDetails?.email ?? '');

        // Customer Details
        formData.append('customer_name', customerName.trim());
        formData.append('phone_number', phoneNumber);
        formData.append('email_id', emailId.trim());
        formData.append('state', state.value);
        formData.append('city', city.value);
        formData.append('location_link', locationLink.trim());
        formData.append('address', address.trim());
        formData.append('price', price);

        // Vehicle Details
        formData.append('vehicle_make', vehicleMake.value);
        formData.append('vehicle_model', vehicleModel.value);
        formData.append('battery_level', batteryLevel.value);
        formData.append(
            'jump_start_required',
            jumpStartRequired.value
        );

        // Payment Details
        formData.append('payment_mode', paymentMode.value);

        paymentProof.forEach((file) => {
            formData.append('proof_of_transaction', file);
        });

        // Booking Details
        formData.append('booking_status', bookingStatus.value);
        formData.append(
            'booking_completed_by',
            bookingCompletedBy
        );
        formData.append(
            'booking_completed_date',
            bookingCompletedDate
        );

        postRequestWithTokenAndFile(
            'ev-road-assistance-add-offline-booking',
            formData,
            async (response) => {
                if (response.code === 200 || response.status === 1) {
                    toast.success(
                        response.message || 'Booking added successfully.'
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

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
        }
    }, [navigate, userDetails?.access_token]);

    const handleCancel = () => {
        navigate('/electric/ev-road-assistance/rsa-offline-leads');
    };

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
                                    <div className={styles.contactNumberRow}>

                                        {/* Country Code - 40% */}
                                        <div className={styles.countryCodeWrapper}>
                                            <CustomDropdown
                                                options={countryCodeOptions}
                                                value={selectedCountryCode}
                                                onChange={handleCountryCodeChange}
                                                placeholder="+91"
                                            />

                                            {errors.countryCode && (
                                                <p
                                                    className={styles.error}
                                                    style={{ color: 'red' }}
                                                >
                                                    {errors.countryCode}
                                                </p>
                                            )}
                                        </div>

                                        {/* Contact Number - 60% */}
                                        <div className={styles.contactNumberWrapper}>
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Phone Number"
                                                className={styles.inputField}
                                                value={phoneNumber}
                                                maxLength={10}
                                                // onChange={(e) => {
                                                //     const value =
                                                //         e.target.value.replace(
                                                //             /\D/g,
                                                //             ''
                                                //         );

                                                //     setPhoneNumber(value);
                                                // }}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);

                                                    setPhoneNumber(value);
                                                    setLookupTrigger('mobile');

                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        phoneNumber: '',
                                                    }));
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
                                        // onChange={(e) =>
                                        //     setEmailId(e.target.value)
                                        // }
                                        onChange={(e) => {
                                            setEmailId(e.target.value);
                                            setLookupTrigger('email');

                                            setErrors((prev) => ({
                                                ...prev,
                                                emailId: '',
                                            }));
                                        }}
                                    />

                                    {errors.emailId && (
                                        <p className={styles.error}>
                                            {errors.emailId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                State
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={stateOptions}
                                        value={state}
                                        onChange={handleStateChange}
                                        placeholder="Select State"
                                        labelledBy="Select State"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.state && (
                                        <p className={styles.error}>
                                            {errors.state}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                City
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <CustomDropdown
                                        options={cityOptions}
                                        value={city}
                                        onChange={handleCityChange}
                                        placeholder={
                                            !state
                                                ? 'Select State First'
                                                : cityOptions.length === 0
                                                    ? 'No Cities Available'
                                                    : 'Select City'
                                        }
                                        labelledBy="Select City"
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
                                    />

                                    {errors.city && (
                                        <p className={styles.error}>
                                            {errors.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                    <CustomDropdown
                                        options={vehicleMakeOptions}
                                        value={vehicleMake}
                                        onChange={handleVehicleMakeChange}
                                        labelledBy="Select Vehicle Make"
                                        placeholder={
                                            vehicleListLoading
                                                ? 'Loading vehicle makes...'
                                                : 'Select Vehicle Make'
                                        }
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
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
                                    <CustomDropdown
                                        options={vehicleModelOptions}
                                        value={vehicleModel}
                                        onChange={handleVehicleModelChange}
                                        labelledBy="Select Vehicle Model"
                                        placeholder={
                                            !vehicleMake
                                                ? 'Select Vehicle Make First'
                                                : vehicleModelOptions.length === 0
                                                    ? 'No Models Available'
                                                    : 'Select Vehicle Model'
                                        }
                                        closeOnChangedValue={true}
                                        closeOnSelect={true}
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
                        {/* <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Payment Proof
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="file"
                                        className={styles.inputField}
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            setPaymentProof(
                                                e.target.files?.[0] || null
                                            );
                                        }}
                                    />

                                    {errors.paymentProof && (
                                        <p className={styles.error}>
                                            {errors.paymentProof}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div> */}
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
                                                <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={URL.createObjectURL(file)} />
                                                <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>)}
                        </div>

                    </div>


                    {/* =====================================================
                        BOOKING DETAILS
                    ====================================================== */}
                    {/* <div className={styles.formSectionHeading}>
                        Booking Details
                    </div> */}

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Booking Details

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


                        {/* Booking Completed Date */}
                        <div className="col-lg-6">
                            <label className={styles.labelText}>
                                Booking Completed Date
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="date"
                                        className={styles.inputField}
                                        value={bookingCompletedDate}
                                        max={new Date().toLocaleDateString('en-CA')}
                                        onChange={(e) => {
                                            setBookingCompletedDate(e.target.value);

                                            setErrors((prev) => ({
                                                ...prev,
                                                bookingCompletedDate: '',
                                            }));
                                        }}
                                        disabled={bookingStatus?.value !== 'completed'}
                                    />

                                    {errors.bookingCompletedDate && (
                                        <p className={styles.error}>
                                            {errors.bookingCompletedDate}
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
                                        options={driverOptions}
                                        value={
                                            driverOptions.find(
                                                (driver) =>
                                                    driver.value === bookingCompletedBy
                                            ) || null
                                        }
                                        onChange={(selectedOption) => {
                                            setBookingCompletedBy(
                                                selectedOption?.value || ''
                                            );

                                            setErrors((prev) => ({
                                                ...prev,
                                                bookingCompletedBy: '',
                                            }));
                                        }}
                                        placeholder={
                                            driverListLoading
                                                ? 'Loading drivers...'
                                                : driverOptions.length === 0
                                                    ? 'No drivers available'
                                                    : 'Select Driver'
                                        }
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