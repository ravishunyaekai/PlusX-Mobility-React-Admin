import React, { useEffect, useState } from 'react';
import styles from './addcharger.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithToken, postRequestWithTokenAndFile } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';

import Select from 'react-select';

const EditPortableCharger = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                            = useNavigate()
    const {chargerId}                         = useParams()
    const [details, setDetails]               = useState()
    const [file, setFile]                     = useState();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [chargerName, setChargerName]       = useState("");
    const [chargerPrice, setChargerPrice]     = useState("");
    const [chargerType, setChargerType]       = useState("");
    const [chargerFeature, setChargerFeature] = useState("");
    const [errors, setErrors]                 = useState({});

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast('Please upload a valid image file.', {type:'error'})
        }
    };

    const handleRemoveImage = () => {
        setFile(null);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const backButtonClick = () => {
        navigate('/home-charger/charger-list')
    };
    const validateForm = () => {
        const newErrors = {};
        let formIsValid = true;

        if (!chargerName) {
            newErrors.chargerName = "Charger Name is required.";
            formIsValid = false;
        }
        if (!chargerPrice || isNaN(chargerPrice) || chargerPrice <= 0) {
            newErrors.chargerPrice = "Please enter a valid Charger Price.";
            formIsValid = false;
        }
        if (!chargerType) {
            newErrors.chargerType = "Charger Type is required.";
            formIsValid = false;
        }
        if (!chargerFeature) {
            newErrors.chargerFeature = "Charger Feature is required.";
            formIsValid = false;
        }
        if (!file) {
            newErrors.file = "Image is required.";
            formIsValid = false;
        }
        setErrors(newErrors);
        return formIsValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {

            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("charger_id", chargerId);
            formData.append("charger_name", chargerName);
            formData.append("charger_price", chargerPrice);
            formData.append("charger_feature", chargerFeature);
            formData.append("charger_type", chargerType);
            formData.append("status", "1");

            // Append new image file if a new file is selected, skip if it's the existing image URL
            if (file instanceof File) {
                formData.append("charger_image", file);
            }

            postRequestWithTokenAndFile('edit-charger', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    
                    setTimeout(() => {
                        navigate('/home-charger/charger-list')
                    }, 2000);
                } else {
                    toast(response.message[0], {type:'error'})
                    console.log('error in edit-charger api', response);
                }
            });
        } else {
            console.log("Form validation failed.");
        }
    };
    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            charger_id: chargerId
        };
        postRequestWithToken('charger-details', obj, (response) => {
            if (response.code === 200) {
                const data = response.data || {};
                setDetails(data);

                // Pre-fill the form fields with fetched details
                setChargerName(data.charger_name || "");
                setChargerPrice(data.charger_price || "");
                setChargerType(data.charger_type || "");
                setChargerFeature(data.charger_feature || "");
                setFile(data.image || "")

            } else {
                console.log('error in charger-slot-details API', response);
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

    const [isActive, setIsActive] = useState(false);

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    return (
        <div className={styles.containerCharger}>
            <h2 className={styles.title}>Edit Charger</h2>
            <div className={styles.chargerSection}>
                <form className={styles.form} onSubmit={handleSubmit}>
                <ToastContainer />
                    <div className={styles.row}>
                        
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Charger Name</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="Super Charger"
                                value={chargerName}
                                onChange={(e) => setChargerName(e.target.value.slice(0, 50))}
                            />
                            {errors.chargerName && <p className="error">{errors.chargerName}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Charger Price</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder=" 150 INR"
                                value={chargerPrice}
                                onChange={(e) => {
                                    const priceValue = e.target.value.replace(/\D/g, "");
                                    setChargerPrice(priceValue.slice(0, 5));
                                }}
                            />
                            {errors.chargerPrice && <p className="error">{errors.chargerPrice}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Charger Type</label>
                            <div className={styles.selectContainer}>
                                <Select
                                    value={{ label: chargerType, value: chargerType }}
                                    onChange={(option) => setChargerType(option.value)}
                                    options={[
                                        { value: 'On Demand Service', label: 'On Demand Service' },
                                        { value: 'Scheduled Service', label: 'Scheduled Service' }
                                    ]}
                                    onMenuOpen={toggleDropdown}
                                    onMenuClose={toggleDropdown}
                                    placeholder="Select"
                                />
                            </div>
                            {errors.chargerType && (
                                <p className="error">
                                    {errors.chargerType}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Charger Feature</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="For  150 INR Per Charger"
                                value={chargerFeature}
                                onChange={(e) => setChargerFeature(e.target.value)}
                            />
                            {errors.chargerFeature && <p className="error">{errors.chargerFeature}</p>}
                        </div>
                    </div>
                    <div className={styles.toggleContainer}>
                        <label className={styles.statusLabel}>Status</label>
                        <div className={styles.toggleSwitch} onClick={handleToggle}>
                            <span className={`${styles.toggleLabel} ${!isActive ? styles.inactive : ''}`}>
                            In-Active
                            </span>
                            <div className={`${styles.toggleButton} ${isActive ? styles.active : ''}`}>
                                <div className={styles.slider}></div>
                            </div>
                            <span className={`${styles.toggleLabel} ${isActive ? styles.active : ''}`}>
                                Active
                            </span>
                        </div>
                    </div>
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="fileUpload"
                                // accept="image/*"
                                accept=".jpeg,.jpg"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {!file ? (
                                <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img
                                        // src={URL.createObjectURL(file)}
                                        src={
                                            typeof file === 'string'
                                                ? `${process.env.REACT_APP_DIR_UPLOADS}charger-images/${file}`
                                                : URL.createObjectURL(file)
                                        }
                                        alt="Preview"
                                        className={styles.previewImage}
                                    />
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={handleRemoveImage}
                                    >
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className={styles.error} style={{color: 'red'}}>{errors.file}</p>}
                    </div>
                    <div className={styles.actions}>
                        <button onClick={backButtonClick} className={styles.cancelBtn} type="button">Cancel</button>
                        <button className={styles.submitBtn} type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default EditPortableCharger;
