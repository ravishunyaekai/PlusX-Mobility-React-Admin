import { useState, useRef, useEffect } from "react";
import styles from "./AddUser.module.css";
import Select from "react-select";
// import UploadIcon from '../../../assets/images/uploadicon.svg';
import { MultiSelect }  from "react-multi-select-component";
// import { AiOutlineClose } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken, getRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
// import ReactInputMask from "react-input-mask"
import 'react-toastify/dist/ReactToastify.css';
 
const AddUser = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                            = useNavigate();
    const countryDropdownRef                  = useRef(null);
    const cityDropdownRef                     = useRef(null);
    const permissionDropdownRef               = useRef(null);
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
 
    const [name, setName]                     = useState('');
    const [email, setEmail]                   = useState('');
    const [country, setCountry]               = useState('');
    const [city, setCity]                     = useState('');
    const [permission, setPermission]         = useState([]);
    const [password, setPassword]             = useState('');
    const [countryData, setCountryData]       = useState([]);
    const [cityData, setCityData]             = useState([]);
    
    const permissionOptions = [ 
        { value: 'view',     label: 'view' },
        { value: 'edit',     label: 'edit' },
        // { value: 'delete',   label: 'delete' },
    ];
 
    const handleCancel = () => {
        navigate('/user/user-list')
    }
    
    const handleCountryList = (selectedOptions) => {
        setCountry(selectedOptions);
    };
    const handleCityList = (selectedOptions) => {
        setCity(selectedOptions);
    };
    const handlePermission = (selectedOptions) => {
        setPermission(selectedOptions);
    };
    
    const validateForm = () => {
        const newErrors = {};
 
        if (!name.trim()) newErrors.name = "Name is required.";
        // if (!email || !email.value) newErrors.email = "Email is required.";
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { newErrors.email = "Valid email is required."; }
        if (!country || !country.value) newErrors.country = "Country is required.";
        // if (!city || city.trim() === '') newErrors.city = "City is required.";
        if (!permission || permission.length === 0) newErrors.permission = "Permission is required.";
        if (!password.trim()) newErrors.password = "Password is required.";        
 
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
 
            formData.append("name", name);
            formData.append("user_email", email);
            formData.append("password", password);
            formData.append("country", country);
            formData.append("city", city);
            formData.append("permission", permission.map(p => p.value).join(','));
        
           
            postRequestWithTokenAndFile('add-userss', formData, async (response) => {
                
                if (response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/user/user-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in add-user API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };
 
    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            requirement: "country",
        };
 
        getRequestWithToken('state-country-list', obj, (response) => {
            if (response.code === 200) {
 
                const countryList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.university_id
                }));
                setCountryData(countryList);
            } else {
                console.log('error in country-list API', response);
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

    return (
        <div className={styles.addShopContainer}>
            
            <div className={styles.addHeading}>Add Mobility Station</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="name">Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="name"
                                placeholder="Enter Name"
                                className={styles.inputField}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && name === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.name}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete="off"
                                id="email"
                                placeholder="Enter Email"
                                className={styles.inputField}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && email === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.email}</p>}
                        </div>
                        {/* <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="availableBrands">Charging For</label>
                            <div ref={brandDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={chargingFor}
                                    value={selectedBrands}
                                    onChange={handleChargingFor}
                                    labelledBy="Charging For"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.chargingFor && selectedBrands.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargingFor}</p>}
                        </div> */}
                        {/* <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">
                                Email
                            </label>
                            <div ref={availableDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={availableFor}
                                    value={available}
                                    onChange={handleAvailableFor}
                                    placeholder="Select available for"
                                    isClearable={true}
                                />
                            </div>
                            {errors.available && (!available || available.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.available}</p>}
                        </div> */}
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="countryList">
                                Country
                            </label>
                            <div ref={countryDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={countryData}
                                    value={country}
                                    onChange={handleCountryList}
                                    placeholder="Select Country"
                                    isClearable={true}
                                />
                            </div>
                            {errors.country && (!country || country.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.country}</p>}
                            </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="cityList">
                                City
                            </label>
                            <div ref={cityDropdownRef}>
                                <Select
                                    className={styles.addShopSelect}
                                    options={cityData}
                                    value={city}
                                    onChange={handleCityList}
                                    placeholder="Select City"
                                    isClearable={true}
                                />
                            </div>
                            {errors.city && (!city || city.length === 0) && <p className={styles.error} style={{ color: 'red' }}>{errors.city}</p>}
                        </div>
                    </div>
                    
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="permission">Permission</label>
                            <div ref={permissionDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={permissionOptions}
                                    value={permission}
                                    onChange={handlePermission}
                                    labelledBy="Permission"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.permission && permission.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.permission}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="password">Password</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="password"
                                placeholder="Enter Password"
                                className={styles.inputField}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && password === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.password}</p>}
                        </div>
                    </div>
                     
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                          {loading ? (
                            <> <span className="spinner-border spinner-border-sm me-2"></span> Submit... </>
                        ) : (
                            "Submit"
                        )}
                        </button>
                    </div>
 
                </form>
            </div>
        </div>
    );
};
 
export default AddUser;