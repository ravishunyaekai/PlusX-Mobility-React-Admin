import React, { useEffect, useState } from 'react';
import styles from './addcharger.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithTokenAndFile, getRequestWithToken } from '../../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import InputMask from 'react-input-mask';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';
import { MdOutlineCloudUpload } from 'react-icons/md';

const AddPodBrand = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const { deviceId }                        = useParams();
    const [file, setFile]                     = useState();
    const [loading, setLoading]               = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [brandName, setBrandName]     = useState("");
    // const [deviceId, setDeviceId]       = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate]     = useState("");
    const [endDate, setEndDate]         = useState("");
    const [errors, setErrors]           = useState({});
    const [deviceOptions, setDeviceOptions] = useState([]);

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
    const handleCancel = () => { navigate(`/electric/home-charger/device-details/${deviceId}`) }
    const toggleDropdown = () => { setIsDropdownOpen(!isDropdownOpen) };

    const validateForm = () => {
        const fields = [
            { 
                name    : "brandName", 
                value   : brandName, errorMessage: "Brand Name is required.", 
                isValid : val => val.trim() !== "" 
            },
            { 
                name         : "deviceId", 
                value        : deviceId, 
                errorMessage : "Please Select Device", 
                isValid      :  val => val.trim() !== "" 
            },
            { 
                name         : "description", 
                value        : description, 
                errorMessage : "Description Type is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "startDate", 
                value        : startDate, 
                errorMessage : "Start Date is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "endDate", 
                value        : endDate, 
                errorMessage : "End Date is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "file", 
                value        : file, 
                errorMessage : "Image is required.", 
                isValid      : val => !!val 
            }
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
        setLoading(true);
        e.preventDefault();
        if (validateForm()) {

            const formData = new FormData();
            formData.append("userId", "1");
            formData.append("email", "admin@shunyaekai.com");
            formData.append("brand_name", brandName);
            formData.append("device_id", deviceId);
            formData.append("description", description);
            formData.append("start_date", startDate);
            formData.append("end_date", endDate);

            if (file) {
                formData.append("brand_image", file);
            }

            postRequestWithTokenAndFile('add-pod-brand', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/home-charger/brand-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-brand api', response);
                }
                setLoading(false);
            })

        } else {
            console.log("Form validation failed.");
            setLoading(false);
        }
    };

    useEffect(() => {
        // const obj = {
        //     userId  : userDetails?.user_id,
        //     email   : userDetails?.email,
        // };
        // getRequestWithToken('all-pod-device', obj, (response) => {
        //     if (response.code === 200) {
        //         setDeviceOptions(response?.data || []);  
        //         console.log(response.data);
        //     } else {
        //         console.log('error in brand-list API', response);
        //     }
        // });

        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    return (
        <div className={styles.addStationContainer}>
            <h2 className={styles.addHeading}>Add POD Brand</h2>
            <div className={styles.addStationFormSection}>
                <form className={styles.formSection} onSubmit={handleSubmit}>
                <ToastContainer />
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label className={styles.labelText} htmlFor="brandName">Brand Name</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="brandName" placeholder="Super Charger" className={styles.inputField} value={brandName} onChange={(e) => setBrandName(e.target.value.slice(0, 50))} />
                                    {errors.brandName && brandName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.brandName}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label className={styles.labelText} htmlFor="description">Description</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="description" placeholder="Description" className={styles.inputField} value={description} onChange={(e) => setDescription(e.target.value)} />
                                    {errors.description && description === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                                </div>
                            </div>
                        </div>
                        {/* <div className={`col-lg-6`}>
                            <label className={styles.labelText} htmlFor="deviceId">Device Id</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <CustomDropdown value={deviceOptions.find(option => option.value === deviceId)} onChange={(selectedOption) => setDeviceId(selectedOption.value)}
                                        onMenuOpen={toggleDropdown} onMenuClose={toggleDropdown} options={deviceOptions} placeholder="Select"/>
                                    {errors.deviceId && deviceId === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.deviceId}</p>}
                                </div>
                            </div>
                        </div> */}
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="startDate" className={styles.labelText}>Start Date</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <InputMask mask="99-99-9999" type="text" value={startDate} placeholder="Start Date" className={styles.inputField}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            if (errors.startDate && e.target.value.length === 10) {
                                                setErrors((prevErrors) => ({ ...prevErrors, startDate: "" }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (startDate.length === 10) {
                                                const [day, month, year] = startDate.split('-');
                                                const isValidDate =
                                                !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                day <= 31 && month <= 12; 
                                                if (!isValidDate) {
                                                    setErrors((prevErrors) => ({
                                                        ...prevErrors,
                                                        startDate: "Invalid date in DD-MM-YYYY format",
                                                    }));
                                                }
                                            }
                                        }}
                                    />
                                    {errors.startDate && startDate === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.startDate}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="endDate" className={styles.labelText}>End Date</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <InputMask mask="99-99-9999" className={styles.inputField} type="text" placeholder="DD-MM-YYYY" value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            if (errors.endDate && e.target.value.length === 10) {
                                                setErrors((prevErrors) => ({ ...prevErrors, endDate: "" }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (endDate.length === 10) {
                                                const [day, month, year] = endDate.split('-');
                                                const isValidDate =
                                                !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                day <= 31 && month <= 12; 
                                                if (!isValidDate) {
                                                    setErrors((prevErrors) => ({
                                                        ...prevErrors,
                                                        endDate: "Invalid date in DD-MM-YYYY format",
                                                    }));
                                                }
                                            }
                                        }}
                                    />
                                    {errors.endDate && endDate === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.endDate}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="fileUpload" className={styles.labelText}>Image</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                        <label htmlFor="fileUpload" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                        <input type="file" id="fileUpload" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
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
                    </div>

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <div className={`row`}>
                                <div className={`col-lg-12 ${styles.editButton}`}>
                                    <button className={styles.editCancelBtn} onClick={handleCancel}>Cancel</button>
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
        </div>
    );
};


export default AddPodBrand;
