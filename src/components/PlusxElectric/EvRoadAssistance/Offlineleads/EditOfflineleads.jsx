import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { State, City } from 'country-state-city';
import styles from './AddOfflineleads.module.css';
import { postRequestWithToken, getRequestWithToken, postRequestWithTokenAndFile } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { AiOutlineClose } from 'react-icons/ai';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown, { CustomDropdownDisabled } from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';

const EditOfflineleads = () => {
    const location = useLocation();
    const status = new URLSearchParams(location.search).get("status");

    const navigate = useNavigate();
    const { id } = useParams();
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const [isBookingNotCompleted, setIsBookingNotCompleted] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    // =========================
    // Rider Lookup Details
    // =========================
    const [riderLookupLoading, setRiderLookupLoading] = useState(false);
    const [riderLookupMessage, setRiderLookupMessage] = useState('');
    const [lookupTrigger, setLookupTrigger] = useState('');

    const lastLookupRef = useRef('');
    const lookupRequestRef = useRef(0);

    // =========================================================
    // Customer Details
    // =========================================================

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

    // =========================================================
    // Vehicle Details
    // =========================================================

    const [vehicleList, setVehicleList] = useState([]);
    const [vehicleListLoading, setVehicleListLoading] = useState(false);
    const [vehicleMake, setVehicleMake] = useState(null);
    const [vehicleModel, setVehicleModel] = useState(null);

    const [batteryLevel, setBatteryLevel] = useState(null);
    const [jumpStartRequired, setJumpStartRequired] =
        useState(null);

    // =========================================================
    // Payment Details
    // =========================================================

    // Newly selected files
    const [paymentProof, setPaymentProof] = useState([]);
    const [serviceTnC, setServiceTnC] = useState([]);

    // Preview URLs for newly selected files
    const [paymentProofPreviews, setPaymentProofPreviews] =
        useState([]);

    // Already uploaded files
    const [existingPaymentProof, setExistingPaymentProof] =
        useState([]);

    // Preview URLs for newly selected files
    const [serviceTnCPreviews, setServiceTnCPreviews] =
        useState([]);

    // Already uploaded files
    const [existingServiceTnC, setexistingServiceTnC] =
        useState([]);

    const [paymentMode, setPaymentMode] = useState(null);

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

    // =========================================================
    // Booking Details
    // =========================================================

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
                            rsa_id: driver.rsa_id,
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
        { value: 'Cash', label: 'Cash' },
        { value: 'Online', label: 'Online' }
    ];

    // Keep UI values aligned with the backend order-status codes.
    // Cancelled booking handling is intentionally excluded.
    const bookingStatusOptions = [
        { value: 'CNF', label: 'Confirmed' },
        { value: 'PU', label: 'Completed' }
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
        if (value === null || value === undefined || value === '') {
            return null;
        }

        return (
            options.find(
                (option) =>
                    String(option.value).trim().toLowerCase() ===
                    String(value).trim().toLowerCase()
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

    useEffect(() => {
        if (vehicleList.length === 0) {
            return;
        }

        setVehicleMake((currentMake) => {
            if (!currentMake?.value) {
                return null;
            }

            return (
                getDropdownValue(
                    vehicleMakeOptions,
                    currentMake.value
                ) || currentMake
            );
        });
    }, [vehicleList, vehicleMakeOptions]);

    useEffect(() => {
        if (!vehicleMake?.value || vehicleList.length === 0) {
            return;
        }

        setVehicleModel((currentModel) => {
            if (!currentModel?.value) {
                return null;
            }

            return (
                getDropdownValue(
                    vehicleModelOptions,
                    currentModel.value
                ) || currentModel
            );
        });
    }, [vehicleList, vehicleMake, vehicleModelOptions]);

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
    // Normalize Existing Payment Proof
    // =========================================================

    const normalizeServiceTnC = serviceTnCData => {
        if (!serviceTnCData) {
            return [];
        }

        if (Array.isArray(serviceTnCData)) {
            return serviceTnCData;
        }

        return [serviceTnCData];
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
    const getBookingStatusOption = (booking) => {
        const completedValue = String(
            booking?.is_booking_completed ?? ''
        ).trim().toLowerCase();

        // The explicit completion flag takes priority.
        if (['yes', '1', 'true', 'completed'].includes(completedValue)) {
            return getDropdownValue(bookingStatusOptions, 'PU');
        }

        if (['no', '0', 'false', 'confirmed'].includes(completedValue)) {
            return getDropdownValue(bookingStatusOptions, 'CNF');
        }

        // Fallback to the saved order status when no completion flag exists.
        const orderStatus = String(
            booking?.booking_status ?? booking?.order_status ?? ''
        ).trim().toUpperCase();

        if (['CNF', 'A', 'CONFIRMED'].includes(orderStatus)) {
            return getDropdownValue(bookingStatusOptions, 'CNF');
        }

        if (['PU', 'COM', 'CMP', 'COMPLETED'].includes(orderStatus)) {
            return getDropdownValue(bookingStatusOptions, 'PU');
        }

        // Cancelled and unknown statuses are not selectable in this form.
        return null;
    };

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
            (response) => {
                try {
                    if (
                        response?.status === 1 ||
                        response?.code === 200
                    ) {
                        const booking = response?.data?.booking || {};
                        const history = response?.data?.history || [];

                        // Customer details
                        setCustomerName(booking.customer_name || booking.name || '');
                        setIsBookingNotCompleted(
                            String(booking.is_booking_completed || 'Yes').trim().toLowerCase() === 'no'
                        );
                        setPhoneNumber(
                            String(
                                booking.mobile_no ||
                                booking.contact_no ||
                                ''
                            )
                                .replace(/\D/g, '')
                                .slice(-10)
                        );

                        setEmailId(booking.email_id || booking.email || '');
                        setBookingCompletedDate(booking.booking_completed_date || '');

                        // Country calling code
                        const savedCountryCode = String(booking.country_code || '+91');
                        const normalizedCountryCode = savedCountryCode.startsWith('+')
                            ? savedCountryCode
                            : `+${savedCountryCode}`;
                        const matchedCountryCode = countryCodeOptions.find(
                            (option) => option.value === normalizedCountryCode
                        );

                        if (matchedCountryCode) {
                            setCountryCode(matchedCountryCode.value);
                        }

                        // State dropdown: must receive an option object.
                        const matchedState = getDropdownValue(
                            stateOptions,
                            booking.state
                        );

                        const selectedState = matchedState
                            ? {
                                ...matchedState,
                                isoCode: stateOptions.find(
                                    (option) =>
                                        option.value === matchedState.value
                                )?.isoCode,
                            }
                            : null;

                        setState(selectedState);

                        // City dropdown: must receive an option object.
                        if (selectedState?.isoCode && booking.city) {
                            const availableCities = City.getCitiesOfState(
                                'IN',
                                selectedState.isoCode
                            );

                            const matchedCity = availableCities.find(
                                (item) =>
                                    item.name.trim().toLowerCase() ===
                                    String(booking.city)
                                        .trim()
                                        .toLowerCase()
                            );

                            setCity(
                                matchedCity
                                    ? {
                                        value: matchedCity.name,
                                        label: matchedCity.name,
                                    }
                                    : null
                            );
                        } else {
                            setCity(null);
                        }

                        // Address and location
                        setAddress(booking.address || booking.pickup_address || '');

                        setLocationLink(
                            booking.location_link || ''
                        );

                        setPrice(
                            booking.price != null
                                ? String(booking.price)
                                : ''
                        );

                        // Vehicle make/model.
                        // Keep temporary values until vehicle options load.
                        const vehicleData = String(
                            booking.vehicle_data || ''
                        )
                            .split(',')
                            .map((item) => item.trim());

                        const make =
                            booking.vehicle_make || vehicleData[0] || '';

                        const model =
                            booking.vehicle_model || vehicleData[1] || '';

                        setVehicleMake(
                            make
                                ? { value: make, label: make }
                                : null
                        );

                        setVehicleModel(
                            model
                                ? { value: model, label: model }
                                : null
                        );

                        // Battery level: do not use `|| null` for numeric zero.
                        const batteryValue =
                            booking.battery_level === null ||
                                booking.battery_level === undefined ||
                                booking.battery_level === ''
                                ? null
                                : Number(booking.battery_level) === 0
                                    ? '0%'
                                    : 'more_than_5%';

                        setBatteryLevel(
                            batteryValue
                                ? getDropdownValue(
                                    batteryLevelOptions,
                                    batteryValue
                                )
                                : null
                        );

                        // Jump-start option
                        const jumpValue = String(
                            booking.jump_start_required ?? ''
                        ).trim().toLowerCase();

                        const normalizedJumpValue =
                            ['yes', '1', 'true'].includes(jumpValue) ? 'yes' :
                            ['no', '0', 'false'].includes(jumpValue) ? 'no' : '';

                        setJumpStartRequired(
                            normalizedJumpValue
                                ? getDropdownValue(jumpStartOptions, normalizedJumpValue)
                                : null
                        );

                        // Payment mode
                        setPaymentMode(
                            getDropdownValue(
                                paymentModeOptions,
                                booking.mode_of_payment
                            )
                        );

                        // Existing payment proof
                        const proofData =
                            booking.proof_of_transaction_url ||
                            booking.proof_of_transaction ||
                            [];

                        setExistingPaymentProof(
                            normalizePaymentProof(proofData)
                        );

                        // Existing service terms and conditions
                        const serviceTnCData =
                            booking.service_terms_and_condition_url ||
                            booking.service_terms_and_condition ||
                            [];

                        setexistingServiceTnC(
                            normalizeServiceTnC(serviceTnCData)
                        );

                        // Booking status
                        setBookingStatus(
                            getBookingStatusOption(booking)
                        );

                        // Booking completed by
                        const latestHistory =
                            history.length > 0
                                ? history[history.length - 1]
                                : null;

                        setBookingCompletedBy(
                            booking.booking_completed_by ||
                            booking.driver_name ||
                            latestHistory?.driver_name ||
                            ''
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
    // File Upload
    // =========================================================

    const handleGalleryChange2 = event => {
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

        setServiceTnC(prevFiles => [
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

        setServiceTnCPreviews(
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
            serviceTnC: ''
        }));
    };

    // =========================================================
    // Remove New Service Terms and Conditions
    // =========================================================

    const handleRemoveGalleryImage2 = index => {
        setServiceTnC(prevFiles =>
            prevFiles.filter(
                (_, i) => i !== index
            )
        );

        setServiceTnCPreviews(prevPreviews => {
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
    // Remove Existing Service Terms and Conditions
    // =========================================================

    const handleRemoveExistingTnC = index => {
        setexistingServiceTnC(prevFiles =>
            prevFiles.filter(
                (_, i) => i !== index
            )
        );
    };

    // =========================================================
    // Validation - follow the reference flow:
    // incomplete/confirmed bookings only require contact information;
    // completed bookings require the full booking and service details.
    // Cancelled-booking handling is intentionally excluded.
    // =========================================================

    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

    const isValidLocationUrl = (value) => {
        if (!String(value || '').trim()) return true;
        try {
            const parsed = new URL(value.trim());
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const isCompletingNow = bookingStatus?.value === 'PU';
        const isIncompleteBooking = isBookingNotCompleted && !isCompletingNow;

        if (!bookingStatus?.value) {
            newErrors.bookingStatus = 'Booking Status is required.';
        }

        if (isIncompleteBooking) {
            const hasPhone = Boolean(phoneNumber.trim());
            const hasEmail = Boolean(emailId.trim());

            if (!hasPhone && !hasEmail) {
                newErrors.phoneNumber = 'Please enter Phone Number or Email ID.';
                newErrors.emailId = 'Please enter Phone Number or Email ID.';
            }

            if (hasPhone && !/^\d{10}$/.test(phoneNumber.trim())) {
                newErrors.phoneNumber = 'Please enter a valid 10 digit phone number.';
            }

            if (hasEmail && !isValidEmail(emailId)) {
                newErrors.emailId = 'Please enter a valid email ID.';
            }

            if (!isValidLocationUrl(locationLink)) {
                newErrors.locationLink = 'Please enter a valid URL.';
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        // Full validation applies when the booking is already completed or
        // the user is changing an incomplete booking to Completed.
        if (!customerName.trim()) {
            newErrors.customerName = 'Customer Name is required.';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required.';
        } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
            newErrors.phoneNumber = 'Please enter a valid 10 digit phone number.';
        }

        if (!emailId.trim()) {
            newErrors.emailId = 'Email ID is required.';
        } else if (!isValidEmail(emailId)) {
            newErrors.emailId = 'Please enter a valid email ID.';
        }

        if (!state?.value) newErrors.state = 'State is required.';
        if (!city?.value) newErrors.city = 'City is required.';
        if (!locationLink.trim()) newErrors.locationLink = 'Location Link is required.';
        if (!address.trim()) newErrors.address = 'Address is required.';
        if (!price.trim()) newErrors.price = 'Price including GST is required.';
        else if (!Number.isFinite(Number(price)) || Number(price) < 0) {
            newErrors.price = 'Please enter a valid price.';
        }

        if (!vehicleMake?.value) newErrors.vehicleMake = 'Vehicle Make is required.';
        if (!vehicleModel?.value) newErrors.vehicleModel = 'Vehicle Model is required.';
        if (batteryLevel?.value === undefined || batteryLevel?.value === null || batteryLevel?.value === '') {
            newErrors.batteryLevel = 'Battery Level is required.';
        }
        if (!jumpStartRequired?.value) newErrors.jumpStartRequired = 'Jump Start Required is required.';

        if (isCompletingNow) {
            if (!paymentMode?.value) {
                newErrors.paymentMode = 'Mode of Payment is required.';
            }

            if (String(paymentMode?.value || '').toLowerCase() === 'online' &&
                paymentProof.length === 0 && existingPaymentProof.length === 0) {
                newErrors.paymentProof = 'Payment Proof is required for Online payment.';
            }

            if (serviceTnC.length === 0 && existingServiceTnC.length === 0) {
                newErrors.serviceTnC = 'Service T&C is required.';
            }

            if (!bookingCompletedDate) {
                newErrors.bookingCompletedDate = 'Booking Completed Date is required.';
            }

            if (!String(bookingCompletedBy || '').trim()) {
                newErrors.bookingCompletedBy = 'Booking Completed By is required.';
            }
        }

        if (!isValidLocationUrl(locationLink)) {
            newErrors.locationLink = 'Please enter a valid URL.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // =========================================================
    // Submit / Update
    // =========================================================

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;

        if (!validateForm()) {
            toast.error('Some fields are missing or invalid.');
            return;
        }

        const currentUserDetails = getUserDetails();
        if (!currentUserDetails?.access_token) {
            toast.error('User session expired. Please login again.');
            navigate('/login');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        const appendIfSet = (key, value) => {
            if (value !== undefined && value !== null && value !== '') {
                formData.append(key, value);
            }
        };

        const currentBookingStatus = bookingStatus?.value;
        const isCompletingNow = currentBookingStatus === 'PU';
        const isCompletedBooking = !isBookingNotCompleted || isCompletingNow;

        appendIfSet('userId', currentUserDetails.user_id);
        appendIfSet('email', currentUserDetails.email);
        appendIfSet('request_id', id);
        appendIfSet('id', id);
        formData.append('is_booking_completed', isCompletedBooking ? 'Yes' : 'No');
        appendIfSet('booking_status', currentBookingStatus);

        // Send any values that are present. For an incomplete booking the
        // backend can save contact details without requiring the full form.
        appendIfSet('customer_name', customerName.trim());
        appendIfSet('phone_number', phoneNumber.trim());
        appendIfSet('email_id', emailId.trim());
        appendIfSet('country_code', countryCode || '+91');
        appendIfSet('state', state?.value);
        appendIfSet('city', city?.value);
        appendIfSet('location_link', locationLink.trim());
        appendIfSet('address', address.trim());
        appendIfSet('price', price.trim());
        appendIfSet('vehicle_make', vehicleMake?.value);
        appendIfSet('vehicle_model', vehicleModel?.value);

        // Keep 0 as a valid battery-level value.
        if (batteryLevel?.value !== undefined && batteryLevel?.value !== null && batteryLevel?.value !== '') {
            // API stores battery level as 0/1; UI labels are 0% / more_than_5%.
            formData.append(
                'battery_level',
                batteryLevel.value === '0%' ? '0' : '1'
            );
        }
        if (jumpStartRequired?.value) {
            formData.append(
                'jump_start_required',
                jumpStartRequired.value === 'yes' ? '1' : '0'
            );
        }

        if (isCompletingNow) {
            appendIfSet('mode_of_payment', paymentMode?.value);
            appendIfSet('payment_status', 'Paid');
            appendIfSet('booking_completed_by', String(bookingCompletedBy || '').trim());
            appendIfSet('driver_name', String(bookingCompletedBy || '').trim());
            const selectedDriver = driverOptions.find(
                (driver) => driver.value === String(bookingCompletedBy || '').trim()
            );
            appendIfSet('rsa_id', selectedDriver?.rsa_id);
            appendIfSet('booking_completed_date', bookingCompletedDate);
        } else if (paymentMode?.value) {
            // Preserve an optional payment mode on an incomplete booking.
            appendIfSet('mode_of_payment', paymentMode.value);
        }

        // Append only newly selected files; existing files are already stored.
        if (Array.isArray(paymentProof)) {
            paymentProof.forEach((file) => {
                if (typeof File !== 'undefined' && file instanceof File) {
                    formData.append('proof_of_transaction', file);
                }
            });
        }

        if (isCompletedBooking && Array.isArray(serviceTnC)) {
            serviceTnC.forEach((file) => {
                if (typeof File !== 'undefined' && file instanceof File) {
                    formData.append('service_terms_condition', file);
                }
            });
        }

        postRequestWithTokenAndFile(
            'ev-road-assistance-edit-offline-booking',
            formData,
            (response) => {
                if (response?.code === 200 || response?.status === 1) {
                    toast.success(
                        getResponseMessage(response, 'Offline RSA booking updated successfully.')
                    );
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/ev-road-assistance/rsa-offline-leads');
                    }, 1000);
                } else {
                    toast.error(
                        getResponseMessage(response, 'Something went wrong while updating the booking.')
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

        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }

        if (!id) {
            toast.error('Booking ID is missing.');
            navigate('/electric/ev-road-assistance/rsa-offline-leads');
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
    // Cleanup Preview URLs
    // =========================================================

    useEffect(() => {
        return () => {
            serviceTnCPreviews.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [serviceTnCPreviews]);

    // =========================================================
    // Cancel
    // =========================================================

    const handleCancel = () => {
        if (loading) {
            return;
        }

        navigate('/electric/ev-road-assistance/rsa-offline-leads');
    };

    // =========================================================
    // Loading Screen
    // =========================================================

    if (fetchingData) {
        return (
            <div className={styles.addStationContainer}>
                <ToastContainer />

                <div className={styles.addHeading}> Edit EV Road Assistance Offline Booking</div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <div className="spinner-border" role="status">
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
        <div className={styles.addStationContainer}
        >
            <ToastContainer />

            <div className={styles.addHeading}>
                Edit EV Road Assistance Offline Booking
            </div>

            <div className={styles.addStationFormSection}>
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
                                        className={styles.inputField}
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
                                    <div className={styles.contactNumberRow}>

                                        {/* Country Code - 40% */}
                                        <div className={styles.countryCodeWrapper}>
                                            <CustomDropdownDisabled
                                                options={countryCodeOptions}
                                                value={selectedCountryCode}
                                                onChange={handleCountryCodeChange}
                                                placeholder="+91"
                                                isDisabled={true}
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
                                                className={
                                                    styles.inputField
                                                }
                                                disabled={true}
                                                value={
                                                    phoneNumber
                                                }
                                                maxLength={10}
                                                // onChange={e => {
                                                //     const value =
                                                //         e.target.value.replace(
                                                //             /\D/g,
                                                //             ''
                                                //         );

                                                //     setPhoneNumber(
                                                //         value
                                                //     );
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
                                        disabled={true}
                                        // onChange={e =>
                                        //     setEmailId(
                                        //         e.target.value
                                        //     )
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

                        {/* Service Terms and Conditions */}

                        <div className="col-lg-6">

                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Service Terms and Conditions
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
                                            {serviceTnC.length >
                                                0
                                                ? serviceTnC.length >
                                                    2
                                                    ? `${serviceTnC[0].name}, ${serviceTnC[1].name}... (${serviceTnC.length - 2} more)`
                                                    : serviceTnC
                                                        .map(
                                                            file =>
                                                                file.name
                                                        )
                                                        .join(
                                                            ', '
                                                        )
                                                : 'Upload Service Terms and Conditions'}
                                        </span>

                                        <label
                                            htmlFor="serviceTnCUpload"
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
                                            id="serviceTnCUpload"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={
                                                handleGalleryChange2
                                            }
                                            className={
                                                styles.hiddenInput
                                            }
                                        />

                                    </div>

                                    {errors.serviceTnC &&
                                        serviceTnC.length ===
                                        0 &&
                                        existingServiceTnC.length ===
                                        0 && (
                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.serviceTnC
                                                }
                                            </p>
                                        )}

                                </div>
                            </div>

                            {/* =================================================
                                Existing Service T&C
                            ================================================= */}

                            {existingServiceTnC.length >
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

                                                {existingServiceTnC.map(
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
                                                                        handleRemoveExistingTnC(
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

                            {serviceTnC.length >
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
                                                New Service T&C
                                            </div>

                                            <div
                                                className={
                                                    styles.galleryContainer
                                                }
                                            >

                                                {serviceTnC.map(
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
                                                                    serviceTnCPreviews[
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
                                                                    handleRemoveGalleryImage2(
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
                                                    'PU'
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
                                        disabled={bookingStatus?.value !== 'PU'}
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
            </div >
        </div >
    );
};

export default EditOfflineleads;