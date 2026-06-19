import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineCloudUpload } from "react-icons/md";
import ReactInputMask from "react-input-mask"
import styles from './AddCharger.module.css';
import MultiCustomDropdown from "../../SharedComponent/UI/CustomMultiDropdown/MultiSelectDropdown";
import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";
// import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";
// setChargingType
const EditChargeShare = () => {
    const {charger_id}                         = useParams();
    
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
    const [showLoader, setShowLoader]         = useState(false);
 
   
    const [selectedType, setSelectedType]     = useState([])
    
    const [selectedChargerType, setSelectedChargerType]     = useState()
     const [latitude, setLatitude]             = useState()
     const [longitude, setLongitude]           = useState()
    const [landmark, setLandmark]             = useState("")
     const [buldingNumber, setbuldingNumber]           = useState()
     const [streetNumber, setStreetNumber]           = useState()
     const [parkingNumber, setParkingNumber]       = useState()
    const [parkingFloor, setParkingFloor]       = useState()
    const [description, setDescription]       = useState()
 
    const [isActive, setIsActive] = useState(false);
    const [chargerName , setChargerName]=useState();
    const [timings, setTimings] = useState([]);
   
    const [customerName , setCustomerName]=useState();
    const [customerEmail , setCustomerEmail]=useState();
    const [customerMobile , setCustomerMobile]=useState();
 
 
               
 
  
    const [state, setState]                   = useState([]);
    const [stateOptions, setStateOptions]     = useState([]);
    const [city, setCity]                     = useState([]);
    const [CityOptions, setCityOptions]       = useState([]);
    const [loadingStates, setLoadingStates]   = useState(false);
    const [loadingCities, setLoadingCities]   = useState(false);
    const [outputcharger, setOutputcharger]                   = useState([]);
     const [compatibleOptions,setCompatibleOptions]=useState([]);
    const [selectedCompatible, setSelectedCompatible] = useState([]);
 
     const [daysOptions,setaDaysOptions]=useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
 
 
    const [outputchargerOptions,setOutputchargerOptions]=useState([]);
    const [loadingoutputeCharger, setLoadingoutputeCharger]   = useState(false);
    const [connectorOptions,setConnectorOptions]=useState([]);
    const [selectedConnector, setSelectedConnector] = useState([]);
    
 
    const [dbOutputValue, setDbOutputValue] = useState(null);
 
 
 
    
 
    // const [chargerName, setchargerName]       = useState()
    const [chargingFor, setChargingFor]       = useState([])
    const [chargingType, setChargingType]     = useState()
    
    const [chargingPoint, setChargingPoint]   = useState()
   
    const [address, setAddress]               = useState()
   
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState(false);
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]); 
    
    const [imageBaseUrl, setImageBaseUrl]     = useState("");
    const [availableChargingPoint, setAvailableChargingPoint] = useState('')
    const [occupiedChargingPoint, setOccupiedChargingPoint]   = useState('')
    const [price, setPrice] = useState(null);
    const priceOptions = [
        { value: "Free", label: "Free" },
        { value: "Paid", label: "Paid" },
    ];
    const timeOptions = [
        { value: "Am", label: "Am" },
        { value: "Pm", label: "Pm" },
    ];
    const chargerOptions=[
        { value: "AC", label: "AC" },
        { value: "DC", label: "DC" }
    ]
    const userObj = {
        userId     : userDetails?.user_id,
        email      : userDetails?.email,
        charger_id : charger_id
    };
    const ALL_DAYS_OPTIONS = [
        { value: "All Days", label: "All Days" },
        { value: "Sunday", label: "Sunday" },
        { value: "Monday", label: "Monday" },
        { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" },
        { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" },
        { value: "Saturday", label: "Saturday" }
    ];
function getStates() {
        setLoadingStates(true);
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
            setLoadingStates(false);
        });
    }
 
   function getCities() {
        setLoadingCities(true);
        
        postRequestWithToken('state-country-list', { ...userObj, requirement: "city" ,station_state_id:state.value }, (response) => {
            if (response.code === 200) {
                const cityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.city_id
                }));
            setCityOptions(cityList);
            } else {
                console.log('error in state-country-city-list API', response);
            }
            setLoadingCities(false);
        });
    }
 
   function getOutputCharger() {
        // setLoadingCities(true);
        //outputcharger.value
       
        postRequestWithToken('output-power-and-connector-list', { ...userObj, requirement:selectedChargerType.value }, (response) => {
            if (response.code === 200) {
                const option_list= (response?.data || []).map(item => ({
                    label: item.value,
                    value: item.value
                }));
                // console.log("option_list",option_list)
            // setCityOptions(cityList);
            setOutputchargerOptions(option_list)
 
            } else {
                console.log('error in state-country-city-list API', response);
            }
            setLoadingCities(false);
        });
    }
 
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
 
    
 
      const handleConnector = (selectedOptions) => {
       
        setSelectedConnector(selectedOptions)
    };
 
    
    
    const handleChargingType = (selectedOption) => {
      
        setSelectedChargerType(selectedOption)
    };
    
    const handleLocationChange = (selectedOption) => setPrice(selectedOption);
 
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            setFile(selectedFile);
            // setFile({
            //     file: selectedFile,
            //     name: selectedFile.name,
            //     url: URL.createObjectURL(selectedFile),
            //     type: selectedFile.type,
            // });
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
        }
    };
 function handleStateChange(value) {
        setState(value);
    }
 
    function handleCityChange(value) {
        setCity(value);
    }
     function handleOutputChange(value) {
        setOutputcharger(value);
    }
   
 
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
        setErrors((prev) => ({ ...prev, gallery: "" }));
        // setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
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
 
    const validateForm = () => {
        const fields = [
            { name: "chargerName", value: chargerName, errorMessage: "Charger Name is required." },
            { name: "chargerType", value: selectedType, errorMessage: "Charging Type is required.", isArray: true },
            // { name: "chargingFor", value: selectedBrands, errorMessage: "Charging For is required.", isArray: true },
            { name: "chargingPoint", value: chargingPoint, errorMessage: "Charging Point is required." },
            { name: "description", value: description, errorMessage: "Description is required." },
            { name: "address", value: address, errorMessage: "Address is required." },
            { name: "latitude", value: latitude, errorMessage: "Latitude is required." },
            { name: "longitude", value: longitude, errorMessage: "Longitude is required." },
            { name: "price", value: price, errorMessage: "Price selection is required." }
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});
        
        
 
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
const handleCompatibility = (selectedOptions) =>{
       setSelectedCompatible(selectedOptions||[])
      
    }
 
