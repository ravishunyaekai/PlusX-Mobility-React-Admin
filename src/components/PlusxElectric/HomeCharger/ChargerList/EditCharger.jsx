import { useEffect, useState } from 'react';
import styles from './addcharger.module.css';
import { AiOutlineClose } from 'react-icons/ai';
// import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithToken, postRequestWithTokenAndFile } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';
import { MdOutlineCloudUpload } from 'react-icons/md';
import Loader from '../../../SharedComponent/Loader/Loader';

const EditCharger = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                              = useNavigate()
    const { chargerId }                         = useParams()
    const [details, setDetails]                 = useState()
    const [file, setFile]                       = useState(null);

    const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
    const [chargerName, setChargerName]         = useState("");
    const [chargerPrice, setChargerPrice]       = useState("");
    const [chargerType, setChargerType]         = useState("");
    const [chargerFeature, setChargerFeature]   = useState("");
    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);
    const [showLoader, setShowLoader]           = useState(false);
    const [imageBaseUrl, setImageBaseUrl]       = useState("");
    
    const options = [
        { value: 'On Demand Service', label: 'On Demand Service' },
        { value: 'Scheduled Service', label: 'Scheduled Service' },
    ];

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

    const handleRemoveImage = () => {
        setFile(null);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const backButtonClick = () => {
        navigate('/electric/home-charger/charger-list')
    };
    const validateForm = () => {
        const newErrors = {};
        let formIsValid = true;

        if (!chargerName) {
            newErrors.chargerName = "Charger Name is required.";
            formIsValid = false;
        }
        if (!chargerPrice || isNaN(chargerPrice) || chargerPrice < 0) {
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
        setLoading(true);

        if (validateForm()) {

            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("charger_id", chargerId);
            formData.append("charger_name", chargerName);
            formData.append("charger_price", chargerPrice);
            formData.append("charger_feature", chargerFeature);
            formData.append("charger_type", chargerType);
            formData.append("status", isActive ? 1 : 0);

            // Append new image file if a new file is selected, skip if it's the existing image URL
            if (file instanceof File) {
                formData.append("charger_image", file);
            }

            postRequestWithTokenAndFile('edit-charger', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });

                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/home-charger/charger-list')
                    }, 2000);
                } else {
                    toast(response.message[0], { type: 'error' })
                    console.log('error in edit-charger api', response);
                    setLoading(false);
                }
            });
        } else {
            console.log("Form validation failed.");
            setLoading(false);
        }
    };
    const fetchDetails = () => {
        setShowLoader(true);
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            charger_id: chargerId
        };
        postRequestWithToken('charger-details', obj, (response) => {
            if (response.code === 200) {
                const data = response.data || {};
                setDetails(data);
                setImageBaseUrl(response?.base_url || "");

                // Pre-fill the form fields with fetched details
                setChargerName(data.charger_name || "");
                setChargerPrice(data.charger_price || "");
                setChargerType(data.charger_type || "");
                setChargerFeature(data.charger_feature || "");
                // setFile(data.image || "")
                setFile({
                    name: data?.image,
                    url: `${response?.base_url}${data?.image}`,
                    type: "image/*"
                });
                setIsActive(data?.status)

            } else {
                console.log('error in charger-slot-details API', response);
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

    const [isActive, setIsActive] = useState(false);

    const handleToggle = () => {
        setIsActive((prevState) => !prevState);
    };

    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader /> : 
                <>
                    <h2 className={styles.addHeading}>Edit Charger</h2>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit}>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label className={styles.labelText} htmlFor="chargerName">Charger Name</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="chargerName" placeholder="Super Charger" className={styles.inputField} value={chargerName} onChange={(e) => setChargerName(e.target.value.slice(0, 50))} />
                                            {errors.chargerName && chargerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="chargerPrice" className={styles.labelText}>Charger Price</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="chargerPrice" placeholder="150 INR" className={styles.inputField} value={chargerPrice} 
                                            onChange={(e) => {
                                                const priceValue = e.target.value.replace(/\D/g, "");
                                                setChargerPrice(priceValue.slice(0, 5));
                                            } } />
                                            {errors.chargerPrice && chargerPrice.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerPrice}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label className={styles.labelText} htmlFor="chargerType">Charger Type</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <CustomDropdown options={options} value={options.find(option => option.value === chargerType)} onChange={(selectedOption) => setChargerType(selectedOption.value)} 
                                                onMenuOpen={toggleDropdown} onMenuClose={toggleDropdown} labelledBy="Select Brand" closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.chargerType && chargerType === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="chargerFeature" className={styles.labelText}>Charger Feature</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="chargerFeature" placeholder="For  150 INR Per Charger" className={styles.inputField} value={chargerFeature} onChange={(e) => setChargerFeature(e.target.value)} />
                                            {errors.chargerFeature && chargerFeature.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerFeature}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.toggleContainer}>
                                <label className={styles.statusLabel}>Status</label>
                                <div className={styles.toggleSwitch} onClick={handleToggle}>
                                    <div className={`${styles.toggleButton} ${isActive ? styles.activeToggle : styles.inactiveToggle }`}>
                                        <div className={styles.slider}></div>
                                    </div>
                                    <span className={`${styles.toggleText} ${isActive ? styles.activeText : styles.inactiveText }`}>
                                        {isActive ? 'Active' : ' In-active'}
                                    </span>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="coverFileUpload" className={styles.labelText}>Cover Image</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                                <label htmlFor="coverFileUpload" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" id="coverFileUpload" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
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
                            </div>

                            <div className={`row`}>
                                <div className={`col-xl-11 col-lg-12`}>
                                    <div className={`row`}>
                                        <div className={`col-lg-12 ${styles.editButton}`}>
                                            <button className={styles.editCancelBtn} onClick={backButtonClick}>Cancel</button>
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

export default EditCharger;