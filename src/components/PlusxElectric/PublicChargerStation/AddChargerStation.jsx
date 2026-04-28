import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import { MultiSelect } from "react-multi-select-component";
import { MdOutlineCloudUpload } from "react-icons/md";
import ReactInputMask from "react-input-mask"
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import MultiCustomDropdown from "../../SharedComponent/UI/CustomMultiDropdown/MultiSelectDropdown";
import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './AddCharger.module.css';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const googleMapApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const AddChargerStation = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]);
    const [errors, setErrors]                 = useState({});
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedType, setSelectedType]     = useState([])
    const [stationName, setStationName]       = useState('')
    const [chargingFor, setChargingFor]       = useState([])
    const [chargingType, setChargingType]     = useState('')
    const [chargingPoint, setChargingPoint]   = useState('')
    const [description, setDescription]       = useState('')
    const [address, setAddress]               = useState('')
    const [latitude, setLatitude]             = useState('')
    const [longitude, setLongitude]           = useState('')
    // const [open, setOpen]                     = useState(false)
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState(false);
    const [loading, setLoading]               = useState(false);

    const [availableChargingPoint, setAvailableChargingPoint] = useState('')
    const [occupiedChargingPoint, setOccupiedChargingPoint]   = useState('')

    const [timeSlots, setTimeSlots] = useState({
        Monday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Tuesday   : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Wednesday : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Thursday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Friday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Saturday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Sunday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
    });

    // const { isLoaded } = useJsApiLoader({
    //     googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    // });
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
                if (value) {
                    updatedTimeSlots[day].closeMandatory = true;
                } else {
                    updatedTimeSlots[day].closeMandatory = false;
                }
            } else if (timeType === 'close') {
                if (value) {
                    updatedTimeSlots[day].openMandatory = true;
                } else if (!updatedTimeSlots[day].open) {
                    updatedTimeSlots[day].openMandatory = false;
                }
            }
            return updatedTimeSlots;
        });
    };

    const handleCancel = () => {
        navigate('/electric/public-charger-station/public-charger-station-list')
    }
    const brandDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);

    const handleAlwaysOpenChange = (event) => {
        setIsAlwaysOpen(event.target.checked);
    };
    // const [selectedService, setSelectedService] = useState(null);
    // const handleServiceChange = (selectedOption) => setSelectedService(selectedOption);

    const handleChargingFor = (selectedOptions) => {
        setSelectedBrands(selectedOptions);
    };
    

    const handleChargingType = (selectedOption) => {
        setSelectedType(selectedOption);
    };
    const [price, setPrice] = useState(null);
    const priceOptions = [
        { value: "Free", label: "Free" },
        { value: "Paid", label: "Paid" },
    ];
    const handleLocationChange = (selectedOption) => setPrice(selectedOption);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
         if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
        }
    };
    const handleRemoveImage = () => setFile(null);

    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        // const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        const validFiles = selectedFiles.filter(file => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type));

        if (validFiles.length !== selectedFiles.length) {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
            return;
        }
        setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
        setErrors((prev) => ({ ...prev, gallery: "" }));
    };
    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    // const handleOnBlur = (value) => {
    //     const currentAddress = value
    //     const geocoder       = new window.google.maps.Geocoder();
    //     geocoder.geocode({ address: currentAddress }, (results, status) => {
    //         if (status === 'OK' && results[0]) {
    //             const lat = results[0].geometry.location.lat();
    //             const lng = results[0].geometry.location.lng();
        
    //             setLatitude(lat)
    //             setLongitude(lng)
    //         }
    //     });
    // };

    const handleOnBlur = async (address) => {
        if (!address.trim()) return;

        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapApiKey}`);
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                const lat = location.lat;
                const lng = location.lng;
                setLatitude(lat.toString());
                setLongitude(lng.toString());
            } else {
                toast.error("Could not fetch location. Please check the address.");
            }
        } catch (error) {
            console.error("Error fetching geocode:", error);
            toast.error("Failed to fetch coordinates");
        }
    };
    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);

    const validateForm = () => {
        const fields = [
            { name: "stationName",              value: stationName,             errorMessage: "Station Name is required." },
            { name: "chargerType",              value: selectedType,            errorMessage: "Charging Type is required.", isArray: true },
            { name: "chargingFor",              value: selectedBrands,          errorMessage: "Charging For is required.",  isArray: true },
            { name: "chargingPoint",            value: chargingPoint,           errorMessage: "Charging Point is required." },
            { name: "availableChargingPoint",   value: availableChargingPoint,  errorMessage: "Available Charging Point is required." },
            { name: "occupiedChargingPoint",    value: occupiedChargingPoint,   errorMessage: "Occupied Charging Point is required." },
            { name: "description",              value: description,             errorMessage: "Description is required." },
            { name: "address",                  value: address,                 errorMessage: "Address is required." },
            { name: "latitude",                 value: latitude,                errorMessage: "Latitude is required." },
            { name: "longitude",                value: longitude,               errorMessage: "Longitude is required." },
            { name: "price",                    value: price,                   errorMessage: "Price is required." },
        ];
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});

        if (chargingPoint && availableChargingPoint) {
            if (parseInt(availableChargingPoint) > parseInt(chargingPoint)) {
                newErrors.availableChargingPoint = "Available Charging Point must be less than or equal to Charging Point.";
            }
        }

        if (chargingPoint && occupiedChargingPoint) {
            if (parseInt(occupiedChargingPoint) > parseInt(chargingPoint)) {
                newErrors.occupiedChargingPoint = "Occupied Charging Point must be less than or equal to Charging Point.";
            }
        }

        if (chargingPoint && availableChargingPoint && occupiedChargingPoint) {
            if (parseInt(availableChargingPoint) + parseInt(occupiedChargingPoint) !== parseInt(chargingPoint)) {
                newErrors.availableChargingPoint = "Available, Occupied should be equal to Charging Point.";
                newErrors.occupiedChargingPoint = "Available, Occupied should be equal to Charging Point.";
            }
        }

        const hasValidTimeSlot = Object.values(timeSlots).some(
            (times) => times.open && times.close
        );
    
        if (!isAlwaysOpen && !hasValidTimeSlot) {
            newErrors["timeSlots"] = "Either select 'Always Open' or fill at least one time slot.";
        }
    
        // Validate time slots only if not always open
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
        
            if (selectedBrands && selectedBrands.length > 0) {
                const selectedBrandsString = selectedBrands.map(brand => brand.value).join(', ');
                formData.append("charging_for", selectedBrandsString);
            }
            if (selectedType) {
                formData.append("charger_type", selectedType.value);
            }
            formData.append("charging_point", chargingPoint);
            formData.append("description", description);
            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);  //
            formData.append("availableChargingPoint", availableChargingPoint);
            formData.append("occupiedChargingPoint", occupiedChargingPoint);
        
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
            postRequestWithTokenAndFile('public-charger-add-station', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/public-charger-station/public-charger-station-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in public-charger-add-station API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };

        postRequestWithToken('public-charger-station-data', obj, (response) => {
            if (response.code === 200) {

                const transformedChargingFor = (response?.data?.chargingFor || []).map(item => ({
                    label: item,
                    value: item
                }));
                const transformedChargingType = (response?.data?.chargerType || []).map(item => ({
                    value: item,
                    label: item
                }));

                setChargingFor(transformedChargingFor);
                setChargingType(transformedChargingType)
            } else {
                console.log('error in rider-details API', response);
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
        <div className={styles.addStationContainer}>

            <div className={styles.addHeading}>Add Public Chargers</div>
            <div className={styles.addStationFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="station" className={styles.labelText}>Station Name</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="stationName" placeholder="Station Name" className={styles.inputField} value={stationName} onChange={(e) => setStationName(e.target.value.slice(0, 50))} />
                                    {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="Cycle" className={styles.labelText}>Charging For</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <MultiCustomDropdown options={chargingFor} value={selectedBrands} onChange={handleChargingFor} labelledBy="Charging For" closeOnChangedValue={false} closeOnSelect={false}  enableSelectAll />
                                    {errors.chargingFor && selectedBrands.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.selectedBrands}</p>} 
                                    {/* selectAllValue={"All EV`s"} allSelectedLabel={"All EV`s"} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="selectedType" className={styles.labelText}>Charger Type</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <CustomDropdown options={chargingType} value={selectedType} onChange={handleChargingType} labelledBy="Select Service" closeOnChangedValue={false} closeOnSelect={false}/>
                                    {errors.chargerType && (!selectedType || selectedType.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="Cycle" className={styles.labelText}>Charging Point</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="chargingPoint" placeholder="Charging Point" className={styles.inputField} value={chargingPoint} 
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,4}$/.test(value)) { setChargingPoint(value); } }} />
                                    {errors.chargingPoint && chargingPoint === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingPoint}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="availableChargingPoint" className={styles.labelText}>Available Charging Point</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input disabled={!chargingPoint} type="text" autoComplete="off" id="availableChargingPoint" placeholder="Available Charging Point" className={styles.inputField} value={availableChargingPoint} 
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,4}$/.test(value)) { setAvailableChargingPoint(value); } }} />
                                    {errors.availableChargingPoint  && <p className={styles.error} style={{ color: 'red' }}>{errors.availableChargingPoint}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="occupiedChargingPoint" className={styles.labelText}>Occupied Charging Point</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input disabled={!chargingPoint} type="text" autoComplete="off" id="occupiedChargingPoint" placeholder="Occupied Charging Point" className={styles.inputField} value={occupiedChargingPoint} 
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,4}$/.test(value)) { setOccupiedChargingPoint(value); } }} />
                                    {errors.occupiedChargingPoint && <p className={styles.error} style={{ color: 'red' }}>{errors.occupiedChargingPoint}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="description" className={styles.labelText}>Description</label>
                                <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <textarea id="description" placeholder="Enter Description" className={styles.inputField} rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
                                    {errors.description && description === '' && <p className="error" style={{ color: 'red' }}>{errors.description}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="fullAddress" className={styles.labelText}>Full Address</label>
                                <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <textarea id="fullAddress" placeholder="Enter Full Address" className={styles.inputField} rows="4" value={address} onChange={(e) => setAddress(e.target.value)} onBlur={(e) => handleOnBlur(e.target.value)}/>
                                    {errors.address && address === '' && <p className="error" style={{ color: 'red' }}>{errors.address}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="location" className={styles.labelText}>Location</label>
                            <div className={`row`}>
                                <div className={`col-xl-5 col-lg-6`}>
                                    <input type="text" id="latitude" autoComplete="off" placeholder="Latitude" className={styles.inputField} value={latitude}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^-?\d*\.?\d{0,8}$/.test(value)) { setLatitude(value); } }} />
                                    {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.latitude}</p>}
                                </div>
                                <div className={`col-xl-5 col-lg-6`}>
                                    <input type="text" id="longitude" autoComplete="off" placeholder="Longitude" className={styles.inputField} value={longitude}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^-?\d*\.?\d{0,8}$/.test(value)) { setLongitude(value); } }} />
                                    {errors.longitude && longitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.longitude}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-lg-12`}>
                                    <label htmlFor="Price" className={styles.labelText}>Price</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <CustomDropdown options={priceOptions} value={price} onChange={handleLocationChange} labelledBy="" closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.price && price === null && <p className={styles.error} style={{ color: 'red' }}>{errors.price}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="Cover Image" className={styles.labelText}>Cover Image</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                        <label htmlFor="coverImage" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                        <input type="file" id="coverImage" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
                                    </div>
                                    {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                </div>
                            </div>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.galleryContainer}>
                                        {file && (
                                            <div className={styles.imageContainer}>
                                                <img alt="Preview" className={styles.previewImage} src={URL.createObjectURL(file)} />
                                                <button type="button" className={styles.removeButton} onClick={handleRemoveImage}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="Station Image" className={styles.labelText}>Station Gallery</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>
                                            {galleryFiles.length > 0
                                                ? (
                                                    galleryFiles.length > 2 ? `${galleryFiles[0].name}, ${galleryFiles[1].name}... (${galleryFiles.length - 2} more)` : galleryFiles.map(file => file.name).join(', ')
                                                    )
                                                : 'Upload Gallery Image'}
                                        </span>
                                        <label htmlFor="galleryFiles" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                        <input type="file" multiple id="galleryFiles" accept=".jpg,.jpeg,.png" onChange={handleGalleryChange} className={styles.hiddenInput} />
                                    </div>
                                    {errors.galleryFiles && <p className={styles.error} style={{ color: 'red' }}>{errors.galleryFiles}</p>}
                                </div>
                            </div>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                        <div className={styles.galleryContainer}>
                                        {galleryFiles.map((file, index) => (
                                            <div className={styles.imageContainer} key={index}>
                                                <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={URL.createObjectURL(file)} />
                                                <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <div className={styles.checkboxContainer}>
                                <label htmlFor="alwaysOpen" className={`${styles.labelContent} ${styles.labelText}`}>Open Hour
                                    <div className={`${styles.checkboxWrapper}`}>
                                        <input className={styles.checkboxInput} autoComplete="off" type="checkbox" id="alwaysOpen" checked={isAlwaysOpen} onChange={handleAlwaysOpenChange}/>
                                        <span className={styles.checkmark}></span>
                                        <span className={styles.checkboxText}>Always Open</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {!isAlwaysOpen && (
                            <div className={`row`}>
                                {[ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ].map((day, index) => (
                                    <div className="col-xl-6 col-lg-6 mb-3" key={day}>
                                        <div className="row align-items-center">
                                            <div className="col-xl-2 col-lg-4 col-md-2"><label className={styles.timeLabel}>{day}</label></div>
                                            <div className="col-xl-4 col-lg-4 col-md-5">
                                                <ReactInputMask mask="99:99" autoComplete="off" id={`${day}OpenTime`} placeholder="Enter Open Time" className={styles.inputField} value={timeSlots[day].open} onChange={handleTimeChange(day, "open")}/>
                                                {errors[`${day}OpenTime`] && ( <p className={styles.error} style={{ color: "red" }}>{errors[`${day}OpenTime`]}</p> )}
                                            </div>
                                            <div className="col-xl-4 col-lg-4 col-md-5">
                                                <ReactInputMask mask="99:99" autoComplete="off" id={`${day}CloseTime`} placeholder="Enter Close Time" className={styles.inputField} value={timeSlots[day].close} onChange={handleTimeChange(day, "close")}/>
                                                {errors[`${day}CloseTime`] && ( <p className={styles.error} style={{ color: "red" }}>{errors[`${day}CloseTime`]}</p>)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.timeSlots && <p className={styles.error} style={{ color: 'red' }}>{errors.timeSlots}</p>}
                    </div>  

                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                          {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Submit...</>
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

export default AddChargerStation;
