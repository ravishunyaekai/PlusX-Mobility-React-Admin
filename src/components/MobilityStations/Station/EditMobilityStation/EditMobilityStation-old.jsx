import { useState, useRef, useEffect } from "react";
import Select from "react-select";
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './EditMobilityStation.module.css';
// import { MultiSelect } from "react-multi-select-component";
import { useNavigate, useParams } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ReactInputMask from "react-input-mask"

const EditPublicChargerStation = () => {
    const {stationId}                         = useParams()
    const navigate                            = useNavigate();
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const universityListDropdownRef           = useRef(null);
    const availableDropdownRef                = useRef(null);
    const [details, setDetails]               = useState();
    const [loading, setLoading]               = useState(false);
    const [errors, setErrors]                 = useState({});
    const [isActive, setIsActive]             = useState(false);

    const [stationName, setStationName]       = useState()
    const [available, setAvailable]           = useState([]);
    const [electric, setElectric]             = useState('');
    const [nonelectric, setNonelectric]       = useState('');
    const [university, setUniversity]         = useState([]);
    const [universityData, setUniversityData] = useState('');
    const [address, setAddress]               = useState();
    const [latitude, setLatitude]             = useState();
    const [longitude, setLongitude]           = useState();
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState(false);
    const [price, setPrice]                   = useState(null);
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]); 
    
    const availableFor = [
        { value: 'university',          label: 'university' },
        { value: 'available for all',   label: 'available for all' },
    ]

    // const universityListDropdownRef = [ 
    //     { value: 'university',          label: 'university' },
    //     { value: 'normal station',      label: 'normal station' },
    // ];

    const priceOptions = [
        { value: "Free", label: "Free" },
        { value: "Paid", label: "Paid" },
    ];

    const [timeSlots, setTimeSlots] = useState({
        Monday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Tuesday   : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Wednesday : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Thursday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Friday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Saturday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Sunday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
    });

    const handleTimeChange = (day, timeType) => (event) => {

        const value = event.target.value.replace(/[^0-9:-]/g, '');
        setTimeSlots((prev) => {
            const updatedTimeSlots = {
                ...prev,
                [day]: {
                    ...prev[day],
                    [timeType]: value,
                },
            };
            if (timeType === 'open') {
                updatedTimeSlots[day].closeMandatory = !!value;
            } else if (timeType === 'close') {
                updatedTimeSlots[day].openMandatory = !!value;
            }

            return updatedTimeSlots;
        });
    };


    const handleAlwaysOpenChange = (event) => {
        setIsAlwaysOpen(event.target.checked);
    };

    const handleUniversityList = (selectedOptions) => {
        setUniversity(selectedOptions);
    };
    
    const handleAvailableFor = (selectedOption) => {
        setAvailable(selectedOption);
    };
    // const [selectedService, setSelectedService] = useState(null);
    // const handleServiceChange = (selectedOption) => setSelectedService(selectedOption);
    
    const handleLocationChange = (selectedOption) => setPrice(selectedOption);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid Image file.');
        }
    };

    const handleRemoveImage = () => setFile(null);

    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== selectedFiles.length) {
            alert('Please upload only valid image files.');
            return;
        }

        setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
        setErrors((prev) => ({ ...prev, gallery: "" }));
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleOnBlur = (value) => {
        const currentAddress = value
    
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: currentAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
        
                setLatitude(lat)
                setLongitude(lng)
            } 
        });
    };

    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);

    // const validateForm = () => {
    //     const fields = [
    //         { name: "stationName", value: stationName, errorMessage: "Station Name is required." },
    //         { name: "chargerType", value: selectedType, errorMessage: "Charging Type is required.", isArray: true },
    //         { name: "chargingFor", value: selectedBrands, errorMessage: "Charging For is required.", isArray: true },
    //         { name: "chargingPoint", value: chargingPoint, errorMessage: "Charging Point is required." },
    //         { name: "description", value: description, errorMessage: "Description is required." },
    //         { name: "address", value: address, errorMessage: "Address is required." },
    //         { name: "latitude", value: latitude, errorMessage: "Latitude is required." },
    //         { name: "longitude", value: longitude, errorMessage: "Longitude is required." },
    //         { name: "price", value: price, errorMessage: "Price selection is required." }
    //     ];
    //     const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
    //         if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
    //             errors[name] = errorMessage;
    //         }
    //         return errors;
    //     }, {});

    //     const hasValidTimeSlot = Object.values(timeSlots).some(
    //         (times) => times.open && times.close
    //     );
    //     if (!isAlwaysOpen && !hasValidTimeSlot) {
    //         newErrors["timeSlots"] = "Either select 'Always Open' or fill at least one time slot.";
    //     }
    //     // Validate time slots only if not always open
    //     if (!isAlwaysOpen) {
    //         Object.entries(timeSlots).forEach(([day, times]) => {
    //             if (times.open && !times.close) {
    //                 newErrors[`${day}CloseTime`] = `${day} Close Time is required`;
    //             }
    //             if (times.close && !times.open) {
    //                 newErrors[`${day}OpenTime`] = `${day} Open Time is required`;
    //             }
    //         });
    //     }
    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    const validateForm = () => {
        const newErrors = {};

        if (!stationName.trim()) newErrors.stationName = "Station Name is required.";
        if (!available || !available.value) newErrors.available = "Available is required.";
        if (!electric || electric.trim() === '') newErrors.electric = "Electric cycle is required.";
        if (!nonelectric || nonelectric.trim() === '') newErrors.nonelectric = "Non Electric cycle is required.";
        if (!university || !university.value) newErrors.university = "List of Univerty is required.";
        if (!address.trim()) newErrors.address = "Address is required.";
        if (!latitude || latitude.trim() === '') newErrors.latitude = "Latitude is required.";
        if (!longitude || longitude.trim() === '') newErrors.longitude = "Longitude is required.";
        if (!price || !price.value) newErrors.price = "Price is required.";
        if (!file) newErrors.file = "Cover image is required.";
        if (!galleryFiles.length) newErrors.gallery = "At least one gallery image is required.";

        const hasValidTimeSlot = Object.values(timeSlots).some(
            (times) => times.open && times.close
        );

        if (!isAlwaysOpen && !hasValidTimeSlot) {
            newErrors["timeSlots"] = "Either select 'Always Open' or fill at least one time slot.";
        }

        if (!isAlwaysOpen) {
            Object.entries(timeSlots).forEach(([day, times]) => {
                if (times.open && !times.close) {
                    newErrors[`${day}CloseTime`] = `${day} Close Time is required`;
                }
                if (times.close && !times.open) {
                    newErrors[`${day}OpenTime`] = `${day} Open Time is required`;
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const formattedData = isAlwaysOpen ? { always_open: 1, days: [] }
                : Object.entries(timeSlots).reduce((acc, [day, times]) => {
                    if (times.open && times.close) {
                        acc.days.push(day.toLowerCase());
                        acc[`${day.toLowerCase()}_open_time`] = times.open;
                        acc[`${day.toLowerCase()}_close_time`] = times.close;
                    }
                    return acc;
                }, { days: [] });

            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("station_name", stationName);
            formData.append("available", available.value);
            formData.append("electric", electric);
            formData.append("nonelectric", nonelectric);
            formData.append("listofuniversity", university.value);
            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            // if (selectedBrands && selectedBrands.length > 0) {
            //     const selectedBrandsString = selectedBrands.map(brand => brand.value).join(', ');
            //     formData.append("charging_for", selectedBrandsString);
            // }
            // if (selectedType) {
            //     let selected = '';

            //     if (Array.isArray(selectedType)) {
            //         selected = selectedType.map(type => type.value).join('');
            //     } else {
            //         selected = selectedType.value;
            //     }
            //     formData.append("charger_type", selected);
            // }
            // formData.append("description", description);
            formData.append("status", isActive === true ? 1 : 0);

            if (price) {
                formData.append("price", price.value);
            }
            formData.append("always_open", formattedData.always_open || 0);

            if (isAlwaysOpen) {
                formData.append("days[]", formattedData.days);
            } else {
                formattedData.days.forEach(day => formData.append("days[]", day));
            }
            if (!isAlwaysOpen) {
                Object.keys(formattedData).forEach(key => {
                    if (key !== 'days' && key !== 'always_open') {
                        formData.append(key, formattedData[key]);
                    }
                });
            }
            if (file) {
                formData.append("cover_image", file);
            }
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((galleryFile) => {
                    formData.append("shop_gallery", galleryFile);
                });
            }
            postRequestWithTokenAndFile('public-charger-edit-station', formData, async (response) => {
                if (response.status === 1) {
            
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/mobility/station-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in public-charger-add-station API:', response);
                    setLoading(false);
                }
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchDetails = () => {
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            station_id : stationId
        };
        postRequestWithToken('public-charger-station-details', obj, (response) => {
            
            if (response.code === 200) {
                const data = response?.data || {};
                
                const openDays = data.open_days.split('_') .map(day => {
                    const trimmedDay = day.trim();
                    return trimmedDay.charAt(0).toUpperCase() + trimmedDay.slice(1).toLowerCase();
                });

                const openTimings = data.open_timing.split('_');
                const updatedTimeSlots = { ...timeSlots };

                openDays.forEach((day, index) => {
                    if (updatedTimeSlots[day] && openTimings[index]) {
                        const [openTime, closeTime] = openTimings[index].split('-');
                        updatedTimeSlots[day].open = openTime;
                        updatedTimeSlots[day].close = closeTime;
                        updatedTimeSlots[day].openMandatory = true;
                        updatedTimeSlots[day].closeMandatory = true;
                    }
                });
                setIsAlwaysOpen(data.always_open === 0);
                const selectedPrice = priceOptions.find(option => option.value === data.price);
                setPrice(selectedPrice);
                setTimeSlots(updatedTimeSlots);
                setDetails(data);
                setStationName(data?.station_name || "");
                setAvailable(availableFor.find(opt => opt.value === data.available) || null);
                setUniversity(universityListDropdownRef.find(opt => opt.value === data.university) || null);
                setElectric(data.electric || '');
                setNonelectric(data.nonelectric || '');
                setAddress(data?.address || "");
                setLatitude(data?.latitude || "");
                setLongitude(data?.longitude || "");
                setFile(data?.station_image || "");
                setGalleryFiles(response?.gallery_data || []);
                setIsAlwaysOpen(data?.always_open === 1 ? true : false)
                setIsActive(data?.status)

                // setChargingFor(data?.charging_for || []);
                // setChargingType(data?.charger_type || []);
                // setChargingPoint(data?.charging_point || "");
                // setDescription(data?.description || "");

                

                // setAvailableChargingPoint(data?.available_charging_point || 0);
                // setOccupiedChargingPoint(data?.occupied_charging_point || 0);

                // const transformedChargingFor = (response?.result?.chargingFor || []).map(item => ({
                //     label: item,
                //     value: item
                // }));
                // setChargingFor(transformedChargingFor);

                // const initialSelectedBrands = transformedChargingFor.length ?
                //     [{ label: transformedChargingFor[0].label, value: transformedChargingFor[0].value }] : [];

                // const initialSelectedBrands = ( data?.charging_for.split(", ") || []).map(item => ({ 
                //     label: item,
                //     value: item
                // }));
                // setSelectedBrands(initialSelectedBrands);

                // const transformedChargingType = (response?.result?.chargerType || []).map(item => ({
                //     label: item,
                //     value: item
                // }));
                // const initialChargerType = transformedChargingType.find(item => item.value === data.charger_type) || {};

                // // setChargingType(transformedChargingType);
                // // setSelectedType(initialChargerType);

            } else {
                console.error('Error in public-charger-station-details API', response);
            }
        });

        postRequestWithToken('university-list', obj, (response) => {
            if (response.code === 200) {
    
                const universityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.university_id
                }));
                setUniversityData(universityList);
            } else {
                console.log('error in university-list API', response);
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

    const handleCancel = () => {
        navigate('/mobility/station-list')
    }    

    const handleToggle = () => {
        setIsActive((prevState) => !prevState);
    };

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Edit Public Chargers</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">Station Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="stationnName"
                                placeholder="Station Name"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>
                        {/* <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="availableBrands">Charging For</label>
                            <div ref={brandDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={chargingFor}
                                    value={selectedBrands}
                                    onChange={handleChargingFor}
                                    labelledBy="Charging For"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.chargingFor && selectedBrands.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingFor}</p>}
                        </div> */}
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="available">
                                Available For
                            </label>
                            <div ref={availableDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={availableFor}
                                    value={available}
                                    onChange={handleAvailableFor}
                                    placeholder="Select available for"
                                    isClearable={true}
                                />
                            </div>
                            {errors.available && (!available || available.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.available}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="electric">
                                Electric Cycle
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="electric"
                                placeholder="Electric Cycle"
                                className={styles.inputField}
                                value={electric}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,8}$/.test(value)) { setElectric(value); }
                                }}
                            />
                            {errors.electric && electric === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.electric}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="nonelectric">
                                Non Electric Cycle
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="nonelectric"
                                placeholder="Non Electric Cycle"
                                className={styles.inputField}
                                value={nonelectric}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,8}$/.test(value)) { setNonelectric(value); }
                                }}
                            />
                            {errors.nonelectric && nonelectric === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.nonelectric}</p>}
                        </div>
                    </div>

                    {available?.value === 'university' && (
                        <div className={styles.row}>
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="university">
                                    Type of Station
                                </label>
                                <div ref={universityListDropdownRef}>
                                    <Select
                                        className={styles.addShopSelect}
                                        options={universityData}
                                        value={university}
                                        onChange={handleUniversityList}
                                        placeholder="Select Station Type"
                                        isClearable={true}
                                    />
                                </div>
                                {errors.university && (!university || university.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.university}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                            </div>
                        </div>
                    )}

                    <div className={styles.row}>
                        {/* <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter description"
                                className={styles.inputField}
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && description === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                        </div> */}
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="fullAddress">Full Address</label>
                            <textarea
                                id="fullAddress"
                                placeholder="Enter full address"
                                className={styles.inputField}
                                rows="4"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                onBlur={(e) => handleOnBlur(e.target.value)}
                            />
                            {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                        </div>
                    </div>
                    <div className={styles.locationRow}>

                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="latitude">Latitude</label>
                            <input type="text"
                                id="latitude"
                                 autoComplete="off"
                                placeholder="Latitude"
                                className={styles.inputField}
                                value={latitude}
                                // onChange={(e) => setLatitude(e.target.value)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                        setLatitude(value);
                                    }
                                }}
                            />
                            {/* {errors.latitude && latitude == '' && <p className="error">{errors.latitude}</p>} */}
                            {errors.latitude && !latitude?.trim() && <p className="error">{errors.latitude}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="longitude">Longitude</label>
                            <input type="text"
                             autoComplete="off"
                                id="longitude"
                                placeholder="Longitude"
                                className={styles.inputField}
                                value={longitude}
                                // onChange={(e) => setLongitude(e.target.value)}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                        setLongitude(value);
                                    }
                                }}
                            />
                            {/* {errors.longitude && longitude == '' &&  <p className="error">{errors.longitude}</p>} */}
                            {errors.longitude && !longitude?.trim() && <p className="error">{errors.longitude}</p>}

                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="location">Price</label>
                            <Select
                                options={priceOptions}
                                value={price}
                                onChange={handleLocationChange}
                                placeholder="Select"
                                isClearable
                                className={styles.addShopSelect}
                            />
                            {errors.price && price == null && <p className="error">{errors.price}</p>}
                        </div>
                    </div>
                    <div className={styles.scheduleSection}>
                        <div className={styles.alwaysOpen}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    className={styles.checkboxInput}
                                    type="checkbox"
                                    id="alwaysOpen"
                                    checked={isAlwaysOpen}
                                    onChange={handleAlwaysOpenChange}
                                />
                                <span className={styles.checkmark}></span>
                                <div className={styles.checkboxText}>Always Open</div>
                            </label>
                        </div>


                        {!isAlwaysOpen && (
                            <div className={styles.timeSlotContainer}>
                                {Object.keys(timeSlots).map(day => (
                                    <div className={styles.dayRow} key={day}>
                                        <span className={styles.dayLabel}>{day}</span>

                                        <label htmlFor={`${day}OpenTime`} className={styles.inputLabel}>
                                            Open Time
                                            <ReactInputMask
                                                 mask="99:99"
                                                id={`${day}OpenTime`}
                                                placeholder="Enter time"
                                                className={styles.timeField}
                                                value={timeSlots[day].open}
                                                onChange={handleTimeChange(day, 'open')}
                                            />
                                            {errors[`${day}OpenTime`] && <p className="error">{errors[`${day}OpenTime`]}</p>}
                                        </label>

                                        <label htmlFor={`${day}CloseTime`} className={styles.inputLabel}>
                                            Close Time
                                             <ReactInputMask
                                                mask="99:99"
                                                id={`${day}CloseTime`}
                                                placeholder="Enter time"
                                                className={styles.timeField}
                                                value={timeSlots[day].close}
                                                onChange={handleTimeChange(day, 'close')}
                                            />
                                            {errors[`${day}CloseTime`] && <p className="error">{errors[`${day}CloseTime`]}</p>}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.timeSlots && <p className={styles.error} style={{ color: 'red' }}>{errors.timeSlots}</p>}
                    </div>
                    
                    <div className={styles.toggleContainer}>
                        <label className={styles.statusLabel}>Status</label>
                        <div className={styles.toggleSwitch} onClick={handleToggle}>
                            <div
                                className={`${styles.toggleButton} ${isActive ? styles.activeToggle : styles.inactiveToggle
                                    }`}
                            >
                                <div className={styles.slider}></div>
                            </div>
                            <span
                                className={`${styles.toggleText} ${isActive ? styles.activeText : styles.inactiveText
                                    }`}
                            >
                                {isActive ? ' Occupied' : 'Available'}
                            </span>
                        </div>
                    </div>
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Cover Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="coverFileUpload"
                                accept=".jpeg,.jpg"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {!file ? (
                                <label htmlFor="coverFileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    {/* <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} /> */}
                                    <img
                                        src={
                                            typeof file === 'string'
                                                ? `${process.env.REACT_APP_DIR_UPLOADS}charging-station-images/${file}`
                                                : URL.createObjectURL(file)
                                        }
                                        alt="Preview"
                                        className={styles.previewImage}
                                    />
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="error">{errors.file}</p>}
                    </div>

                    {/* Station Gallery Multiple Image Upload */}
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Station Gallery</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="galleryFileUpload"
                                accept=".jpeg,.jpg"
                                multiple
                                onChange={handleGalleryChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="galleryFileUpload" className={styles.fileUploadLabel}>
                                <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                <p>Select Files to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                            </label>
                        </div>
                        {Array.isArray(galleryFiles) && galleryFiles && (
                            <div className={styles.galleryContainer}>
                                { galleryFiles.map( (file, index) => (
                                    <div className={styles.imageContainer} key={index}>
                                        <img
                                            key={index}
                                            src={
                                                typeof file === 'string'
                                                    ? `${process.env.REACT_APP_DIR_UPLOADS}charging-station-images/${file}`
                                                    : URL.createObjectURL(file)
                                            }
                                            alt={`Preview ${index + 1}`}
                                            className={styles.previewImage}
                                        />
                                        <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}>
                                            <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                        </button>
                                    </div>
                                ) ) }
                            </div>
                        )}
                        {errors.gallery && <p className="error">{errors.gallery}</p>}
                    </div>
                    {/* <div className={styles.actions}>
                        <button className={styles.submitBtn} type="submit">Submit</button>
                    </div> */}

                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submit...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPublicChargerStation;
