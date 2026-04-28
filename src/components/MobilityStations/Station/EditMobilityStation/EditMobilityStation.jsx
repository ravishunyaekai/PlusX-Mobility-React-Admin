import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from "./EditMobilityStation.module.css";
import { MdOutlineCloudUpload } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineClose } from 'react-icons/ai';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import Modal from "../../../SharedComponent/Modal/Modal";
import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import Loader from "../../../SharedComponent/Loader/Loader";
// import UploadIcon from '../../../../assets/images/uploadicon.svg';
import ReactInputMask from "react-input-mask"
import 'react-toastify/dist/ReactToastify.css';

const googleMapApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
 
const EditMobilityStation = () => {
    const {stationId}                         = useParams();
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const [defaultCenter, setDefaultCenter]   = useState({ lat: 28.4595, lng: 77.0266 });
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
    const [showLoader, setShowLoader]         = useState(false);
 
    const [stationID, setStationID]           = useState('');
    const [stationName, setStationName]       = useState('');
    const [available, setAvailable]           = useState([]);
    const [state, setState]                   = useState([]);
    const [stateOptions, setStateOptions]     = useState([]);
    const [city, setCity]                     = useState([]);
    const [CityOptions, setCityOptions]       = useState([]);
    const [address, setAddress]               = useState('');
    const [latitude, setLatitude]             = useState('');
    const [longitude, setLongitude]           = useState('');
    const [buildingName, setBuildingName]     = useState('');
    const [ecycle, setEcycle]                 = useState('');
    const [cycle, setCycle]                   = useState('');
    const [serviceFor, setServiceFor]         = useState([]);
    const [oprName, setOprName]               = useState('');
    const [oprContact, setOprContact]         = useState('');
    const [oprEmail, setOprEmail]             = useState('');
    const [universityName, setUniversityName] = useState('');
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState('');
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]);
    const [imageBaseUrl, setImageBaseUrl]     = useState("");

    const [isOpenHour, setIsOpenHour]             = useState(true);
    const [serviceStartTime, setServiceStartTime] = useState('');
    const [serviceEndtTime, setserviceEndtTime]   = useState('');

    const [timeSlots, setTimeSlots] = useState({
            Monday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
            Tuesday   : { open: '', close: '', openMandatory: false, closeMandatory: false },
            Wednesday : { open: '', close: '', openMandatory: false, closeMandatory: false },
            Thursday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
            Friday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
            Saturday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
            Sunday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        });

    const userObj = {
        userId     : userDetails?.user_id,
        email      : userDetails?.email,
        country_id : userDetails?.country_id,
    };
    const handleCancel = () => { 
        navigate('/mobility/mobility-station/station-list')
    }
    const serviceForOptions = [
        { value : "paid",   label : "Paid"},
        { value : "unpaid", label : "Unpaid"}
    ]
 
    const availableForOptions = [
        {value : "Everyone",   label : "Everyone"},
        {value : "University", label : "College/ University"}
    ]
 
    function handleStateChange(value) {
        setState(value);
    }
 
    function handleCityChange(value) {
        setCity(value);
    }
    function handleServiceChange(selectedOption) {
        setServiceFor(selectedOption);
 
        if (selectedOption?.value === "everyone") {
            setUniversityName("");
        }
    }
    function handleAvailableChange(selectedOption) {
        setAvailable(selectedOption);
    }
    function handleKeyDown(event) {
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
            event.preventDefault();
        }
    }
    function handleModal() {
        setIsModalOpen(true);
    }
    function handleCloseModal() {
        setIsModalOpen(false);
    }
    function handleAddress() {
        setIsModalOpen(false);
    }
    const handleAlwaysOpenChange = (event) => {
        setIsAlwaysOpen(event.target.checked);
    };
    
    // const handleLocationChange = (selectedOption) => setPrice(selectedOption);
 
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            // setFile(selectedFile);
            setFile({
                file: selectedFile,
                name: selectedFile.name,
                url: URL.createObjectURL(selectedFile),
                type: selectedFile.type,
            });
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
        const mappedFiles = validFiles.map(file => ({
            file,
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
        }));
        setGalleryFiles((prev) => [...prev, ...mappedFiles]);
        // setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
        // setErrors((prev) => ({ ...prev, gallery: "" }));
    };

    const handleRemoveGalleryImage = (file) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (!confirmDelete) return;

        if (!file?.id) {
            setGalleryFiles((prevFiles) => prevFiles.filter((f) => f !== file));
            return;
        }

        if (confirmDelete) {
            const obj = {
                userId      : userDetails?.user_id,
                email       : userDetails?.email,
                image_id    : file.id,
                requirement : "station",
            };
            postRequestWithToken("delete-image", obj, (response) => {
                if (response.code === 200) {
                    toast.success(response?.message);
                    setGalleryFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
                } else {
                    toast.error(response?.message);
                }
            });
        }
    }

    const handleOnBlur = async (address) => {

        try {
            const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                setLatitude(location.lat.toString());
                setLongitude(location.lng.toString());
            } else {
                toast.error("Could not fetch location. Please check the address.");
            }
        } catch (error) {
            console.error("Error fetching geocode:", error);
            toast.error("Failed to fetch coordinates");
        }
    };
    
    async function handleMapClick(lat, lng) {
        setDefaultCenter({ lat, lng });
        try {
            const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapApiKey}`);
            const data = await geocodeRes.json();

            if (data.results && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                const address = data.results[0].formatted_address;

                setLatitude(location.lat.toString());
                setLongitude(location.lng.toString());
                setAddress(address);
            } else {
                toast.error("Could not fetch location. Please check the address.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            toast.error("Something went wrong while fetching location.");
        }
    };

    function fetchDetails() {
        setShowLoader(true);
        postRequestWithToken("mobility-station-details", { ...userObj, stationId }, (response) => {
            if (response.code === 200 && response.status === 1) {

                const stationData = response.data.station;
                const baseUrl = response.data.base_url || "";
                setImageBaseUrl(response?.data?.base_url || "");

                setStationID(stationData.station_id || "");
                setStationName(stationData.station_name || "");
                setAddress(stationData.address || "");
                setLatitude(stationData.latitude || "");
                setLongitude(stationData.longitude || "");
                setBuildingName(stationData.building_name || "");
                setCycle(stationData.no_cycle?.toString() || "");
                setEcycle(stationData.no_ecyle?.toString() || "");
                setOprName(stationData.operator_name || "");
                setOprEmail(stationData.operator_email || "");

                setOprContact(stationData.operator_contact || "");

                // Available for (Dropdown)
                const availableOption = availableForOptions.find((opt) => opt.value === stationData.available_for);
                setAvailable(availableOption || null);

                // Service For (Dropdown)
                const serviceOption = serviceForOptions.find((opt) => opt.value === stationData.price_type);
                setServiceFor(serviceOption || null);
                setUniversityName(stationData.university || "");
                setIsAlwaysOpen(stationData.always_open === 1);
                setIsOpenHour(stationData.always_open === 0);

                setState({ label: stationData.state_name, value: stationData.state_id });
                setCity({  label: stationData.city_name, value: stationData.city_id });

                setServiceStartTime(stationData.open_time || "");
                setserviceEndtTime(stationData.close_time || "");

                setFile({
                    name: stationData?.station_image || [],
                    url : `${baseUrl}${stationData?.station_image}`,
                    type: "image/*",
                    file: null,
                });
                const galleryArr = (response?.data?.imgName || []).map((img, index) => ({
                    name: img,
                    url : `${baseUrl}${img}`,
                    id  : response?.data?.imgId?.[index],
                    type: "image/jpeg",
                    file: null,
                }));
                setGalleryFiles(galleryArr);

            } else {
                console.error("Error in mobility-station-details API", response);
            }
            setShowLoader(false);
        });
    }

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);
    
    const validateForm = () => {
        const fields = [
            { name: "stationName",       value: stationName,       errorMessage: "Station Name is required." },
            { name: "address",           value: address,           errorMessage: "Address is required." },
            { name: "latitude",          value: latitude,          errorMessage: "Latitude is required." },
            { name: "longitude",         value: longitude,         errorMessage: "Longitude is required." },
            { name: "ecycle",            value: ecycle,            errorMessage: "E-Cycle is required." },
            { name: "cycle",             value: cycle,             errorMessage: "Cycle is required." },
            { name: "oprName",           value: oprName,           errorMessage: "Operator Name is required." },
            { name: "oprEmail",          value: oprEmail,          errorMessage: "Operator Email is required." },
            { name: "file",              value: file,              errorMessage: "Cover Image is required." },

            { name: "state",      value: state?.value,      errorMessage: "State is required.",   isArray: true },
            { name: "city",       value: city?.value,       errorMessage: "City is required.",    isArray: true },
            { name: "serviceFor", value: serviceFor?.value, errorMessage: "Service is required.", isArray: true },
            { 
                name         : "available",  
                value        : available?.value,    
                errorMessage : "Available For is required.", 
                isArray      : true 
            }, { 
                name         : "galleryFiles",
                value        : galleryFiles,
                errorMessage : "At least one gallery image is required.", 
                isArray      : true 
            },
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});

        if (!stationID) {
            newErrors.stationID = "Station ID is required.";

        } else if (!/^S0[A-Z0-9]+$/.test(stationID)) {
            newErrors.stationID = "Station ID must start with 'S0'";
        }
        if (!oprContact) {
            newErrors.oprContact = "Operator Contact is required.";

        } else if (!/^\d{10,12}$/.test(oprContact)) {
            newErrors.oprContact = "Contact must be 10 to 12 digits.";
        }
        if (available?.value === "University" && !universityName) {
            newErrors.universityName = "University Name is required.";
        }
        if (!isAlwaysOpen && !serviceStartTime) {
            newErrors.serviceStartTime = `Start Time is required`;
        }
        if (!isAlwaysOpen && !serviceEndtTime) {
            newErrors.serviceEndtTime = `End Time is required`;
        }
        console.log(newErrors)
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
 
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (validateForm()) {
             
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("station_id", stationId);
            formData.append("email", userDetails?.email);
            formData.append("country_id", userDetails?.country_id);
 
            // formData.append("station_id", stationID);
            formData.append("station_name", stationName);
            formData.append("available_for", available.value);
            formData.append("state_id", state.value);
            formData.append("station_city_id", city.value);
            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("building_name", buildingName);
            formData.append("no_ecyle", ecycle);
            formData.append("no_cycle", cycle);
            formData.append("price_type", serviceFor.value);
            formData.append("always_open", isAlwaysOpen === true ? 1 : 0);
            formData.append("university",  available?.value === "University" ? universityName:"");
            formData.append("operator_name", oprName);
            formData.append("operator_contact", oprContact);
            formData.append("operator_email", oprEmail); 

            formData.append("service_start_time", serviceStartTime);
            formData.append("service_end_time", serviceEndtTime);
                     
            if (file?.file instanceof File) {
                formData.append("cover_image", file.file);
            }
            galleryFiles.forEach(img => {
                if (img.file instanceof File) {
                    formData.append("station_gallery", img.file);
                }
            });
            postRequestWithTokenAndFile('edit-mobility-station', formData, async (response) => {
                 if (response.status === 1) {
                    toast.success(response.message || response.message[0])
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/mobility/mobility-station/station-list');
                    }, 1000);
                } else {
                    toast.error(response.message || response.message[0])
                    console.log('Error in edit-mobility-station API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    function getStates() {
        postRequestWithToken('state-country-list', { ...userObj, requirement: "state" }, (response) => {
            if (response.code === 200) {
                const stateList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.state_id
                }));
            setStateOptions(stateList);
            } else {
                console.log('error in state-country-list API', response);
            }
        });
    }

    function getCities() {
        postRequestWithToken('state-country-list', { ...userObj, requirement: "city",station_state_id:state.value  }, (response) => {
            if (response.code === 200) {
                const cityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.city_id
                }));
            setCityOptions(cityList);
            } else {
                console.log('error in state-country-city-list API', response);
            }
        });
    }

    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader /> : 
                <>
                    <div className={styles.addHeading}>Edit Station</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Station ID" className={styles.labelText}>Station ID</label>
                                            <input disabled type="text" autoComplete="off" id="stationID" placeholder="Station ID (e.g. S0XXX)" className={styles.inputField} value={stationID} 
                                            onChange={(e) => {
                                                const value = e.target.value.toUpperCase();
                                                setStationID(value);
                                            }} />
                                            {errors.stationID && <p className={styles.error} style={{ color: 'red' }}>{errors.stationID}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Station Name" className={styles.labelText}>Station Name</label>
                                            <input type="text" autoComplete="off" id="stationnName" placeholder="Station Name" className={styles.inputField} value={stationName} onChange={(e) => setStationName(e.target.value)} />
                                            {errors.stationName && stationName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="State" className={styles.labelText}>State</label>
                                            <CustomDropdown options={stateOptions} value={state} onChange={handleStateChange} placeholder="Select State" onMenuOpen={getStates}/>
                                            {errors.state && state.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.state}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="City" className={styles.labelText}>City</label>
                                            <CustomDropdown options={CityOptions} value={city} onChange={handleCityChange} placeholder="Select City" onMenuOpen={getCities}/>
                                            {errors.city && city.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Address</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-8 col-lg-9`}>
                                            <input type="text" autoComplete="off" id="address" placeholder="Station Address" className={styles.inputField}
                                                value={address} onChange={(e) => setAddress(e.target.value)} onBlur={(e) => handleOnBlur(e.target.value)} />
                                            {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                                        </div>
                                        <div className={`col-xl-2 col-lg-3`}>
                                            <button className={styles.mapButton} onClick={handleModal} type="button">Map</button>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className={`col-lg-6 col-lg-2`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Location</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <input type="text" id="latitude" autoComplete="off" placeholder="Latitude" className={styles.inputField} value={latitude}
                                                // onChange={(e) => setLatitude(e.target.value)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                                        setLatitude(value);
                                                    }
                                                }}
                                            />
                                            {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.latitude}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <input type="text" id="longitude" autoComplete="off" placeholder="Longitude" className={styles.inputField} value={longitude}
                                                // onChange={(e) => setLongitude(e.target.value)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) {
                                                        setLongitude(value);
                                                    }
                                                }}
                                            />
                                            {errors.longitude && longitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.longitude}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Building Name</label>
                                        <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="address" placeholder="Building/Apartment Name" className={styles.inputField}
                                                value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
                                            {errors.buildingName && buildingName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.buildingName}</p>}
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle" className={styles.labelText}>E-Cycle Unit</label>
                                            <input type="text" autoComplete="off" id="ecycle" placeholder="No. of E-Cycle" className={styles.inputField} value={ecycle}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                                    setEcycle(value);
                                                }}
                                            />
                                            {errors.ecycle && ecycle === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.ecycle}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle" className={styles.labelText}>Cycle Unit</label>
                                            <input type="text" autoComplete="off" id="cycle" placeholder="No. of Cycle" className={styles.inputField} value={cycle}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                                    setCycle(value);
                                                }}
                                            />
                                            {errors.cycle && cycle === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.cycle}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <label htmlFor="Cycle" className={styles.labelText}>Service Charge For</label>
                                            <CustomDropdown options={serviceForOptions} value={serviceFor} onChange={handleServiceChange} placeholder="Paid for Everyone"/>
                                            {errors.serviceFor && serviceFor.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.serviceFor}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Available For" className={styles.labelText}>Available For</label>
                                            <CustomDropdown options={availableForOptions} value={available} onChange={handleAvailableChange} placeholder="Available For"/>
                                            {errors.available && available.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.available}</p>}
                                        </div>
                                        {available?.value === "University" && (
                                            <div className={`col-xl-5 col-lg-6`}>
                                                <label htmlFor="University Name" className={styles.labelText}>University</label>
                                                <input type="text" autoComplete="off" id="universityName" placeholder="University/College Name" className={styles.inputField} value={universityName} onChange={(e) => setUniversityName(e.target.value)}/>
                                                {errors.universityName && universityName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.universityName}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle" className={styles.labelText}>Operator Name</label>
                                            <input type="text" autoComplete="off" id="oprName" placeholder="Operator Name" className={styles.inputField} value={oprName} onChange={(e) => setOprName(e.target.value)} />
                                            {errors.oprName && oprName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.oprName}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle" className={styles.labelText}>Operator Contact</label>
                                            <input type="text" autoComplete="off" id="oprContact" placeholder="Operator Contact" className={styles.inputField} value={oprContact} 
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setOprContact(value.slice(0, 12)); 
                                                }} />
                                            {errors.oprContact && <p className={styles.error} style={{ color: 'red' }}>{errors.oprContact}</p>}
                                        </div>
                                        <div className={`col-xl-10 col-lg-6`}>
                                            <label htmlFor="Cycle" className={styles.labelText}>Operator Email</label>
                                            <input type="text" autoComplete="off" id="oprEmail" placeholder="Operator Name" className={styles.inputField} value={oprEmail} onChange={(e) => setOprEmail(e.target.value)} />
                                            {errors.oprEmail && oprEmail === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.oprEmail}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <label htmlFor="Cover" className={styles.labelText}>Cover Image</label>
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
                                                { file && imageBaseUrl &&  (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={file.url} />
                                                        <button type="button" className={styles.removeButton} onClick={handleRemoveImage}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <label htmlFor="Gallery Image" className={styles.labelText}>Gallery Image</label>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>
                                                    { galleryFiles.length > 0 ? (
                                                        galleryFiles.length > 2 ? `${galleryFiles[0].name}, ${galleryFiles[1].name}... (${galleryFiles.length - 2} more)`
                                                            : galleryFiles.map(file => file.name).join(', ') ) : 'Upload Gallery Image'
                                                    }
                                                    {/* {galleryFiles.length > 0 ? galleryFiles.map((file) => file.name).join(', ') : 'Upload Gallery Image' } */}
                                                </span>
                                                <label htmlFor="galleryFiles" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" multiple id="galleryFiles" accept=".jpg,.jpeg,.png" onChange={handleGalleryChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.galleryFiles && galleryFiles.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.galleryFiles}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                { galleryFiles.map((file, index) => (
                                                    <div className={styles.imageContainer} key={index}>
                                                        <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={file.url} />
                                                        <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(file)}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
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
                                        <label htmlFor="OpenHoure" className={`${styles.labelContent} ${styles.labelText}`} style={{ display : "inline-flex", marginRight: "15px" }} >
                                            <div className={`${styles.checkboxWrapper}`}>
                                                <input className={styles.checkboxInput} 
                                                    type="checkbox" 
                                                    id="OpenHoure" 
                                                    checked={isOpenHour} 
                                                    onChange={() => {
                                                        setIsOpenHour(true);
                                                        setIsAlwaysOpen(false);
                                                    }} 
                                                />
                                                <span htmlFor="OpenHoure" className={styles.checkmark}></span>
                                                <span htmlFor="OpenHoure" className={styles.checkboxText}>Open Hour</span>
                                            </div>
                                        </label>
                                        <label htmlFor="alwaysOpen" className={`${styles.labelContent} ${styles.labelText}`}  style={{ display : "inline-flex" }}>
                                            <div className={`${styles.checkboxWrapper}`}>
                                                <input 
                                                    className={styles.checkboxInput} 
                                                    type="checkbox" 
                                                    id="alwaysOpen" 
                                                    checked={isAlwaysOpen} 
                                                    onChange={() => {
                                                        setIsAlwaysOpen(true);
                                                        setIsOpenHour(false);
                                                    }}
                                                />
                                                <span className={styles.checkmark}></span>
                                                <span className={styles.checkboxText}>Always Open</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {!isAlwaysOpen && (
                                    <div className={`row`}>
                                        <div className="col-xl-6 col-lg-6 mb-3">
                                            <div className="row align-items-center">
                                                <div className="col-xl-3 col-lg-4 col-md-2" style={{width:"18%"}}>
                                                    <label className={styles.timeLabel}>Every Day</label>
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-5">
                                                    <ReactInputMask mask="99:99" autoComplete="off" id={`serviceStartTime`} placeholder="Enter Start Time" className={styles.inputField} value={serviceStartTime} onChange={ (e) => setServiceStartTime(e.target.value) }/>
        
                                                    {errors.serviceStartTime && serviceStartTime === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.serviceStartTime}</p>}
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-5">
                                                    <ReactInputMask mask="99:99" autoComplete="off" id={`serviceEndtTime`} placeholder="Enter End Time" className={styles.inputField} value={serviceEndtTime} onChange={ (e) => setserviceEndtTime(e.target.value) }/>
        
                                                    {errors.serviceEndtTime && serviceEndtTime === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.serviceEndtTime}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                )}
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

                    <Modal isOpen={isModalOpen} heading= "Address" buttonName="Add" onClose={handleCloseModal} onSubmit={handleAddress}>
                        <div className={styles.modalContainer}>
                            <APIProvider apiKey={googleMapApiKey}>
                                <Map style={{width: '100%', height: '300px'}} defaultCenter={defaultCenter} defaultZoom={11} gestureHandling={'greedy'} disableDefaultUI={true} />
                                <Marker position={defaultCenter} draggable={true} onDragEnd={ (e) => handleMapClick( e.latLng.lat(), e.latLng.lng() ) } />
                            </APIProvider>
                        </div>
                    </Modal>
                </>
            }
        </div>
    );
};
 
export default EditMobilityStation;