//handleCompatibility
const handledays = (selectedOptions) =>{
       setSelectedDays(selectedOptions)
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
 
        // if (validateForm()) {
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("charger_id", charger_id);
            formData.append("charger_name", chargerName);
            // formData.append("latitude", latitude);
            // formData.append("longitude", longitude);
            formData.append("description", description);
            formData.append("bulding_name", buldingNumber);

            
            formData.append("street_number", streetNumber);
            formData.append("landmark", landmark);
            formData.append("city", city.label);
            formData.append("state", state.label);
            formData.append("parkingNumber", parkingNumber);
            formData.append("parking_floor", parkingFloor);
            const compatibleNames = selectedCompatible.map(opt => opt.label);
 
            formData.append("compatible", JSON.stringify(compatibleNames));
            formData.append("Connector", selectedConnector.value);
            const openDaysNames = selectedDays.map(opt => opt.label);
            formData.append("open_days", JSON.stringify(openDaysNames));
            formData.append("outputcharger", outputcharger.value);
            const formattedTimings = timings.filter(t => t.fromTime && t.toTime).map(t => `${t.fromTime}${t.fromMeridiem.value}-${t.toTime}${t.toMeridiem.value}`);
            formData.append("open_timing", JSON.stringify(formattedTimings));
            // const chargerTypeNames = selectedChargerType.map(opt => opt.label);
            formData.append("charger_type", selectedChargerType.value);
            if (file) {
                formData.append("charger_image", file);
            }
            postRequestWithTokenAndFile('charge-share-edit', formData, async (response) => {
                if (response.code === 200) {
            
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/charge-share/charge-share-list');
                    }, 1000);
                } else {
           toast.error(
            response.message?.[0] ||
            response.message ||
            'Something went wrong'
        );
                    console.log('Error in charge-share-edit:', response);
                    setLoading(false);
                }
            });
        // } else {
        //     toast.error("Some fields are missing");
        //     setLoading(false);
        // }
    };
 
 
    const fetchDetails = () => {
        setShowLoader(true);    
         postRequestWithToken('charge-share-detail', userObj, (response) => {
            if (response.code === 200) {
                const data = response?.data || {};
                const baseUrl = response?.base_url || "";
                setImageBaseUrl(baseUrl || "");
                setCustomerName(data?.rider_name)
                setCustomerEmail(data?.email)
                setCustomerMobile(data?.mobile)
                setChargerName(data?.charger_name || "");
                setDbOutputValue(data?.output || null);

                setSelectedChargerType( { label: data?.charger_type ,value: data?.charger_type } || '');
 
                // const dbChargeType = data?.charger_type; 
                // const selectedOption = chargerOptions.find(opt => opt.value === dbChargeType);
               
                setState({ label: data.state, value: data.state_id });
                setCity({ label: data.city, value: data.city_id });
                setOutputcharger({ label: data.output, value: data.output })
                       
                // const selectedOutputoption= 
                // setSelectedChargerType(selectedOption ? [selectedOption] : []);
        
                // connector type
                
 
                setSelectedConnector({ label: data.connector_type, value: data.connector_type });
 
                // compatible
                const compatible_options = data?.compatible || [];
                setCompatibleOptions(compatible_options);
                
                const dbCompatibleTypes = data?.compatible_type || [];
 
                const selectedCompatible = compatible_options.filter(
                opt => dbCompatibleTypes.includes(opt.value)
                        );
 
                setSelectedCompatible(selectedCompatible);
                setLandmark(data?.landmark);
                setbuldingNumber(data?.building_name);
                setStreetNumber(data?.street_name)
                setParkingNumber(data?.park_no)
                setParkingFloor(data?.park_floor)
                setDescription(data?.description)
                setLatitude(data?.latitude);
                setLongitude(data?.longitude);
                // ----- DAYS -----
                setaDaysOptions(ALL_DAYS_OPTIONS);
 
                const dbOpenDays = data?.open_days || [];
 
                // map DB days to dropdown objects
                const selectedDaysList = ALL_DAYS_OPTIONS.filter(
                opt => dbOpenDays.includes(opt.value)
                );
 
                setSelectedDays(selectedDaysList);
 
                
 
                // ===== OPEN TIMING (MULTIPLE SLOTS) =====
                if (Array.isArray(data?.open_timing)) {
 
                const parsedTimings = data.open_timing.map(item => {
                    const [from, to] = item.split('-');
 
                    return {
                    fromTime: from.slice(0, -2),                 // "10:00"
                    fromMeridiem: {
                        value: from.slice(-2),                     // "AM"
                        label: from.slice(-2)
                    },
                    toTime: to.slice(0, -2),                     // "11:00"
                    toMeridiem: {
                        value: to.slice(-2),                       // "PM"
                        label: to.slice(-2)
                    }
                    };
                });
 
                setTimings(parsedTimings);
                }
                        
                setFile({
                    name: data?.charger_image,
                    url: `${response?.base_url}${data?.charger_image}`,
                    type: "image/*"
                });                
            } else {
                console.error('Error in charge-share-detail API', response);
            }
            setShowLoader(false);
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
        postRequestWithToken("charge-share-reject", { ...userObj, chargerName,charger_id }, (response) => {
            if (response.code === 200 && response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/charge-share/charge-share-list');
                    }, 1000)

              
            }else{

                toast.error(
                    response.message?.[0] ||
                    response.message ||
                    'Something went wrong'
                );

                setLoading(false);
            }
        
        })
    }
   
 
    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader/> :
                <>
                    <div className={styles.addHeading}>Edit Charger Share</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit}>
                             
                                                        <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="location" className={styles.labelText}>Contact Information</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <input type="text" disabled id="customerName" autoComplete="off" placeholder="Name" className={styles.inputField} value={customerName}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) { setLatitude(value); } }} />
                                            {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.customerName}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <input type="text"  disabled id="longitude" autoComplete="off" placeholder="Mobile" className={styles.inputField} value={customerMobile}
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
                                            <label htmlFor="Price" className={styles.labelText}>Email</label>
                                            <div className={`row`}>
                                                <div className={`col-xl-10 col-lg-12`}>
                                                   <input type="text" disabled id="longitude" autoComplete="off" placeholder="Email" className={styles.inputField} value={customerEmail}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^-?\d*\.?\d{0,8}$/.test(value)) { setLongitude(value); } }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
 
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="station" className={styles.labelText}>Charger Name</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="chargerName" placeholder="Charger Name" className={styles.inputField} value={chargerName} onChange={(e) => setChargerName(e.target.value.slice(0, 50))} />
                                            {errors.chargerName && chargerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Type Of Charger</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <CustomDropdown options={chargerOptions} value={selectedChargerType} onChange={handleChargingType} labelledBy="Select Charger Type" onMenuOpen={getOutputCharger} closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.chargerType && (!chargerOptions || chargerOptions.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="selectedType" className={styles.labelText}>Output Power</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                           
                                             <CustomDropdown options={outputchargerOptions} value={outputcharger} onChange={handleOutputChange} placeholder="Select output" onMenuOpen={getOutputCharger} isLoading={loadingoutputeCharger}/>
                                            {errors.outputcharger && (!outputcharger || outputcharger.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.outputcharger}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Type Of Connector</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <CustomDropdown options={connectorOptions} value={selectedConnector} onChange={handleConnector} labelledBy="Select Connector  Type" closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.selectedConnector && (!connectorOptions || connectorOptions.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
 
 
                                          </div>
                                    </div>
                                </div>
                            </div>
 
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Compatible" className={styles.labelText}>Compatible With</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <MultiCustomDropdown options={compatibleOptions} value={selectedCompatible} onChange={handleCompatibility} labelledBy="Compatible" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll  />
                                    {errors.selectedCompatible && selectedCompatible.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.selectedCompatible}</p>}
                                        </div>
                                    </div>
                                </div>
                                 <div className={`col-lg-6`}>
                                    
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Parking Number" className={styles.labelText}>Parking Number</label>
                                             <input  type="text" autoComplete="off" id="parkingNumber" placeholder="Parking Number" className={styles.inputField} value={parkingNumber} 
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                 setParkingNumber(value);  }} />
                                            {errors.parkingNumber && <p className={styles.error} style={{ color: 'red' }}>{errors.parkingNumber}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Parking Number" className={styles.labelText}>Parking Floor</label>
                                             <input type="text" id="parking_floor"  placeholder="Parking Floor" className={styles.inputField} value={parkingFloor}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                     setParkingFloor(value);  }} />
                                        </div>
                                    </div>
                                </div>
                                {/* <div className={`col-lg-6`}>
                                    <label htmlFor="parkingNumber" className={styles.labelText}>Parking Number</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input  type="text" autoComplete="off" id="parkingNumber" placeholder="Parking Number" className={styles.inputField} value={parkingNumber} 
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                 setParkingNumber(value);  }} />
                                            {errors.parkingNumber && <p className={styles.error} style={{ color: 'red' }}>{errors.parkingNumber}</p>}
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                             <div className={`row`}>
                                 <div className={`col-lg-6`}>
                                    {/* <label htmlFor="location" className={styles.labelText}>Open Hours</label> */}
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="state" className={styles.labelText}>State</label>
                                           <CustomDropdown options={stateOptions} value={state} onChange={handleStateChange} placeholder="Select State" onMenuOpen={getStates} isLoading={loadingStates}/>
                                    {errors.state && state.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.state}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="city" className={styles.labelText}>City</label>
                                           <CustomDropdown options={CityOptions} value={city} onChange={handleCityChange} placeholder="Select City" onMenuOpen={getCities} isLoading={loadingCities}/>
                                    {errors.city && city.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                                        </div>
                                    </div>
                                </div>
                                
 
                                
                                   
                                
                            {/* new row */}
                            <div className={`col-lg-6`}>
                                    {/* <label htmlFor="location" className={styles.labelText}>Open Hours</label> */}
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="landmark" className={styles.labelText}>Landmark</label>
                                            <input type="text" id="landmark" placeholder="Landmark" className={styles.inputField} value={landmark}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setLandmark(value); } } />
                                            {errors.landmark && landmark === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.landmark}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="bulding_number" className={styles.labelText}>Building Name</label>
                                             <input type="text" id="bulding_number"  placeholder="Building Name" className={styles.inputField} value={buldingNumber}
                                                onChange={(e) => {
                                                    const value = e.target.value;   setbuldingNumber(value);  }} />
                                            {errors.buldingNumber && buldingNumber === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.buldingNumber}</p>}
                                        </div>
                                    </div>
                                </div>
                                
                            </div>  
 
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="description" className={styles.labelText}>Address</label>
                                        <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <textarea id="streetNumber" placeholder="Enter Address" className={styles.inputField} rows="4" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} />
                                            {errors.streetNumber && streetNumber === '' && <p className="error" style={{ color: 'red' }}>{errors.streetNumber}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="fullAddress" className={styles.labelText}>Description</label>
                                        <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <textarea id="description" placeholder="Enter Description" className={styles.inputField} rows="4" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={(e) => handleOnBlur(e.target.value)}/>
                                            {errors.description && description === '' && <p className="error" style={{ color: 'red' }}>{errors.description}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            {/* <div className={`row`}>
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
                                            <label htmlFor="Price" className={styles.labelText}>Parking Floor</label>
                                            <div className={`row`}>
                                                <div className={`col-xl-10 col-lg-12`}>
                                                   <input type="text" id="parking_floor"  placeholder="Parking Floor" className={styles.inputField} value={parkingFloor}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                     setParkingFloor(value);  }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
 
                           
 
                             
                            {timings.map((slot, index) => (
  <div className="row" key={index}>
 
    {/* TIME FROM */}
    <div className="col-lg-6">
      <label className={styles.labelText}>Time From</label>
      <div className="row">
        <div className="col-xl-5 col-lg-6">
          <input
             
            type="text"
            autoComplete="off"
            placeholder="Time From"
            className={styles.inputField}
            value={slot.fromTime}
            onChange={(e) => {
              const updated = [...timings];
              updated[index].fromTime = e.target.value;
              setTimings(updated);
            }}
          />
        </div>
 
        <div className="col-xl-5 col-lg-6">
          <CustomDropdown
            options={timeOptions}   // AM / PM
            value={slot.fromMeridiem}
            onChange={(val) => {
              const updated = [...timings];
              updated[index].fromMeridiem = val;
              setTimings(updated);
            }}
            closeOnChangedValue={false}
            closeOnSelect={false}
          />
        </div>
      </div>
    </div>
 
    {/* TIME TO */}
    <div className="col-lg-6">
      <label className={styles.labelText}>Time To</label>
      <div className="row">
        <div className="col-xl-5 col-lg-6">
          <input
            type="text"
            autoComplete="off"
            placeholder="Time To"
            className={styles.inputField}
            value={slot.toTime}
            onChange={(e) => {
              const updated = [...timings];
              updated[index].toTime = e.target.value;
              setTimings(updated);
            }}
          />
        </div>
 
        <div className="col-xl-5 col-lg-6">
          <CustomDropdown
            options={timeOptions}
            value={slot.toMeridiem}
            onChange={(val) => {
              const updated = [...timings];
              updated[index].toMeridiem = val;
              setTimings(updated);
            }}
            closeOnChangedValue={false}
            closeOnSelect={false}
          />
        </div>
      </div>
    </div>
 
  </div>
))}
 
  <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="charger_image" className={styles.labelText}>Image</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                                <label htmlFor="charger_image" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" id="charger_image" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                {file && imageBaseUrl && (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={file.url ? file.url : URL.createObjectURL(file)} />
                                                        <button type="button" className={styles.removeButton} onClick={handleRemoveImage}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-lg-12`}>
                                            <label htmlFor="Price" className={styles.labelText}>Days</label>
                                            <div className={`row`}>
                                                <div className={`col-xl-10 col-lg-12`}>
                                                     <MultiCustomDropdown options={daysOptions} value={selectedDays} onChange={handledays} labelledBy="Days" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll  />
                                    {errors.selectedDays && selectedDays.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.selectedDays}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            <div className={`row`}>
                                <div className={`col-xl-11 col-lg-12`}>
                                    <div className={`row`}>
                                        <div className={`col-lg-12 ${styles.editButton}`}>
                                            <button  type="button" className={styles.editCancelBtn} onClick={() => handleCancel()}>Reject</button>
                                            {loading ? (
                                                <> <span className="spinner-border spinner-border-sm me-2"></span> Accept... </>
                                            ) : (
                                                "reject"
                                            )}

                                            <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                                            {loading ? (
                                                <> <span className="spinner-border spinner-border-sm me-2"></span> Accept... </>
                                            ) : (
                                                "Accept"
                                            )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                        </form>
                    </div>
                </>
            }
        </div>
    );
};
 
export default EditChargeShare;