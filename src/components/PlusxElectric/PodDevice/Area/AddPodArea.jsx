import { useEffect, useState } from 'react';
import styles from './adddevice.module.css';
// import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
// import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithToken } from '../../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';

const AddPodArea = () => {
    const userDetails               = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                  = useNavigate()
    const [areaName, setAreaName]   = useState("");
    const [latitude, setLatitude]   = useState("");
    const [longitude, setLongitude] = useState("");
    const [errors, setErrors]       = useState({});
    const [loading, setLoading]     = useState(false);
    
    const backButtonClick = () => {
        navigate('/electric/home-charger/area-list')
    };

    const validateForm = () => {
        const fields = [
            { 
                name         : "areaName", 
                value        : areaName, 
                errorMessage : "Area Name is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "latitude", 
                value        : latitude, 
                errorMessage : "Latitude is required.", 
                isValid      : val => val.trim() !== "" 
            },  
            { 
                name         : "longitude", 
                value        : longitude, 
                errorMessage : "Longitude is required.", 
                isValid      : val => val.trim() !== "" 
            },
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
            formData.append("userId", "1");
            formData.append("email", "admin@shunyaekai.com");

            formData.append("areaName", areaName);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);

            postRequestWithToken('pod-area-add', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/electric/home-charger/area-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-device api', response);
                }
                setLoading(false)
            })

        } else {
            console.log("Form validation failed.");
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
            <h2 className={styles.addHeading}>Add Area</h2>
            <div className={styles.addStationFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label className={styles.labelText} htmlFor="areaName">Area Name</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="areaName" placeholder="Area Name" className={styles.inputField} value={areaName} onChange={(e) => setAreaName(e.target.value)} />
                                    {errors.areaName && areaName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.areaName}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label className={styles.labelText} htmlFor="latitude">Latitude</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="latitude" placeholder="Latitude" className={styles.inputField} value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                                    {errors.latitude && latitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.latitude}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="longitude" className={styles.labelText}>Longitude</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="longitude" placeholder="Longitude" className={styles.inputField} value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                                    {errors.longitude && longitude === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.longitude}</p>}
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

export default AddPodArea;
