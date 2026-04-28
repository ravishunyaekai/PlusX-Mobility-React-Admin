import React, { useState } from "react";
import UploadIcon from '../../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addpod.module.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const EditBrandForm = () => {
    const [file, setFile] = useState(null);
    const [stationName, setStationName] = useState("");
    const [startDate, setStartDate] = useState(null); // State for start date
    const [endDate, setEndDate] = useState(null); // State for end date
    const [errors, setErrors] = useState({});

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            alert('Please upload a valid image file.');
        }
    };

    const handleRemoveImage = () => setFile(null);

    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Edit Brands</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="shopName">Brand Name</label>
                            <input
                                type="text"
                                id="shopName"
                                placeholder="Brand Name"
                                className={styles.inputField}
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                            />
                            {errors.stationName && <p className={styles.error} style={{ color: 'red' }}>{errors.stationName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="startDate">Advertising Start Date</label>
                            <DatePicker
                                className={styles.inputField}
                                selected={startDate} 
                                onChange={(date) => setStartDate(date)} 
                                minDate={new Date()} 
                                maxDate={new Date().setDate(new Date().getDate() + 14)} 
                                dateFormat="dd-MM-yyyy" 
                                placeholderText="Select Start Date" 
                            />
                            {errors.startDate && <p className={styles.error} style={{ color: 'red' }}>{errors.startDate}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="endDate">End Date</label>
                            <DatePicker
                                className={styles.inputField}
                                selected={endDate} 
                                onChange={(date) => setEndDate(date)} 
                                minDate={startDate || new Date()} 
                                maxDate={new Date().setDate(new Date().getDate() + 14)} 
                                dateFormat="dd-MM-yyyy" 
                                placeholderText="Select End Date" 
                            />
                            {errors.endDate && <p className={styles.error} style={{ color: 'red' }}>{errors.endDate}</p>}
                        </div>

                    </div>
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="fileUpload"
                                accept=".jpeg,.jpg"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {!file ? (
                                <label htmlFor="fileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        className={styles.previewImage}
                                    />
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={handleRemoveImage}
                                    >
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className="error">{errors.file}</p>}
                    </div>
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn}>Cancel</button>
                        <button type="submit" className={styles.editSubmitBtn}>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBrandForm;
