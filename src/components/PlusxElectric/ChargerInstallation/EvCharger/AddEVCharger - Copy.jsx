import React, { useState, useRef, useEffect } from "react";
// import Select from "react-select";
// import { GoogleMap, useJsApiLoader, useLoadScript, Marker } from "@react-google-maps/api";
import UploadIcon from '../../../assets/images/uploadicon.svg';
import { AiOutlineClose } from 'react-icons/ai';
import styles from './addEvCharger.module.css';
import { useNavigate } from 'react-router-dom';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
// import ReactInputMask from "react-input-mask"

import Add from '../../../assets/images/Add.svg';
import PdfIcon from "../../../assets/images/PdfIcon.svg";
import { MultiSelect } from "react-multi-select-component";

const AddEVCharger = () => {
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate();
    const [file, setFile]                   = useState(null);
    const [errors, setErrors]               = useState({});
    const [loading, setLoading]             = useState(false);
    const [chargerName, setChargerName]     = useState('');
    const [compatible, setCompatible]       = useState([]);
    const [outputPower, setoutputPower]     = useState('');
    const [warrantyType, setwarrantyType]   = useState('');
    
    const [description, setDescription]     = useState('');
    const [specification, setspecification] = useState('');
    const [feature, setfeature]             = useState([ { features : '' } ]);

    const [compatibleOption, setCompatibleOption] = useState([]);
    const brandDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);
    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken('ev-all-charger-list', obj, (response) => {
            if (response.code === 200) {

                // const transformedChargingFor = (response?.data?.chargingFor || []).map(item => ({
                //     label: item,
                //     value: item
                // }));
                setCompatibleOption(response?.data);
            } else {
                console.log('error in rider-details API', response);
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
        navigate('/charger-installation/ev-charger-list')
    }
    const validateForm = (featureValues) => {
        const fields = [
            { name: "chargerName",   value: chargerName,  errorMessage: "Charger Name is required." },
            { name: "compatible",   value: compatible,    errorMessage: "Compatible is required.", isArray: true },
            { name: "outputPower",  value: outputPower,   errorMessage: "Output Power is required."},
            { name: "warrantyType", value: warrantyType,  errorMessage: "Warranty Type is required."},
            { name: "feature",      value: featureValues, errorMessage: "Feature is required.", isArray: true },
            { name: "description",  value: description,   errorMessage: "Description is required." },
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

        const featureValues = feature.filter(f => f.features.trim() !== '').map(f => f.features);
        if (validateForm(featureValues)) {
        
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("charger_name", chargerName);
            formData.append("compatible", compatible); 
            formData.append("outputPower", outputPower);
            formData.append("warrantyType", warrantyType);
            formData.append("charger_feature", featureValues);
            formData.append("description", description);
         
            // if (compatible && compatible.length > 0) {
            //     const compatibleString = compatible.map(brand => brand.value).join(', ');
            //     formData.append("compatible", compatibleString);
            // }
            if (specification) {
                formData.append("specification_pdf", specification);
            }
            if (file) {
                formData.append("charger_image", file);
            }
            postRequestWithTokenAndFile('ev-charger-add', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/charger-installation/ev-charger-list');
                    }, 1000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('Error in public-charger-add-station API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };    
    
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast('Please upload a valid Image file.', {type:'error'})
        }
    };
    const handleSpecificationChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) {  //application/pdf
            setspecification(selectedFile);
            setErrors((prev) => ({ ...prev, specification: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleRemoveImage         = () => setFile(null);
    const handleRemoveSpecification = () => setspecification(null);
    
    const addFeatures = () =>{
        setfeature([...feature, { features : '' }]);
    }
    const handlefeaturesdata = (index, featureVal) => {
        console.log('asdas', index, featureVal)
        const oldfeature = [...feature];
        oldfeature[index].features = featureVal;
        setfeature(oldfeature)
    };
    const handleRemoveFeature = (index) => {
        const updated = feature.filter((_, i) => i !== index);
        setfeature(updated);
    };
    const handleCompatibility = (selectedOptions) =>{
        setCompatible(selectedOptions)
    }
    console.log(compatible)
    return (
        <div className={styles.addShopContainer}>
            <div className={styles.addHeading}>Add EV Charger</div>
            <div className={styles.addShopFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="chargerName">Charger Name</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="chargerName"
                                placeholder="Charger Name"
                                className={styles.inputField}
                                value={chargerName}
                                onChange={(e) => setChargerName(e.target.value)}
                            />
                            {errors.chargerName && chargerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="compatible">Compatible</label>
                            <div ref={brandDropdownRef}>
                                <MultiSelect
                                    className={styles.addShopSelect}
                                    options={compatibleOption}
                                    value={compatible}
                                    onChange={handleCompatibility}
                                    labelledBy="Compatible"
                                    closeOnChangedValue={false}
                                    closeOnSelect={false}
                                />
                            </div>
                            {errors.compatible && compatible.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.compatible}</p>}
                        </div>
                        
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="email">Output Power</label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="outputPower"
                                placeholder="Output Power"
                                className={styles.inputField}
                                value={outputPower}
                                onChange={(e) => setoutputPower(e.target.value)}
                            />
                            {errors.outputPower && outputPower === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.outputPower}</p>}
                        </div>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="warrantyType"> Warranty Type </label>
                            <input
                                type="text"
                                autoComplete="off"
                                id="warrantyType"
                                placeholder="Warranty Type"
                                className={styles.inputField}
                                value={warrantyType}
                                onChange={(e) => setwarrantyType(e.target.value)}
                            />
                            {errors.warrantyType && warrantyType === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.warrantyType}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.featureLabel} htmlFor="Features"> Features 
                                <button type="button" onClick={addFeatures} className={styles.featureButton}>
                                    <img src={Add} alt="Add" className={styles.addImg} />
                                    <span className={styles.addContent}>Add</span>
                                </button>
                            </label>
                            {feature.map((feature, index) => (<>
                                <div ref={serviceDropdownRef} className={styles.featureDivision}>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id={`Feature`}
                                        placeholder={`Feature`}
                                        className={styles.inputField}
                                        value={feature.features}
                                        onChange={(e) => handlefeaturesdata(index, e.target.value)}
                                    />
                                    {index > 0 && (
                                        <button type="button" className={styles.removeButton} 
                                        onClick={() => handleRemoveFeature(index )}
                                        >
                                            <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                        </button>
                                    )}
                                </div>
                            </>))}
                            {errors.feature && feature[0].features == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.feature}</p>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.addShopInputContainer}>
                            <label className={styles.addShopLabel} htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter Description"
                                className={styles.inputField}
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.description && description === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.description}</p>}
                        </div>
                    </div>
                    
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Specification</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="specificationFileUpload"
                                accept=".pdf"
                                onChange={handleSpecificationChange}
                                style={{ display: 'none' }}
                            />
                            {!specification ? (
                                <label htmlFor="specificationFileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img src={PdfIcon} alt="Preview" className={styles.previewImage} 
                                    style={{ height : '100px' }}/>
                                    {/* {URL.createObjectURL(specification)} */}
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveSpecification}>
                                        <AiOutlineClose size={15} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                    </div>     
                    
                    <div className={styles.fileUpload}>
                        <label className={styles.fileLabel}>Cover Image</label>
                        <div className={styles.fileDropZone}>
                            <input
                                type="file"
                                id="coverFileUpload"
                                accept=".jpeg,.jpg"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            {!file ? (
                                <label htmlFor="coverFileUpload" className={styles.fileUploadLabel}>
                                    <img src={UploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
                                    <p>Select File to Upload <br /> or Drag & Drop, Copy & Paste Files</p>
                                </label>
                            ) : (
                                <div className={styles.imageContainer}>
                                    <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImage} />
                                    <button type="button" className={styles.removeButton} onClick={handleRemoveImage}>
                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                    </div>                    
                    <div className={styles.editButton}>
                        <button className={styles.editCancelBtn} onClick={() => handleCancel()}>Cancel</button>
                        <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
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

                </form>
            </div>
        </div>
    );
};

export default AddEVCharger;
