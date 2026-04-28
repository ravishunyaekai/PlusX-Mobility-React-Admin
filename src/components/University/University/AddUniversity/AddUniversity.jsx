import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./AddUniversity.module.css";
// import { MdOutlineCloudUpload } from "react-icons/md";
// import { AiOutlineClose } from 'react-icons/ai';
import { toast, ToastContainer } from "react-toastify";
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
// import Modal from "../../../SharedComponent/Modal/Modal";
// import {APIProvider, Map, Marker} from '@vis.gl/react-google-maps';
// import UploadIcon from '../../../../assets/images/uploadicon.svg';
// import { AiOutlineClose } from 'react-icons/ai';
// import ReactInputMask from "react-input-mask"
// import 'react-toastify/dist/ReactToastify.css';

// const googleMapApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
 
const AddUniversity = () => {
    const navigate                            = useNavigate();    
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    // const [defaultCenter, setDefaultCenter]   = useState({ lat: 28.4595, lng: 77.0266 });
    // const [isModalOpen, setIsModalOpen]       = useState(false);
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
    const [loadingStates, setLoadingStates]   = useState(false);
    const [loadingCities, setLoadingCities]   = useState(false);
 
    const [universityName, setUniversityName] = useState('');
    const [state, setState]                   = useState([]);
    const [stateOptions, setStateOptions]     = useState([]);
    const [city, setCity]                     = useState([]);
    const [CityOptions, setCityOptions]       = useState([]);
    const [address, setAddress]               = useState('');

    const userObj = {
        userId: userDetails?.user_id,
        email: userDetails?.email,
        country_id:userDetails?.country_id,
    };
 
    const handleCancel = () => {
        navigate('/mobility/universities/university-list')
    }
 
    function handleStateChange(value) {
        setState(value);
    }
 
    function handleCityChange(value) {
        setCity(value);
    }
 
    function handleKeyDown(event) {
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
            event.preventDefault();
        }
    }

    // function handleModal() {
    //     setIsModalOpen(true);
    // }

    // function handleCloseModal() {
    //     setIsModalOpen(false);
    // }

    // function handleAddress() {
    //     setIsModalOpen(false);
    // }

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    const validateForm = () => {
        const fields = [
            { name: "universityName",   value: universityName,  errorMessage: "University Name is required." },
            { name: "state",            value: state?.value,    errorMessage: "State is required.",         isArray: true },
            { name: "city",             value: city?.value,     errorMessage: "City is required.",          isArray: true },
            { name: "address",          value: address,         errorMessage: "Address is required." },
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
            formData.append("country_id", userDetails?.country_id);
 
            formData.append("university_name", universityName);
            formData.append("station_state_id", state.value);
            formData.append("station_city_id", city.value);
            formData.append("address", address);
            postRequestWithToken('add-university', formData, async (response) => {
                 if (response.status === 1) {
                    toast.success(response.message || response.message[0])
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/mobility/universities/university-list');
                    }, 1000);
                } else {
                    toast.error(response.message || response.message[0])
                    console.log('Error in add-station API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };

    function getStates() {
        setLoadingStates(true);
        postRequestWithToken('state-country-list', { ...userObj, requirement: "state" }, (response) => {
            if (response.code === 200) {
                const stateList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.state_id
                }));
            setStateOptions(stateList);
            } else {
                console.log('error in state-country-list API', response);
            }
            setLoadingStates(false);
        });
    }

    function getCities() {
        setLoadingCities(true);
        postRequestWithToken('state-country-list', { ...userObj, requirement: "city" ,station_state_id:state.value }, (response) => {
            if (response.code === 200) {
                const cityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.city_id
                }));
            setCityOptions(cityList);
            } else {
                console.log('error in state-country-city-list API', response);
            }
            setLoadingCities(false);
        });
    }
    
    return (
        <div className={styles.addStationContainer}>
            
            <div className={styles.addHeading}>Add University</div>
            <div className={styles.addStationFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="universityName" placeholder="University Name" className={styles.inputField} value={universityName} onChange={(e) => setUniversityName(e.target.value)} />
                                    {errors.universityName && universityName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.universityName}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-xl-5 col-lg-6`}>
                                    <CustomDropdown options={stateOptions} value={state} onChange={handleStateChange} placeholder="Select State" onMenuOpen={getStates} isLoading={loadingStates}/>
                                    {errors.state && state.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.state}</p>}
                                </div>
                                <div className={`col-xl-5 col-lg-6`}>
                                    <CustomDropdown options={CityOptions} value={city} onChange={handleCityChange} placeholder="Select City" onMenuOpen={getCities} isLoading={loadingCities}/>
                                    {errors.city && city.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
 
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="Cycle" className={styles.labelText}>Address</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="address" placeholder="Address" className={styles.inputField}
                                        value={address} onChange={(e) => setAddress(e.target.value)} />
                                    {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                                </div>
                            </div>
                             {/* <div className={`row`}>
                                <div className={`col-xl-8 col-lg-10`}>
                                    <input type="text" autoComplete="off" id="address" placeholder="Search Location" className={styles.inputField}
                                        value={address} onChange={(e) => setAddress(e.target.value)} onBlur={(e) => handleOnBlur(e.target.value)} />
                                    {errors.address && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}
                                </div>
                                <div className={`col-xl-2 col-lg-2`}>
                                    <button className={styles.mapButton} onClick={handleModal} type="button">Map</button>
                                </div>
                            </div> */}
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

            {/* <Modal isOpen={isModalOpen} heading= "Address" buttonName="Add" onClose={handleCloseModal} onSubmit={handleAddress}>
                <div className={styles.modalContainer}>
                    <APIProvider apiKey={googleMapApiKey}>
                        <Map style={{width: '100%', height: '300px'}} defaultCenter={defaultCenter} defaultZoom={11} gestureHandling={'greedy'} disableDefaultUI={true} />
                        <Marker position={defaultCenter} draggable={true} onDragEnd={ (e) => handleMapClick( e.latLng.lat(), e.latLng.lng() ) } />
                    </APIProvider>
                </div>
            </Modal> */}
        </div>
    );
};
 
export default AddUniversity;