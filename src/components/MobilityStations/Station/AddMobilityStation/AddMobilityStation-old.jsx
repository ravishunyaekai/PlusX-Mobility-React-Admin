import { useState, useRef, useEffect } from "react";
import styles from "./AddMobilityStation.module.css";
import Select from "react-select";
import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken, getRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import ReactInputMask from "react-input-mask"
import 'react-toastify/dist/ReactToastify.css';
 
const AddChargerStation = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const universityListDropdownRef           = useRef(null);
    const cityListDropdownRef                 = useRef(null);

    const availableDropdownRef                = useRef(null);
    
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
 
    const [stationName, setStationName]       = useState('');
    const [available, setAvailable]           = useState([]);
    const [electric, setElectric]             = useState('');
    const [nonelectric, setNonelectric]       = useState('');
    const [university, setUniversity]         = useState([]);
    const [city, setCity]                     = useState([]);

    const [universityData, setUniversityData] = useState('');
    const [cityData, setcityData]         = useState([]);

    const [latitude, setLatitude]             = useState('');
    const [longitude, setLongitude]           = useState('');
    const [address, setAddress]               = useState('');
    const [price, setPrice]                   = useState(null);
    const [isAlwaysOpen, setIsAlwaysOpen]     = useState(false);
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]);
    
 
    const [timeSlots, setTimeSlots] = useState({
        Monday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Tuesday   : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Wednesday : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Thursday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Friday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Saturday  : { open: '', close: '', openMandatory: false, closeMandatory: false },
        Sunday    : { open: '', close: '', openMandatory: false, closeMandatory: false },
    });
 
    const availableFor = [
        { value: 'university',          label: 'university' },
        { value: 'available for all',   label: 'available for all' },
    ]
 
    // const universityOptions = [ 
    //     { value: 'university',          label: 'university' },
    //     { value: 'normal station',      label: 'normal station' },
    // ];
 
    const priceOptions = [
        { value: "Free", label: "Free" },
        { value: "Paid", label: "Paid" },
    ];
 
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
        navigate('/mobility/station-list')
    }
    
    const handleAlwaysOpenChange = (event) => {
        setIsAlwaysOpen(event.target.checked);
    };
 
    const handleUniversityList = (selectedOptions) => {
        setUniversity(selectedOptions);
    };
    const handlecityityList = (selectedOptions) => {
        setCity(selectedOptions);
    };
    
    const handleAvailableFor = (selectedOption) => {
        setAvailable(selectedOption);
    };
    
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
        const geocoder       = new window.google.maps.Geocoder();
        geocoder.geocode({ address: currentAddress }, (results, status) => {
 
            if (status === 'OK' && results[0]) {
                const lat = results[0].geometry.location.lat();
                const lng = results[0].geometry.location.lng();
        
                setLatitude(lat)
                setLongitude(lng)
            }
        });
    };
 
    // const handleOnBlur = (value) => {
    //     const currentAddress = value;
 
    //     // Check if Google Maps API is loaded
    //     if (!window.google || !window.google.maps) {
    //         console.warn("Google Maps API is not loaded.");
    //         return;
    //     }
 
    //     const geocoder = new window.google.maps.Geocoder();
    //     geocoder.geocode({ address: currentAddress }, (results, status) => {
    //         if (status === 'OK' && results[0]) {
    //             const lat = results[0].geometry.location.lat();
    //             const lng = results[0].geometry.location.lng();
 
    //             console.log("Fetched coordinates:", lat, lng);
    //             setLatitude(lat);
    //             setLongitude(lng);
    //         }
    //     });
    // };
 
    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);
    
    const validateForm = () => {
        const newErrors = {};
 
        if (!stationName.trim()) newErrors.stationName = "Station Name is required.";
        if (!available || !available.value) newErrors.available = "Available is required.";
        if (!electric || electric.trim() === '') newErrors.electric = "Electric cycle is required.";
        if (!nonelectric || nonelectric.trim() === '') newErrors.nonelectric = "Non Electric cycle is required.";
        if (!university || !university.value) newErrors.university = "List of Univerty is required.";
        // if (!city || !city.value) newErrors.city = "City required.";

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
             formData.append("country_id", userDetails?.country_id);
            //  formData.append("city_id", userDetails?.city_id);


 
            formData.append("station_name", stationName);
            formData.append("availableFor", available.value);
            formData.append("electric", electric);
            formData.append("nonelectric", nonelectric);
            formData.append("unversity_id", university.value);
            // formData.append("station_city_id", city.value);

            formData.append("address", address);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
        
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
            postRequestWithTokenAndFile('add-mobility-station', formData, async (response) => {
                
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
        // city list apis
        
    };
    
    // useEffect(() => {
    //     if (!userDetails || !userDetails.access_token) {
    //         navigate('/login');
    //         return;
    //     }
    //     fetchDetails();
    // }, []);

    useEffect(() => {
        if (
            available?.value === 'university' && 
            userDetails?.access_token
        ) {
            fetchDetails();
        }
    }, [available]);

    useEffect(() => {
        if(city){
            getCityList();

        }     
    }, [city]);
     const getCityList = () => {
    const obj = {
        userId: userDetails?.user_id,
        email: userDetails?.email,
        requirement: "city"
    };

   
    postRequestWithToken('state-country-list', obj, (response) => {
        if (response.code === 200) {
            const cityList = (response?.data || []).map(item => ({
                label: item.name,
                value: item.city_id
            }));
            setcityData(cityList);
        } else {
            console.log('error in state-country-list API', response);
        }
    });
};


    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Add Mobility Station</div>
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
                                Electric Cycle Unit
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="electric"
                                placeholder="Electric Cycle Unit"
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
                                Non Electric Cycle Unit
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="nonelectric"
                                placeholder="Non Electric Cycle Unit"
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
                                <label className={styles.addShopLabel} htmlFor="universityList">
                                    List of University
                                </label>
                                <div ref={universityListDropdownRef}>
                                    <Select
                                        className={styles.addShopSelect}
                                        options={universityData}
                                        value={university}
                                        onChange={handleUniversityList}
                                        placeholder="Select University"
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
                            <div className={styles.addShopInputContainer}>
                                <label className={styles.addShopLabel} htmlFor="cityList">
                                   Cities
                                </label>
                                <div ref={cityListDropdownRef}>
                                    <Select
                                        className={styles.addShopSelect}
                                        options={cityData}
                                        value={city}
                                        onChange={handlecityityList}
                                        placeholder="Select City"
                                        isClearable={true}
                                    />
                                </div>
                                {errors.city && (!city || city.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                            </div>
                            <div className={styles.addShopInputContainer}>
                            </div>
                        </div>
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
                            {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.latitude}</p>}
                        </div>
 
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="longitude">Longitude</label>
                            <input type="text"
                                id="longitude"
                                 autoComplete="off"
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
                            {errors.longitude && longitude === '' &&  <p className={styles.error} style={{ color: 'red' }}>{errors.longitude}</p>}
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
                            {errors.price && price === null &&<p className={styles.error} style={{ color: 'red' }}>{errors.price}</p>}
                        </div>
 
                    </div>
 
                    <div className={styles.scheduleSection}>
                        <div className={styles.alwaysOpen}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    className={styles.checkboxInput}
                                     autoComplete="off"
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
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                    <div className={styles.dayRow} key={day}>
                                        <span className={styles.dayLabel}>{day}</span>
 
                                        <label htmlFor={`${day}OpenTime`} className={styles.inputLabel}>
                                        <span className={styles.openSection}> Open Time</span>
                                            <ReactInputMask
                                                 mask="99:99"
                                                id={`${day}OpenTime`}
                                                placeholder="Enter time"
                                                className={styles.timeField}
                                                value={timeSlots[day].open}
                                                onChange={handleTimeChange(day, 'open')}
                                            />
                                            {errors[`${day}OpenTime`] && <p className={styles.error} style={{ color: 'red' }}>{errors[`${day}OpenTime`]}</p>}
                                        </label>
 
 
                                        <label htmlFor={`${day}CloseTime`} className={styles.inputLabel}>
                                        <span className={styles.openSection}> Close Time</span>
                                           
                                            <ReactInputMask
                                                mask="99:99"
                                                id={`${day}CloseTime`}
                                                placeholder="Enter time"
                                                className={styles.timeField}
                                                value={timeSlots[day].close}
                                                onChange={handleTimeChange(day, 'close')}
                                            />
                                            {errors[`${day}CloseTime`] && <p className={styles.error} style={{ color: 'red' }}>{errors[`${day}CloseTime`]}</p>}
                                        </label>
 
                                    </div>
                                ))}
                            </div>
 
                        )}
                         {errors.timeSlots && <p className={styles.error} style={{ color: 'red' }}>{errors.timeSlots}</p>}
                    </div>
 
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Cover Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="coverFileUpload"
                                // accept="image/*"
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
                                    <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} />
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                        <AiOutlineClose size={20} style={{ padding: '2px', color: "#fff" }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                    </div>
 
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Station Gallery</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="galleryFileUpload"
                                // accept="image/*"
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
                        { galleryFiles && (
                            <div className={styles.galleryContainer}>
                                {galleryFiles.map((image, index) => (
                                    <div className={styles.imageContainer} key={index}>
                                        <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} className={styles.previewImage} />
                                        <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}>
                                            <AiOutlineClose size={20} style={{ padding: '2px', color: "#fff"}} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.gallery && <p className={styles.error} style={{ color: 'red' }}>{errors.gallery}</p>}
                    </div>
 
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                          {loading ? (
                            <> <span className="spinner-border spinner-border-sm me-2"></span> Submit... </>
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