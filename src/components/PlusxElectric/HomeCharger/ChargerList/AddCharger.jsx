import { useEffect, useState } from 'react';
import styles from './addcharger.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
// import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithTokenAndFile } from '../../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';
import { MdOutlineCloudUpload } from 'react-icons/md';

const AddCharger = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                              = useNavigate()
    const [file, setFile]                       = useState(null);
    const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
    const [chargerName, setChargerName]         = useState("");
    const [chargerPrice, setChargerPrice]       = useState("");
    const [chargerType, setChargerType]         = useState("");
    const [chargerFeature, setChargerFeature]   = useState("");
    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);
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
    const backButtonClick = () => {
        navigate('/electric/home-charger/charger-list')
    };
    const handleRemoveImage = () => {
        setFile(null);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const validateForm = () => {
        const fields = [
            { name: "chargerName", value: chargerName, errorMessage: "Charger Name is required.", isValid: val => val.trim() !== "" },
            { name: "chargerPrice", value: chargerPrice, errorMessage: "Please enter a valid Charger Price.", isValid: val => val && !isNaN(val) && val >= 0 },
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
        setLoading(true);
       
        if (validateForm()) {

            const formData = new FormData();
              formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("country_id", userDetails?.country_id);
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
                        setLoading(false);
                        navigate('/electric/home-charger/charger-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-charger api', response);
                    setLoading(false);
                }
            })

        } else {
            console.log("Form validation failed.", errors);
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    return (
        <div className={styles.addStationContainer}>
            <h2 className={styles.addHeading}>Add Charger</h2>
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
                                    <input type="text" autoComplete="off" id="chargerPrice" placeholder=" INR" className={styles.inputField} value={chargerPrice} 
                                    onChange={(e) => {
                                        const priceValue = e.target.value.replace(/\D/g, "");
                                        setChargerPrice(priceValue.slice(0, 5));
                                    } } />
                                    {/* <MultiCustomDropdown options={compatibleOption} value={compatible} onChange={handleCompatibility} labelledBy="Compatible" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll  /> */}
                                    {errors.chargerPrice && chargerPrice.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerPrice}</p>}
                                    {/* selectAllValue={compatibleOption[0]?.value} allSelectedLabel={compatibleOption[0]?.label} */}
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

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="coverFileUpload" className={styles.labelText}>Image</label>
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
        </div>
    );
};

export default AddCharger;
