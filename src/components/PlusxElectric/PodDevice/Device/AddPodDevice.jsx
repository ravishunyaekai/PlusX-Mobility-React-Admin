import { useEffect, useState } from 'react';
import styles from './adddevice.module.css';
import { AiOutlineClose, AiOutlineDown, AiOutlineUp } from 'react-icons/ai';
// import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { postRequestWithToken } from '../../../../api/Requests';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import Delete from '../../../../assets/images/Delete.svg'
import Add from '../../../../assets/images/Add.svg';

const AddPodDevice = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate()
    
    const [podId, setPodId]         = useState("");
    const [podName, setPodName]     = useState("");
    const [deviceId, setDeviceId]   = useState("");
    const [modalName, setModalName] = useState("");
    const [inverter, setInverter]   = useState("");
    const [charger, setCharger]     = useState("");
    const [dateOfManufacturing, setDateOfManufacturing] = useState("");
    const [errors, setErrors]                           = useState({});
    const [bateryerrors, setBateryerrors]               = useState([]);  
    const [loading, setLoading]                         = useState(false);

    const [deviceBatteryData, setDeviceBatteryData] = useState([
        { batteryId : '', capacity : '' }
    ]);

    const backButtonClick = () => {
        navigate('/electric/home-charger/device-list')
    };
    const validateForm = () => {
        const fields = [
            { 
                name         : "podId", 
                value        : podId, 
                errorMessage : "POd Id is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "podName", 
                value        : podName, 
                errorMessage : "Pod Name is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "deviceId", 
                value        : deviceId, 
                errorMessage : "Device Id is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "modalName", 
                value        : modalName, 
                errorMessage : "Modal Name is required.", 
                isValid      : val => val.trim() !== "" 
            },
            // { 
            //     name         : "capacity", 
            //     value        : capacity, 
            //     errorMessage : "Capacity is required.", 
            //     isValid      : val => val.trim() !== "" 
            // },
            { 
                name         : "inverter", 
                value        : inverter, 
                errorMessage : "Inverter is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "charger", 
                value        : charger, 
                errorMessage : "Charger is required.", 
                isValid      : val => val.trim() !== "" 
            },
            { 
                name         : "dateOfManufacturing", 
                value        : dateOfManufacturing, 
                errorMessage : "Date Of Manufacturing is required.", 
                isValid      : val => val.trim() !== "" 
            }
        ]
        deviceBatteryData.forEach((slot, index) => { // batteryId : null,  
            const slotErrors = {};
            if (!slot.batteryId) slotErrors.batteryId = "Battery Id is required";
            if (!slot.capacity) slotErrors.capacity   = "Capacity is required";
            
            bateryerrors[index] = slotErrors;
        });
        setBateryerrors(bateryerrors);
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isValid }) => {
            if (!isValid(value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 || Object.keys(bateryerrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        if (validateForm()) {

            const battery_ids = deviceBatteryData.map(slot => slot.batteryId);
            const capacities  = deviceBatteryData.map(slot => slot.capacity);

            const obj = {
                userId : userDetails?.user_id,
                email  : userDetails?.email,
                podId,
                podName,
                deviceId,
                device_model : modalName,
                charger,
                inverter,
                date_of_manufacturing : dateOfManufacturing,
                battery_ids,
                capacities
            };
            postRequestWithToken('pod-device-add', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        navigate('/electric/home-charger/device-list')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-device api', response);
                }
                setLoading(false);
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

    const handleBatteryChange = (index, e) => {
        const value = e.target.value;
        
        const newBattery = [...deviceBatteryData];
        newBattery[index].batteryId = value;
        setDeviceBatteryData(newBattery);
    };
    const handleBatteryCapacityChange = (index, e) => {
        const value = e.target.value;
        
        const newCapacity = [...deviceBatteryData];
        newCapacity[index].capacity = value;
        setDeviceBatteryData(newCapacity);
    };
    const addTimeSlot = () => {
        setDeviceBatteryData([...deviceBatteryData, { batteryId: '', capacity: '' }]);
    };
    const removeTimeSlot = (index) => {
        const newBatteryData = deviceBatteryData.filter((_, i) => i !== index);
        setDeviceBatteryData(newBatteryData);
    };

    return (
        <div className={styles.addStationContainer}>
            <h2 className={styles.addHeading}>Add Device</h2>
            <div className={styles.addStationFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="podId" className={styles.labelText}>POD ID</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="podId" placeholder="POD ID" className={styles.inputField} value={podId} onChange={(e) => setPodId(e.target.value)} />
                                    {errors.podId && podId === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.podId}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="podName" className={styles.labelText}>POD Name</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="podName" placeholder="POD Name" className={styles.inputField} value={podName} onChange={(e) => setPodName(e.target.value)} />
                                    {errors.podName && podName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.podName}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="deviceId" className={styles.labelText}>Device ID</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="deviceId" placeholder="Device ID" className={styles.inputField} value={deviceId} onChange={(e) => setDeviceId(e.target.value)} />
                                    {errors.deviceId && deviceId === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.deviceId}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="modalName" className={styles.labelText}>Modal Name</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="modalName" placeholder="Modal Name V1, V2" className={styles.inputField} value={modalName} onChange={(e) => setModalName(e.target.value)} />
                                    {errors.modalName && modalName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.modalName}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="inverter" className={styles.labelText}>Inverter</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="inverter" placeholder="Phase 1, Phase 2" className={styles.inputField} value={inverter} onChange={(e) => setInverter(e.target.value)} />
                                    {errors.inverter && inverter === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.inverter}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="charger" className={styles.labelText}>Charger</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="charger" placeholder="Charger" className={styles.inputField} value={charger} onChange={(e) => setCharger(e.target.value)} />
                                    {errors.charger && charger === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.charger}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="dateOfManufacturing" className={styles.labelText}>Date Of Manufacturing</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <InputMask mask="99-99-9999" value={dateOfManufacturing} placeholder="DD-MM-YYYY" className={styles.inputField}
                                        onChange={(e) => {
                                            setDateOfManufacturing(e.target.value);
                                            if (errors.dateOfManufacturing && e.target.value.length === 10) {
                                                setErrors((prevErrors) => ({ ...prevErrors, dateOfManufacturing: "" }));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (dateOfManufacturing.length === 10) {
                                                const [day, month, year] = dateOfManufacturing.split('-');
                                                const isValidDate =
                                                !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                day <= 31 && month <= 12; 
                                                if (!isValidDate) {
                                                    setErrors((prevErrors) => ({
                                                        ...prevErrors,
                                                        dateOfManufacturing: "Invalid date in DD-MM-YYYY format",
                                                    }));
                                                }
                                            }
                                        }}
                                    />
                                    {errors.dateOfManufacturing && dateOfManufacturing === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.dateOfManufacturing}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Add Battery Detail 
                                <button type="button" onClick={addTimeSlot} className={styles.featureButton}>
                                    <img src={Add} alt="Add" className={styles.addImg} />
                                    <span className={styles.addContent}>Add</span>
                                </button>
                            </label>
                        </div>
                    </div>

                    { deviceBatteryData.map((slot, index) => (
                        <div className={`row`}>
                            <div className={`col-md-6`}>
                                <label htmlFor="batteryId" className={styles.labelText}>Battery ID</label>
                                <div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12`}>
                                        <input type="text" autoComplete="off" id="batteryId" placeholder="Battery ID" className={styles.inputField} value={slot.batteryId} onChange={(e) => handleBatteryChange(index, e)} />
                                        {bateryerrors[index]?.batteryId && slot.batteryId === '' && <p className={styles.error} style={{ color: 'red' }}>{bateryerrors[index].batteryId}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className={`col-md-6`}>
                                <label htmlFor="capacity" className={styles.labelText}>Capacity</label>
                                <div className={`row`}>
                                    <div className={`col-xl-10 col-lg-12 ${styles.featureDivision}`}>
                                        <input type="text" autoComplete="off" id="capacity" placeholder="Capacity" className={`${styles.inputField} `} value={slot.capacity} onChange={(e) => handleBatteryCapacityChange(index, e)} />
                                        {index > 0 && (
                                            <button type="button" className={styles.removeButton} onClick={() => removeTimeSlot(index )}>
                                                <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                            </button>
                                        )}
                                        {bateryerrors[index]?.capacity && slot.capacity === '' && <p className={styles.error} style={{ color: 'red' }}>{bateryerrors[index].capacity}</p>}
                                    </div>
                                </div>
                            </div>
                            {/* {deviceBatteryData.length > 1 && (
                                <div className={`col-lg-2`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-12 col-lg-12`}>
                                            <button type="button" className={styles.buttonContainer} onClick={() => removeTimeSlot(index)}>
                                                <img className={styles.removeContent} src={Delete} alt="delete" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    ))}

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


export default AddPodDevice;
