import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import styles from './addpod.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const EditPodForm = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedType, setSelectedType] = useState([])

    const [stationName, setStationName] = useState()
    const [chargingFor, setChargingFor] = useState([])
    const [chargingType, setChargingType] = useState()
    const [chargingPoint, setChargingPoint] = useState()
    const [description, setDescription] = useState()
    const [address, setAddress] = useState()
    const [latitude, setLatitude] = useState()
    const [longitude, setLongitude] = useState()
    const [open, setOpen] = useState(false)
    const [isAlwaysOpen, setIsAlwaysOpen] = useState(false);

    const [openDays, setOpenDays] = useState()

    const [timeSlots, setTimeSlots] = useState({
        Monday: { open: '', close: '', openMandatory: false, closeMandatory: false },
        Tuesday: { open: '', close: '', openMandatory: false, closeMandatory: false },
        Wednesday: { open: '', close: '', openMandatory: false, closeMandatory: false },
        Thursday: { open: '', close: '', openMandatory: false, closeMandatory: false },
        Friday: { open: '', close: '', openMandatory: false, closeMandatory: false },
        Saturday: { open: '', close: '', openMandatory: false, closeMandatory: false },
        Sunday: { open: '', close: '', openMandatory: false, closeMandatory: false },
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
        navigate('/public-charger-station-list')
    }

    const brandDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);

    const handleAlwaysOpenChange = (event) => {
        setIsAlwaysOpen(event.target.checked);
    };

    const [selectedService, setSelectedService] = useState(null);

    const handleChargingFor = (selectedOptions) => {
        setSelectedBrands(selectedOptions);
    };
    const handleServiceChange = (selectedOption) => setSelectedService(selectedOption);

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
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid image file.');
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


    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);

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
            { name: "file", value: file, errorMessage: "Image is required." },
            { name: "gallery", value: galleryFiles, errorMessage: "Station Gallery is required.", isArray: true },
            { name: "price", value: price, errorMessage: "Price selection is required." }
        ];

        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});

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
            postRequestWithTokenAndFile('public-charger-add-station', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message || response.message[0], { type: 'success' })
                    setTimeout(() => {
                        navigate('/public-charger-station-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], { type: 'error' })
                    console.log('Error in public-charger-add-station API:', response);
                }
            })
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
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Edit POD</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">POD ID</label>
                            <input
                                type="text"
                                id="shopName"
                                placeholder="POD ID"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">POD Design Version</label>
                            <input
                                type="text"
                                id="shopName"
                                placeholder="POD Design Version"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>

                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">Kilowatt</label>
                            <input
                                type="text"
                                id="shopName"
                                placeholder="KW"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="services">
                                Inverter Type
                            </label>
                            <div ref={serviceDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={chargingType}
                                    value={selectedType}
                                    onChange={handleChargingType}
                                    placeholder="Select Service"
                                    isClearable={true}
                                />
                                {errors.chargerType && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                            </div>
                        </div>

                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">Charger Brand</label>

                            <input
                                type="text"
                                id="chargingPoint"
                                placeholder="Charging Point"
                                className={styles.inputField}
                                value={chargingPoint}
                                // onChange={(e) => setChargingPoint(e.target.value)} 
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,4}$/.test(value)) {
                                        setChargingPoint(value);
                                    }
                                }}
                            />
                            {errors.chargingPoint && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingPoint}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">POD Date of Manufacturing</label>

                            <input
                                type="text"
                                id="chargingPoint"
                                placeholder="Charging Point"
                                className={styles.inputField}
                                value={chargingPoint}
                                // onChange={(e) => setChargingPoint(e.target.value)} 
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,4}$/.test(value)) {
                                        setChargingPoint(value);
                                    }
                                }}
                            />
                            {errors.chargingPoint && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingPoint}</p>}
                        </div>

                    </div>
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button type="submit" className={styles.editSubmitBtn}>Submit</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPodForm;

