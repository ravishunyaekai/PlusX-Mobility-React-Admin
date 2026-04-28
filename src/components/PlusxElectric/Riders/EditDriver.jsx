import { useEffect, useRef, useState } from 'react';
import styles from './AddDriver.module.css';
import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { MdOutlineCloudUpload } from "react-icons/md";
import { postRequestWithToken, postRequestWithTokenAndFile } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../SharedComponent/Loader/Loader';

const EditDriver = () => {
    const userDetails                           = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                              = useNavigate();
    const { rsaId }                             = useParams()
    const [file, setFile]                       = useState();
    const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
    const [details, setDetails]                 = useState()
    const [rsaName, setRsaName]                 = useState("");
    const [email, setEmail]                     = useState("");
    const [mobileNo, setMobileNo]               = useState("");
    const [serviceType, setServiceType]         = useState(null);
    const [password, setPassword]               = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors]                   = useState({});
    const [loading, setLoading]                 = useState(false);
    const [showLoader, setShowLoader]           = useState(false);
    const [imageBaseUrl, setImageBaseUrl]       = useState("");

    const typeOpetions = [
        // { value: "", label: "Select Vehicle Type" },
        { value: "Charger Installation", label: "Charger Installation" },
        { value: "EV Pre-Sale",          label: "EV Pre-Sale" },
        { value: "Portable Charger",     label: "Portable Charger" },
        { value: "Roadside Assistance",  label: "Roadside Assistance" },
        { value: "Valet Charging",       label: "Valet Charging" },
    ];

    const handleType = (selectedOption) => {
        setServiceType(selectedOption)
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid Image file.');
        }
    };

    const handleRemoveImage = () => {
        setFile(null);
    };

    const validateForm = () => {
        const fields = [
            { name: "rsaName",      value: rsaName,     errorMessage: "Driver Name is required." },
            { name: "email",        value: email,       errorMessage: "Please enter a valid Email ID.",     isEmail: true },
            { name: "mobileNo",     value: mobileNo,    errorMessage: "Please enter a valid Mobile No.",    isMobile: true },
            { name: "serviceType",  value: serviceType, errorMessage: "Service Type is required." },
            // { name: "password", value: password, errorMessage: "Password is required." },
            // { name: "confirmPassword", value: confirmPassword, errorMessage: "Passwords do not match.", isPasswordMatch: true },
            // { name: "file", value: file, errorMessage: "Image is required." }
        ];

        if (password || confirmPassword) {
            if (!password) {
                fields.push({ name: "password", value: password, errorMessage: "Password is required." });
            }
            if (!confirmPassword) {
                fields.push({ name: "confirmPassword", value: confirmPassword, errorMessage: "Confirm Password is required." });
            }
            if (password && confirmPassword && password !== confirmPassword) {
                fields.push({ name: "confirmPassword", value: confirmPassword, errorMessage: "Passwords do not match." });
            }
        }
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isEmail, isMobile, isPasswordMatch }) => {
            if (!value) {
                errors[name] = errorMessage;
            } else if (isEmail && !/\S+@\S+\.\S+/.test(value)) {
                errors[name] = errorMessage;
            } else if (isMobile && (isNaN(value) || value.length < 9)) {
                errors[name] = errorMessage;
            }
            else if (password && isPasswordMatch && value !== password) {
                errors[name] = errorMessage;
            } 
            return errors;
        }, {});
        if (password && confirmPassword && password !== confirmPassword) {
            newErrors["confirmPassword"] = "Passwords do not match.";
        } else if (password && password.length < 6) {
            newErrors['password'] = "Password should be at least 6 characters long.";
        }
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
            formData.append("rsa_id", rsaId);
            formData.append("rsa_email", email);
            formData.append("rsa_name", rsaName);
            formData.append("mobile", mobileNo);
            if (serviceType) {
                formData.append("service_type", serviceType.value);
            }
            formData.append("password", password);

            if (file) {
                formData.append("profile_image", file);
            }

            postRequestWithTokenAndFile('rsa-update', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/drivers/driver-list')
                    }, 1000);
                } else {
                    toast(response.message[0] || response.message, {type:'error'})
                    console.log('error in rsa-update api', response);
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
            rsa_id: rsaId
        };

        postRequestWithToken('rsa-data', obj, (response) => {
            if (response.code === 200) {
                const data = response?.rsaData || {};
                setImageBaseUrl(response?.base_url || "");
                setDetails(data);
                setRsaName(data?.rsa_name || "");
                setEmail(data?.email || "");
                setMobileNo(data?.mobile || "");
                // setServiceType(data?.booking_type || "");
                // setPassword(data?.password || "");
                // setConfirmPassword(data?.password || "");
                // setFile(data?.profile_img || "")
                setFile({
                    name: data?.profile_img,
                    url: `${response?.base_url}${data?.profile_img}`,
                    type: "image/*"
                });
                const initialType = data.booking_type ? { label: data.booking_type, value: data.booking_type } : null;
                setServiceType(initialType);

            } else {
                console.log('error in rsa-details API', response);
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
        navigate('/electric/drivers/driver-list')
    }

    return (
       <div className={styles.addStationContainer}>
            { showLoader ? <Loader /> : 
                <>
                    <div className={styles.addHeading}>Edit Driver</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit}>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Driver Name</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="rsaName" placeholder="Driver Name" className={styles.inputField} value={rsaName} onChange={(e) => setRsaName(e.target.value.slice(0, 50))} />
                                            {errors.rsaName && rsaName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.rsaName}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Email ID</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="email" autoComplete="off" id="email" placeholder="Email ID" className={styles.inputField} value={email} onChange={(e) => setEmail(e.target.value.slice(0, 50))} />
                                            {errors.email && email === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.email}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Mobile No</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="mobileNo" placeholder="Mobile No" className={styles.inputField} value={mobileNo} 
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setMobileNo(value.slice(0, 12)); 
                                            }} />
                                            {errors.mobileNo && mobileNo.length < 9 && <p className={styles.error} style={{ color: 'red' }}>{errors.mobileNo}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Service Type</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <CustomDropdown options={typeOpetions} value={serviceType} onChange={handleType} labelledBy="Select Service" closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.serviceType && serviceType == null && <p className={styles.error} style={{ color: 'red' }}>{errors.serviceType}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Password</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="password" autoComplete="off" id="password" placeholder="Password" className={styles.inputField} value={password} onChange={(e) => setPassword(e.target.value)} />
                                            {errors.password && password.length < 6 && <p className={styles.error} style={{ color: 'red' }}>{errors.password}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Confirm Password</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="password" autoComplete="off" id="confirmPassword" placeholder="Confirm Password" className={styles.inputField} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                            {errors.confirmPassword && confirmPassword !== password && <p className={styles.error} style={{ color: 'red' }}>{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Image</label>
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
                    </div >
                </>
            }
        </div >
    );
};

export default EditDriver;
