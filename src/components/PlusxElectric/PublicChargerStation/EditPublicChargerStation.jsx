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

const EditPublicChargerStation = () => {
    const {stationId}                         = useParams();
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
    const [showLoader, setShowLoader]         = useState(false);

    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedType, setSelectedType]     = useState([])
    const [isActive, setIsActive] = useState(false);

    const [stationName, setStationName]       = useState()
    const [chargingFor, setChargingFor]       = useState([])
    const [chargingType, setChargingType]     = useState()
    const [chargingPoint, setChargingPoint]   = useState()
    const [description, setDescription]       = useState()
    const [address, setAddress]               = useState()
    const [latitude, setLatitude]             = useState()
    const [longitude, setLongitude]           = useState()
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

    const handleChargingFor = (selectedOptions) => {
        setSelectedBrands(selectedOptions);
    };
    
    const handleChargingType = (selectedOption) => {
        setSelectedType(selectedOption);
    };
    
    const handleLocationChange = (selectedOption) => setPrice(selectedOption);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
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
            { name: "stationName", value: stationName, errorMessage: "Station Name is required." },
            { name: "chargerType", value: selectedType, errorMessage: "Charging Type is required.", isArray: true },
            { name: "chargingFor", value: selectedBrands, errorMessage: "Charging For is required.", isArray: true },
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
            formData.append("station_id", stationId);
            formData.append("station_name", stationName);

            if (selectedBrands && selectedBrands.length > 0) {
                const selectedBrandsString = selectedBrands.map(brand => brand.value).join(', ');
                formData.append("charging_for", selectedBrandsString);
            }
            if (selectedType) {
                let selected = '';

                if (Array.isArray(selectedType)) {
                    selected = selectedType.map(type => type.value).join('');
                } else {
                    selected = selectedType.value;
                }
                formData.append("charger_type", selected);
            }
            formData.append("charging_point", chargingPoint);
            formData.append("description", description);
            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("status", isActive === true ? 1 : 0);
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
            if (file?.file instanceof File) {
                formData.append("cover_image", file.file);
            }

            galleryFiles.forEach(img => {
                if (img.file instanceof File) {
                    formData.append("shop_gallery", img.file);
                }
            });
            postRequestWithTokenAndFile('public-charger-edit-station', formData, async (response) => {
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
            });
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    const fetchDetails = () => {
        setShowLoader(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            station_id : stationId
        };

        postRequestWithToken('public-charger-station-details', obj, (response) => {
            if (response.code === 200) {
                const data = response?.data || {};
                const baseUrl = response?.base_url || "";
                setImageBaseUrl(response?.base_url || "");
                
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
                setStationName(data?.station_name || "");
                setChargingFor(data?.charging_for || []);
                setChargingType(data?.charger_type || []);
                setChargingPoint(data?.charging_point || "");
                setDescription(data?.description || "");
                setAddress(data?.address || "");
                setLatitude(data?.latitude || "");
                setLongitude(data?.longitude || "");
                // setFile(data?.station_image || "");
                // setGalleryFiles(response?.gallery_data || []);
                setFile({
                    name: data?.station_image || [],
                    url : `${baseUrl}${data?.station_image}`,
                    type: "image/*",
                    file: null,
                });
                const galleryArr = (response?.gallery_data || []).map((img) => ({
                    name: img,
                    url : `${baseUrl}${img}`,
                    type: "image/jpeg",
                    file: null,
                }));
                setGalleryFiles(galleryArr);
                setIsAlwaysOpen(data?.always_open === 1 ? true : false)
                setIsActive(data?.status)
                setAvailableChargingPoint(data?.available_charging_point || 0);
                setOccupiedChargingPoint(data?.occupied_charging_point || 0);

                const transformedChargingFor = (response?.result?.chargingFor || []).map(item => ({
                    label: item,
                    value: item
                }));
                setChargingFor(transformedChargingFor);

                const initialSelectedBrands = ( data?.charging_for.split(", ") || []).map(item => ({ 
                    label: item,
                    value: item
                }));
                setSelectedBrands(initialSelectedBrands);

                const transformedChargingType = (response?.result?.chargerType || []).map(item => ({
                    label: item,
                    value: item
                }));
                const initialChargerType = transformedChargingType.find(item => item.value === data.charger_type) || {};

                setChargingType(transformedChargingType);
                setSelectedType(initialChargerType);

            } else {
                console.error('Error in public-charger-station-details API', response);
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

    const handleCancel = () =>  navigate('/electric/public-charger-station/public-charger-station-list')

    const handleToggle = () =>  setIsActive((prevState) => !prevState);

    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader/> :
                <>
                    <div className={styles.addHeading}>Edit Public Chargers</div>
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
                                            {errors.chargingPoint && chargingPoint.length < 9 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingPoint}</p>}
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
                                                { file && imageBaseUrl && (
                                                    <div className={styles.imageContainer}>
                                                        {/* <img alt="Preview" className={styles.previewImage} src={URL.createObjectURL(file)} /> */}
                                                        <img alt="Preview" className={styles.previewImage} src={file.url ? file.url : URL.createObjectURL(file)} />
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
                                                    { galleryFiles.length > 0 ? (
                                                        galleryFiles.length > 2 ? `${galleryFiles[0].name}, ${galleryFiles[1].name}... (${galleryFiles.length - 2} more)`
                                                            : galleryFiles.map(file => file.name).join(', ') ) : 'Upload Gallery Image'
                                                    }
                                                    {/* {galleryFiles.length > 0 ? galleryFiles.map((file) => file.name).join(', ') : 'Upload Gallery Image' } */}
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
                                                { galleryFiles.map((file, index) => (
                                                    <div className={styles.imageContainer} key={index}>
                                                        <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={file.url} />
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
                </>
            }
        </div>
    );
};

export default EditPublicChargerStation;
