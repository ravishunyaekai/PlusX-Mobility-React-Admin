import React, { useEffect, useState } from 'react';
import styles from './addcharger.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithTokenAndFile } from '../../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const AddPortableCharger = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate()
    const [file, setFile] = useState();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [chargerName, setChargerName] = useState("");
    const [chargerPrice, setChargerPrice] = useState("");
    const [chargerType, setChargerType] = useState("");
    const [chargerFeature, setChargerFeature] = useState("");
    const [errors, setErrors] = useState({});
    const options = [
        { value: 'On Demand Service', label: 'On Demand Service' },
        { value: 'Scheduled Service', label: 'Scheduled Service' },
    ];

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast('Please upload a valid image file.', {type:'error'})
        }
    };
    const backButtonClick = () => {
        navigate('/home-charger/charger-list')
    };
    const handleRemoveImage = () => {
        setFile(null);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // const validateForm = () => {
    //     const newErrors = {};
    //     let formIsValid = true;

    //     if (!chargerName) {
    //         newErrors.chargerName = "Charger Name is required.";
    //         formIsValid = false;
    //     }

    //     if (!chargerPrice || isNaN(chargerPrice) || chargerPrice <= 0) {
    //         newErrors.chargerPrice = "Please enter a valid Charger Price.";
    //         formIsValid = false;
    //     }

    //     if (!chargerType) {
    //         newErrors.chargerType = "Charger Type is required.";
    //         formIsValid = false;
    //     }

    //     if (!chargerFeature) {
    //         newErrors.chargerFeature = "Charger Feature is required.";
    //         formIsValid = false;
    //     }

    //     if (!file) {
    //         newErrors.file = "Image is required.";
    //         formIsValid = false;
    //     }

    //     setErrors(newErrors);
    //     return formIsValid;
    // };

    const validateForm = () => {
        const fields = [
            { name: "chargerName", value: chargerName, errorMessage: "Charger Name is required.", isValid: val => val.trim() !== "" },
            { name: "chargerPrice", value: chargerPrice, errorMessage: "Please enter a valid Charger Price.", isValid: val => val && !isNaN(val) && val > 0 },
            { name: "chargerType", value: chargerType, errorMessage: "Charger Type is required.", isValid: val => val.trim() !== "" },
            { name: "chargerFeature", value: chargerFeature, errorMessage: "Charger Feature is required.", isValid: val => val.trim() !== "" },
            { name: "file", value: file, errorMessage: "Image is required.", isValid: val => !!val }
        ];
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isValid }) => {
            if (!isValid(value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {

            const formData = new FormData();
            formData.append("userId", "1");
            formData.append("email", "admin@shunyaekai.com");
            formData.append("charger_name", chargerName);
            formData.append("charger_price", chargerPrice);
            formData.append("charger_feature", chargerFeature);
            formData.append("charger_type", chargerType);

            if (file) {
                formData.append("charger_image", file);
            }

            postRequestWithTokenAndFile('add-charger', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/home-charger/charger-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-charger api', response);
                }
            })

        } else {
            console.log("Form validation failed.");
        }
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    return (
        <div className={styles.containerCharger}>
            <h2 className={styles.title}>Add Charger</h2>
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
                                onChange={(e) =>
                                    setChargerName(e.target.value.slice(0, 50))
                                }
                            />
                            {errors.chargerName && <p className="error">{errors.chargerName}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Charger Price</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                placeholder="150 INR"
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
                                    value={options.find(option => option.value === chargerType)}
                                    onChange={(selectedOption) => setChargerType(selectedOption.value)}
                                    onMenuOpen={toggleDropdown}
                                    onMenuClose={toggleDropdown}
                                    options={options}
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
                                placeholder="For 150 INR Per Charger"
                                value={chargerFeature}
                                onChange={(e) => setChargerFeature(e.target.value)}
                            />
                            {errors.chargerFeature && <p className="error">{errors.chargerFeature}</p>}
                        </div>
                    </div>

                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="fileUpload"
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
                                        src={URL.createObjectURL(file)}
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
                        {errors.file && <p className="error">{errors.file}</p>}
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


export default AddPortableCharger;
