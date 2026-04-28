import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from "./EditUniversity.module.css";
import { toast, ToastContainer } from "react-toastify";
import { postRequestWithToken } from '../../../../api/Requests';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import Loader from "../../../SharedComponent/Loader/Loader";

const EditUniversity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [universityId, setUniversityId] = useState("");
    const [universityName, setUniversityName] = useState("");
    const [state, setState] = useState(null);
    const [stateOptions, setStateOptions] = useState([]);
    const [city, setCity] = useState(null);
    const [cityOptions, setCityOptions] = useState([]);
    const [address, setAddress] = useState('');
    const [baseUrl, setBaseUrl] = useState("");
    const [showLoader, setShowLoader] = useState(false);

    const userObj = {
        userId: userDetails?.user_id,
        email: userDetails?.email,
        country_id: userDetails?.country_id,
        universityId: id,
    };

    const handleCancel = () => navigate('/mobility/universities/university-list');

    const handleStateChange = (value) => setState(value);
    const handleCityChange = (value) => setCity(value);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
            event.preventDefault();
        }
    };

    function getStates() {
        setLoadingStates(true);
        postRequestWithToken('state-country-list', {
            ...userObj,
            requirement: "state"
        }, (response) => {
            if (response.code === 200) {
                const stateList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.state_id
                }));
                setStateOptions(stateList);
            } else {
                console.log('Error in state-country-list (state):', response);
            }
            setLoadingStates(false);
        });
    }

    function getCities() {
        if (!state?.value) return;
        setLoadingCities(true);
        postRequestWithToken('state-country-list', {
            ...userObj,
            requirement: "city",
            station_state_id: state.value
        }, (response) => {
            if (response.code === 200) {
                const cityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.city_id
                }));
                setCityOptions(cityList);
            } else {
                console.log('Error in state-country-list (city):', response);
            }
            setLoadingCities(false);
        });
    }


    function fetchDetails() {
        setShowLoader(true);

        postRequestWithToken("university-details", { ...userObj, universityId: id }, (response) => {
            console.log("Response:", response);

            if (response.code === 200 && response.status === 1) {
                const university = response.university;
                const base = response.base_url || "";

                setBaseUrl(base);
                setUniversityId(university?.university_id || "");
                setUniversityName(university?.name || "");
                setState(university?.state ? { label: university.state, value: university.state_id } : null);
                setCity(university?.city ? { label: university.city, value: university.city_id } : null);
                setAddress(university?.address || "");
            } else {
                // toast.error(response.message || "Error fetching university details");
                console.error("Error fetching details:", response);
            }

            setShowLoader(false);
        });
    }


    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate("/login");
            return;
        }
        if (id) fetchDetails();
    }, [id]);

    const validateForm = () => {
        const fields = [
            { name: "universityName", value: universityName, errorMessage: "University Name is required." },
            { name: "state", value: state?.value, errorMessage: "State is required.", isArray: true },
            { name: "city", value: city?.value, errorMessage: "City is required.", isArray: true },
            { name: "address", value: address, errorMessage: "Address is required." },
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


    // -------- HANDLE EDIT SUBMIT --------
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const formData = new FormData();
            formData.append("university_id", universityId);
            formData.append("university_name", universityName);
            formData.append("address", address);
            formData.append("country_id", userDetails?.country_id || "CN001");
            formData.append("station_state_id", state?.value || "");
            formData.append("station_city_id", city?.value || "");
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);

            postRequestWithToken("edit-university", formData, (response) => {
                console.log(response, "response");
                if (response.status === 1) {
                    toast.success(response.message || "University updated successfully!");

                    setTimeout(() => {
                        setLoading(false);
                        navigate("/mobility/universities/university-list");
                    }, 1000);
                } else {
                    toast.error(response.message || "Error updating university");
                    console.error("Edit university error:", response);
                    setLoading(false);
                }
            });
        }
        else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };


    return (
        <div className={styles.addStationContainer}>
            {showLoader ? (
                <Loader />
            ) : (
                <>
                    <div className={styles.addHeading}>Edit University</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="col-xl-10 col-lg-12">
                                        <input
                                            type="text" autoComplete="off" placeholder="University Name" className={styles.inputField} value={universityName}
                                            onChange={(e) => setUniversityName(e.target.value)}
                                        />
                                        {errors.universityName && universityName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.universityName}</p>}
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="row">
                                        <div className="col-xl-5 col-lg-6">
                                            <CustomDropdown options={stateOptions} value={state} onChange={handleStateChange} placeholder="Select State" onMenuOpen={getStates}
                                                isLoading={loadingStates}
                                            />
                                            {errors.state && state.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.state}</p>}
                                        </div>
                                        <div className="col-xl-5 col-lg-6">
                                            <CustomDropdown options={cityOptions} value={city} onChange={handleCityChange} placeholder="Select City" onMenuOpen={getCities}
                                                isLoading={loadingCities}
                                            />
                                            {errors.city && city.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*  */}
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="Cycle" className={styles.labelText}>Address</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" placeholder="Address" className={styles.inputField} value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                            {errors.address && address === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.address}</p>}                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="row">
                                <div className="col-xl-11 col-lg-12">
                                    <div className="row">
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

                </>
            )}

        </div>
    );
};

export default EditUniversity;
