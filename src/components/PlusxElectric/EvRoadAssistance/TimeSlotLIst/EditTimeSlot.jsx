import { useEffect, useState } from 'react';
import styles from './AddTimeSlot.module.css';
import Add from '../../../../assets/images/Add.svg';
import Delete from '../../../../assets/images/Delete.svg'
import InputMask from 'react-input-mask';
import "react-datepicker/dist/react-datepicker.css";
import { postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import CustomDropdown from '../../../SharedComponent/UI/CustomDropdown/CustomDropdown';
// import Calendar from '../../../../assets/images/Calender.svg'
// import DatePicker from "react-datepicker";
// import dayjs from 'dayjs';
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// dayjs.extend(isSameOrAfter);

const EditPortableChargerTimeSlot = () => {
    const userDetails  = JSON.parse(sessionStorage.getItem('userDetails'));
    const { slotDate } = useParams();
    const navigate     = useNavigate();

    const [timeSlots, setTimeSlots] = useState([{ id: "", slotId: "", startTime: null, endTime: null, slotPrice : null, status: "" }]);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate]       = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [startDateErr, setStartDateErr] = useState(null);

    const dayOptions = [
        { value: 'Sunday',      label: 'Sunday'     },
        { value: 'Monday',      label: 'Monday'     },
        { value: 'Tuesday',     label: 'Tuesday'    },
        { value: 'Wednesday',   label: 'Wednesday'  },
        { value: 'Thursday',    label: 'Thursday'   },
        { value: 'Friday',      label: 'Friday'     },
        { value: 'Saturday',    label: 'Saturday'   },
    ];
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const fetchDetails = () => {
        const obj = {
            userId    : userDetails?.user_id,
            email     : userDetails?.email,
            slot_date : slotDate
        };
        postRequestWithToken('road-assistance-slot-details', obj, (response) => {
            if (response.code === 200) {
                const slots = response.data || [];
                if (slots.length > 0) {
                    setTimeSlots(
                        slots.map(slot => ({
                            slotId    : slot.slot_id,
                            startTime : moment(slot.start_time, 'HH:mm:ss').format('HH:mm'),
                            endTime   : moment(slot.end_time, 'HH:mm:ss').format('HH:mm'),
                            id        : slot.id,
                            status    : slot.status === 1,
                            slotPrice : slot.slot_price,
                        }))
                    );
                    // Set the date state using the first slot's date
                    setStartDate( slots[0].slot_date );
                }
            } else {
                console.log('error in slot-details API', response);
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

    const handleCancel = () => {
        navigate('/electric/ev-road-assistance/time-slot-list');
    };

    const handleTimeInput = (e) => {
        const value = e.target.value;
        const isValidTime = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        return isValidTime || value === '' ? value : null;
    };
    const handleStartTimeChange = (index, newTime) => {
        const validatedTime = handleTimeInput({ target: { value: newTime } });
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index].startTime = validatedTime === '' ? null : validatedTime;
        setTimeSlots(newTimeSlots);
    };
    const handleEndTimeChange = (index, newTime) => {
        const validatedTime = handleTimeInput({ target: { value: newTime } });
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index].endTime = validatedTime === '' ? null : validatedTime;
        setTimeSlots(newTimeSlots);
    };

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: null, endTime: null, slotPrice : null, status: true }]);
    };
    const removeTimeSlot = (index) => {
        const newTimeSlots = timeSlots.filter((_, i) => i !== index);
        setTimeSlots(newTimeSlots);
    };
    const validateForm = () => {
        const errors = [];
        if (startDate == null || startDate == "") {
            setStartDateErr( "Day is required" );
        }
        timeSlots.forEach((slot, index) => {
            const slotErrors = {};
            if (!slot.startTime) slotErrors.startTime = "Start time is required";
            if (!slot.endTime) slotErrors.endTime     = "End time is required";
            if (!slot.slotPrice) slotErrors.slotPrice = "Slot price is required";
            
            errors[index] = slotErrors;
        });
        setErrors(errors);
        return !errors.some((error) => Object.keys(error).length > 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const obj = {
                userId     : userDetails?.user_id,
                email      : userDetails?.email,
                id         : timeSlots.map(slot => slot.id),
                slot_id    : timeSlots.map(slot => slot.slotId),
                slot_date  : startDate,
                start_time : timeSlots.map(slot => slot.startTime),
                end_time   : timeSlots.map(slot => slot.endTime),
                slot_price : timeSlots.map(slot => slot.slotPrice),
                status     : timeSlots.map(slot => (slot.status ? 1 : 0))
            };
            postRequestWithToken('road-assistance-edit-time-slot', obj, (response) => {
                if (response.code === 200) {
                    toast(response.message || response.message, { type: "success" });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/ev-road-assistance/time-slot-list');
                    }, 2000)

                } else {
                    console.log('error in edit-time-slot API', response);
                    setLoading(false);
                }
            });
        } else {
            setLoading(false);
        }
    };
    const handleToggle = (index) => {
        const updatedSlots         = [...timeSlots];
        updatedSlots[index].status = !updatedSlots[index].status;
        setTimeSlots(updatedSlots);
    };
    const handleSlotPriceChange = (index, value) => {
        
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index].slotPrice = value;
        setTimeSlots(newTimeSlots);
    };
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className={styles.containerCharger}>
            <ToastContainer />
            <div className={styles.slotHeaderSection}>
                <h2 className={styles.title}>Edit Slot</h2>
                <button type="button" className={styles.buttonSec} onClick={addTimeSlot}>
                    <img src={Add} alt="Add" className={styles.addImg} />
                    <span className={styles.addContent}>Add</span>
                </button>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.chargerSection}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Select Date</label>
                        <div className={styles.datePickerWrapper}>
                            <CustomDropdown options={dayOptions} value={dayOptions.find(option => option.value === startDate)} placeholder="Select Days"
                                onChange={(selectedOption) => setStartDate(selectedOption.value)} onMenuOpen={toggleDropdown} onMenuClose={toggleDropdown}/>
                        </div>
                        {startDateErr && startDate == null && <span className="error">{startDateErr}</span>}
                    </div>
                </div>

                {timeSlots.map((slot, index) => (
                    <div key={index} className={styles.slotMainFormSection}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Start Time</label>
                            <InputMask mask="99:99" className={styles.inputCharger} value={slot.startTime} placeholder="HH:MM" onChange={(e) => handleStartTimeChange(index, e.target.value)} />
                            {errors[index]?.startTime && <span className="error">{errors[index].startTime}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>End Time</label>
                            <InputMask mask="99:99" className={styles.inputCharger} value={slot.endTime} placeholder="HH:MM" onChange={(e) => handleEndTimeChange(index, e.target.value)} />
                            {errors[index]?.endTime && <span className="error">{errors[index].endTime}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Slot Price</label>
                            <input className={styles.inputCharger} type="text" autoComplete='off' placeholder="Enter Slot Price" maxLength="10" value={slot.slotPrice} inputMode="decimal"
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (/^$|^\d*\.?\d*$/.test(val)) {
                                        handleSlotPriceChange(index, val);
                                    }
                                }}
                            />
                            {errors[index]?.slotPrice && <span className="error">{errors[index].slotPrice}</span>}
                        </div>

                        <div className={styles.toggleContainer}>
                            <label className={styles.statusLabel}>Status</label>
                            <div className={styles.toggleSwitch} onClick={() => handleToggle(index)}>
                                <div className={`${styles.toggleButton} ${slot.status ? styles.active : styles.inactive}`}>
                                    <div className={styles.slider}></div>
                                </div>

                                <span className={`${styles.toggleText} ${slot.status ? styles.activeText : styles.inactiveText}`}>
                                    {slot.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        {timeSlots.length > 1 && (
                            <button type="button" className={styles.buttonContainer} onClick={() => removeTimeSlot(index)}>
                                <img className={styles.removeContent} src={Delete} alt="delete" />
                            </button>
                        )}
                    </div>
                ))}

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} type="button" onClick={handleCancel}>Cancel</button>
                    <button disabled={loading} className={styles.submitBtn} type="submit">
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Submit...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>
            </form >
        </div>
    );
};

export default EditPortableChargerTimeSlot;

