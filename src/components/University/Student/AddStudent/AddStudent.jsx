import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./AddStudent.module.css";
import { MdOutlineCloudUpload } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineClose } from 'react-icons/ai';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";

const AddStudent = () => {
    const navigate                                        = useNavigate();    
    const userDetails                                     = JSON.parse(sessionStorage.getItem('userDetails'));
    const [errors, setErrors]                             = useState({});
    const [loading, setLoading]                           = useState(false);
    const [loadingUniversities, setLoadingUniversities]   = useState(false);
 
    const [studentName, setStudentName]                   = useState('');
    const [contact, setContact]                           = useState('');
    const [emailID, setEmailID]                           = useState('');
    const [university, setUniversity]                     = useState([]);
    const [universityOptions, setUniversityOptions]       = useState([]);
    const [studentID, setStudentID]                       = useState('');
    const [file, setFile]                                 = useState(null);

    const userObj = {
        userId: userDetails?.user_id,
        email: userDetails?.email,
        country_id:userDetails?.country_id,
    };
 
    const handleCancel = () => {
        navigate('/mobility/universities/student-list');
    }
 
    function handleUniversityChange(value) {
        setUniversity(value);
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
            event.preventDefault();
        }
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
        }
    };
    const handleRemoveImage = () => setFile(null);

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    useEffect(() => {
        return () => { if (file) { URL.revokeObjectURL(URL.createObjectURL(file)); } };
    }, [file]);
    
    const validateForm = () => {
        const fields = [
            { name: "studentName",   value: studentName,        errorMessage: "Student Name is required." },
            { name: "contact",       value: contact,            errorMessage: "Contact Number is required." },
            { name: "emailID",       value: emailID,            errorMessage: "Email ID is required." },
            { name: "university",    value: university?.value,  errorMessage: "University is required.",         isArray: true },
            { name: "studentID",     value: studentID,          errorMessage: "Student ID is required." },
            { name: "file",          value: file,               errorMessage: "Student ID Image is required." },
        ];
    
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});

        if (contact && !/^\d{10}$/.test(contact)) {
            newErrors.contact = "Contact Number must be 10 digits only.";
        }

        if (emailID && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailID)) {
            newErrors.emailID = "Please enter a valid email address.";
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
            formData.append("country_id", userDetails?.country_id);
 
            formData.append("first_name", studentName);
            formData.append("rider_mobile", contact);
            formData.append("rider_email", emailID);
            formData.append("university_id", university.value);
            formData.append("student_id", studentID);

            if (file) { formData.append("id_image", file) }
            postRequestWithTokenAndFile('add-student', formData, async (response) => {
                 if (response.status === 1) {
                    toast.success(response.message || response.message[0])
                    setTimeout(() => {
                        setLoading(false);
                        toast.success("Some fields are missing");
                        navigate('/mobility/universities/student-list');
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

    function getUniversities() {
        setLoadingUniversities(true);
        postRequestWithToken('university-list-for-select', { ...userObj, requirement: "university" }, (response) => {
            if (response.code === 200) {
                const universityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.university_id
                }));
            setUniversityOptions(universityList);
            } else {
                console.log('error in get-university API', response);
            }
            setLoadingUniversities(false);
        });
    }
    
    return (
        <div className={styles.addStationContainer}>
            
            <div className={styles.addHeading}>Add Student</div>
            <div className={styles.addStationFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="studentName" placeholder="Student Name" className={styles.inputField} value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                                    {errors.studentName && studentName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.studentName}</p>}
                                </div>
                            </div>
                            
                        </div>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="contact" placeholder="Contact Number" className={styles.inputField} value={contact} maxLength={10}
                                        onChange={(e) => { 
                                            const value = e.target.value;
                                            if (/^-?\d*\.?\d{0,8}$/.test(value)) { setContact(value)} } } 
                                    />
                                    {errors.contact && <p className={styles.error} style={{ color: 'red' }}>{errors.contact}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
 
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                             <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="emailID" placeholder="E-mail ID" className={styles.inputField} value={emailID} onChange={(e) => setEmailID(e.target.value)} />
                                    {errors.emailID && <p className={styles.error} style={{ color: 'red' }}>{errors.emailID}</p>}
                                </div>
                            </div>
                            
                        </div>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <CustomDropdown options={universityOptions} value={university} onChange={handleUniversityChange} placeholder="Select University" onMenuOpen={getUniversities} isLoading={loadingUniversities}/>
                                    {errors.university && university.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.university}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
 
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="studentID" placeholder="Student ID" className={styles.inputField} value={studentID} onChange={(e) => setStudentID(e.target.value)} />
                                    {errors.studentID && studentID === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.studentID}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                             <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Student ID'}</span>
                                        <label htmlFor="coverImage" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload</label>
                                        <input type="file" id="coverImage"  accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
                                    </div>
                                    {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                </div>
                            </div>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.galleryContainer}>
                                        {file && (
                                            <div className={styles.imageContainer}>
                                                <img alt="Preview" className={styles.previewImage} src={URL.createObjectURL(file)} />
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
        </div>
    );
};
 
export default AddStudent;