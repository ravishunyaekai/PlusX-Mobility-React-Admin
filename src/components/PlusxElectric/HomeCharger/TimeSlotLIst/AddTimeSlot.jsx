import { useEffect, useState } from 'react';
import styles from './addtimeslot.module.css';
import InputMask from 'react-input-mask';
import Calendar from '../../../../assets/images/Calender.svg'
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { postRequestWithToken } from '../../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Add from '../../../../assets/images/Add.svg';
import Delete from '../../../../assets/images/Delete.svg'

dayjs.extend(isSameOrAfter);

const AddPortableChargerTimeSlot = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    // const [timeSlots, setTimeSlots] = useState([
    //     { date: new Date(), startTime: null, endTime: null, bookingLimit: "" }
    // ]);;
    const [date, setDate] = useState(new Date()); // Separate state for the date
    const [timeSlots, setTimeSlots] = useState([
        { startTime: null, endTime: null, bookingLimit: "" }
    ]);
    const [startDate, setStartDate] = useState(new Date());
    const [errors, setErrors] = useState([]);
    const [loading, setLoading]           = useState(false);

    const handleCancel = () => {
        navigate('/electric/home-charger/charger-booking-time-slot-list');
    };

    const handleDateChange = (index, date) => {
        const newTimeSlots = [...timeSlots];
        newTimeSlots[index].date = date;
        setTimeSlots(newTimeSlots);
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

    const handleBookingLimitChange = (index, e) => {
        const value = e.target.value;
        if (/^\d{0,4}$/.test(value)) {
            const newTimeSlots = [...timeSlots];
            newTimeSlots[index].bookingLimit = value;
            setTimeSlots(newTimeSlots);
        }
    };

    const handleBookingLimitKeyPress = (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const addTimeSlot = () => {
        // setTimeSlots([...timeSlots, { date: null, startTime: null, endTime: null, bookingLimit: "" }]);
        setTimeSlots([...timeSlots, { startTime: null, endTime: null, bookingLimit: "" }]);
    };

    const removeTimeSlot = (index) => {
        const newTimeSlots = timeSlots.filter((_, i) => i !== index);
        setTimeSlots(newTimeSlots);
    };

    // const validateForm = () => {
    //     const newErrors = timeSlots.map((slot) => {
    //         const errors = {};

    //         if (!slot.date) {
    //             errors.date = "Date is required";
    //         }

    //         if (!slot.startTime) {
    //             errors.startTime = "Start time is required";
    //         }

    //         if (!slot.endTime) {
    //             errors.endTime = "End time is required";
    //         }

    //         if (!slot.bookingLimit) {
    //             errors.bookingLimit = "Booking limit is required";
    //         } else if (isNaN(slot.bookingLimit) || slot.bookingLimit <= 0) {
    //             errors.bookingLimit = "Booking limit must be a positive number";
    //         }

    //         return errors;
    //     });

    //     setErrors(newErrors);
    //     return newErrors.every((error) => Object.keys(error).length === 0);
    // };


    const validateForm = () => {
        const errors = [];
        if (!date) {
            errors.push({ date: "Date is required" });
        }
        timeSlots.forEach((slot, index) => {
            const slotErrors = {};
            if (!slot.startTime) slotErrors.startTime = "Start time is required";
            if (!slot.endTime) slotErrors.endTime = "End time is required";
            if (!slot.bookingLimit) {
                slotErrors.bookingLimit = "Booking limit is required";
            } else if (isNaN(slot.bookingLimit) || slot.bookingLimit <= 0) {
                slotErrors.bookingLimit = "Booking limit must be a positive number";
            }
            errors[index] = slotErrors;
        });
        setErrors(errors);
        return !errors.some((error) => Object.keys(error).length > 0);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            const slot_date = dayjs(date).format("DD-MM-YYYY");
            const start_time = timeSlots.map(slot => slot.startTime);
            const end_time = timeSlots.map(slot => slot.endTime);
            const booking_limit = timeSlots.map(slot => slot.bookingLimit);
            const status = timeSlots.map(slot => "1");
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                // slot_date     : timeSlots.map(slot => slot.date ? dayjs(slot.date).format("DD-MM-YYYY") : ''),
                // start_time    : timeSlots.map(slot => slot.startTime),
                // end_time      : timeSlots.map(slot => slot.endTime),
                // booking_limit : timeSlots.map(slot => slot.bookingLimit),

                slot_date,
                start_time,
                end_time,
                booking_limit,
                status
            };

            postRequestWithToken('charger-add-time-slot', obj, (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/home-charger/charger-booking-time-slot-list');
                    }, 2000)
                } else {
                    toast(response.message || response.message[0], { type: "error" });
                    console.log('error in charger-slot-list api', response);
                    setLoading(false);
                }
            });
        } else {
            console.log('Validation error');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
        }
    }, [userDetails, navigate]);
    return (
        <div className={styles.containerCharger}>
            <div className={styles.slotHeaderSection}>
                <h2 className={styles.title}>Add Slot</h2>
                <button type="button" className={styles.buttonSec} onClick={addTimeSlot}>
                    <img src={Add} alt="Add" className={styles.addImg} />
                    <span className={styles.addContent}>Add</span>
                </button>
            </div>
            <ToastContainer />
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.chargerSection}>
                    <div className={styles.addSection}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Select Date</label>
                            <div className={styles.datePickerWrapper}>
                            <DatePicker
                                className={`${styles.inputCharger} custom-datepicker`} 
                                selected={date}
                                onChange={(date) => setDate(date)}
                                minDate={new Date()}
                                maxDate={new Date().setDate(new Date().getDate() + 30)}
                            />
                            <img className={styles.datePickerImg} src={Calendar} alt="calendar" />
                            </div>
                            {errors.date && <span className="error">{errors.date}</span>}
                        </div>

                    </div>
                </div>
                {timeSlots.map((slot, index) => (
                    <div key={index} className={styles.slotMainFormSection}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Start Time</label>
                            <InputMask
                                mask="99:99"
                                className={styles.inputCharger}
                                value={slot.startTime}
                                onChange={(e) => handleStartTimeChange(index, e.target.value)}
                                placeholder="HH:MM"
                            />
                            {errors[index]?.startTime && <span className="error">{errors[index].startTime}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>End Time</label>
                            <InputMask
                                mask="99:99"
                                className={styles.inputCharger}
                                value={slot.endTime}
                                onChange={(e) => handleEndTimeChange(index, e.target.value)}
                                placeholder="HH:MM"
                            />
                            {errors[index]?.endTime && <span className="error">{errors[index].endTime}</span>}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Booking Limit</label>
                            <input
                                className={styles.inputCharger}
                                type="text"
                                autoComplete='off'
                                placeholder="Enter Booking Limit"
                                maxLength="4"
                                value={slot.bookingLimit}
                                onChange={(e) => handleBookingLimitChange(index, e)}
                            />
                            {errors[index]?.bookingLimit && <span className="error">{errors[index].bookingLimit}</span>}
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


export default AddPortableChargerTimeSlot;
