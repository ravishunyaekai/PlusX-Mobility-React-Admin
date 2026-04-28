import { useState,  useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from './addoffer.module.css';
import { MdOutlineCloudUpload } from "react-icons/md";
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import InputMask from 'react-input-mask';
import moment from 'moment';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../SharedComponent/Loader/Loader";

const EditOffer = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const {offerId}                       = useParams();
    const [details, setDetails]           = useState();
    const [file, setFile]                 = useState(null);
    const [imageBaseUrl, setImageBaseUrl] = useState("");
    const [errors, setErrors]             = useState({});
    const [couponName, setCouponName]     = useState('');
    const [expiryDate, setExpiry]         = useState('');
    const [url, setUrl]                   = useState('');
    const [loading, setLoading]           = useState(false);
    const [showLoader, setShowLoader]     = useState(false);
    const [isActive, setIsActive]         = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            console.log(selectedFile)
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
        }
    };
    const handleRemoveImage = () => setFile(null);
    const validateForm = () => {
    const fields = [
        { name: "couponName", value: couponName, errorMessage: "Offer Name is required." },
        { name: "url",        value: url,        errorMessage: "URL is required." },
        { name: "expiryDate", value: expiryDate, errorMessage: "Expiry Date is required."},
        { name: "file",       value: file,       errorMessage: "Image is required." },
    ];
    const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
        if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
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
            formData.append("offer_id", offerId);
            formData.append("offer_name", couponName);
            formData.append("offer_url", url);
            formData.append("status", isActive === true ? 1 : 0);
            const convertToDateFormat = (date) => {
                const [day, month, year] = date.split('-');
                return `${year}-${month}-${day}`;
            };
            const formattedExpiryDate = convertToDateFormat(expiryDate);
            
            formData.append("expiry_date", formattedExpiryDate);
            if (file) {
                formData.append("offer_image", file);
            }        
            
            postRequestWithTokenAndFile('edit-offer', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/offer/offer-list');
                    }, 1500);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in electric-bike-edit API:', response);
                    setLoading(false);
                }
            } )
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
            offer_id  : offerId
        };
        postRequestWithToken('offer-detail', obj, (response) => {
            
            if (response.status === 1) {
                setImageBaseUrl(response?.base_url || "");
                const data = response?.data || {};
                setDetails(data);
                setCouponName(data?.offer_name || "");
                setUrl(data?.offer_url || "")
                // setFile(data?.offer_image || "");
                setFile({
                    name: data?.offer_image,
                    url: `${response?.base_url}${data?.offer_image}`,
                    type: "image/*"
                });
                const formattedDate = moment(data?.offer_exp_date).format('DD-MM-YYYY');
                setExpiry(formattedDate);
                setIsActive(data?.status === '1' ? true : false)
            } else {
                console.error('Error in electric-bike-detail API', response);
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
        navigate('/electric/offer/offer-list')
    }

    return (
        <div className={styles.addStationContainer}>
            {showLoader ? <Loader/> : 
                <>
                    <ToastContainer />
                    <div className={styles.addHeading}>Edit Offer</div>
                        <div className={styles.addStationFormSection}>
                        <form className={styles.formSection} onSubmit={handleSubmit}>

                        <div className={`row`}>
                            <div className={`col-lg-6`}>
                                <label className={styles.labelText} htmlFor="offerName">Offer Name</label>
                                <div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12`}>
                                        <input type="text" autoComplete="off" id="offerName" placeholder="Coupon Name" className={styles.inputField} value={couponName} onChange={(e) => setCouponName(e.target.value)} />
                                        {errors.couponName && couponName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.couponName}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className={`col-lg-6`}>
                                <label htmlFor="expiryDate" className={styles.labelText}>Expiry Date</label>
                                <div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12`}>
                                        <InputMask className={styles.inputField} mask="99-99-9999" value={expiryDate} placeholder="DD-MM-YYYY"
                                            onChange={(e) => {
                                            setExpiry(e.target.value);
                                            if (errors.expiryDate && e.target.value.length === 10) {
                                                setErrors((prevErrors) => ({ ...prevErrors, expiryDate: "" }));
                                            }
                                            }}
                                            onBlur={() => {
                                            if (expiryDate.length === 10) {
                                                const [day, month, year] = expiryDate.split('-');
                                                const isValidDate =
                                                !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                day <= 31 && month <= 12; 
                                                if (!isValidDate) {
                                                setErrors((prevErrors) => ({
                                                    ...prevErrors,
                                                    expiryDate: "Invalid date in DD-MM-YYYY format",
                                                }));
                                                }
                                            }
                                            }}
                                        />
                                        {errors.expiryDate && expiryDate === '' && <p className={styles.error}>{errors.expiryDate}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`row`}>
                            <div className={`col-lg-6`}>
                                <label htmlFor="url" className={styles.labelText}>Offer URL</label>
                                    <div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12`}>
                                        <input type="text" autoComplete="off" id="url" placeholder="Offer URL" className={styles.inputField} value={url} onChange={(e) => setUrl(e.target.value)} />
                                        {errors.url && url === '' && <p className="error">{errors.url}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className={`col-lg-6`}>
                                <label htmlFor="coverFileUpload" className={styles.labelText}>Cover Image</label>
                                <div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12`}>
                                        <div className={styles.uploadContainer}>
                                            <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                            <label htmlFor="coverFileUpload" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                            <input type="file" id="coverFileUpload" accept=".jpeg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
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
                    </div>
                </>
            }
        </div>
    );
    };

export default EditOffer;
