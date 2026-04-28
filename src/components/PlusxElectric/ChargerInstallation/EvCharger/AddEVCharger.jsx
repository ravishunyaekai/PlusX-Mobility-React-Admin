import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from './addEvCharger.module.css';

import { AiOutlineClose } from 'react-icons/ai';
import { MdOutlineCloudUpload } from "react-icons/md";
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import MultiCustomDropdown from "../../../SharedComponent/UI/CustomMultiDropdown/MultiSelectDropdown";

import Add from '../../../../assets/images/Add.svg';
import PdfIcon from "../../../../assets/images/PdfIcon.svg";
import UploadIcon from '../../../../assets/images/uploadicon.svg';

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

    const [vehicleSpecification, setvehicleSpecification] = useState([]);
    const [vehicleBrand, setvehicleBrand]                 = useState([]);
    const [vehicleModal, setvehicleModal]                 = useState([]);
    const [price, setPrice]                               = useState('');
    const [usedFor, setUsedFor]                           = useState([]);
    const [propertyType, setpropertyType ]                = useState([]);

    const [compatibleOption, setCompatibleOption]       = useState([]);
    const [brandOption, setBrandOption]                 = useState([]);
    const [modalOption, setModalOption]                 = useState([]);
    const [galleryFiles, setGalleryFiles]               = useState([]);
    const [specificationOption, setSpecificationOption] = useState([
        { value : 'GCC', label: 'GCC' },
        { value : 'Non-GCC', label: 'Non-GCC' },
    ]);
    const [usedForOption, setUsedForOption]             = useState([
        { value : 'Commercial', label: 'Commercial' },
        { value : 'Personal',   label: 'Personal' },
        { value : 'Fleet',      label: 'Fleet' },
    ]);
    const [propertyTypeOption, setPropertyTypeOption]   = useState([
        { value : 'Warehouse',           label: 'Warehouse' },
        { value : 'Hotel',               label: 'Hotel' },
        { value : 'Appartment',          label: 'Appartment' },
        { value : 'Villas',              label: 'Villas' },
        { value : 'Malls',               label: 'Malls' },
        { value : 'Commercial Building', label: 'Commercial Building' },
    ]);

    const [allBrandModaldata, setAllBrandModaldata] = useState([]);
    const brandDropdownRef                          = useRef(null);
    const serviceDropdownRef                        = useRef(null);

    const fetchDetails = () => {
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };
        postRequestWithToken('ev-all-charger-list', obj, (response) => {
            if (response.code === 200) {

                setCompatibleOption(response?.data);
                setAllBrandModaldata(response?.vehicleData);

                const uniqueBrands = [...new Set(response?.vehicleData.map(item => item.brand))];
                const allBrand = (uniqueBrands || []).map(item => ({
                    label: item,
                    value: item
                }));
                setBrandOption(allBrand)
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

    useEffect(() => {
        return () => {
            galleryFiles.forEach((image) => URL.revokeObjectURL(image));
        };
    }, [galleryFiles]);

    const handleCancel = () => {
        navigate('/electric/charger-installation/ev-charger-list')
    }
    const validateForm = (featureValues) => {
        const fields = [
            { name: "chargerName",  value: chargerName,  errorMessage: "Charger Name is required." },
            { name: "compatible",   value: compatible,    errorMessage: "Compatible is required.", isArray: true },
            { name: "outputPower",  value: outputPower,   errorMessage: "Output Power is required."},
            { name: "warrantyType", value: warrantyType,  errorMessage: "Warranty Type is required."},
            { name: "feature",      value: featureValues, errorMessage: "Feature is required.", isArray: true },
            { name: "description",  value: description,   errorMessage: "Description is required." },
            // { name: "vehicleSpecification", value: vehicleSpecification, errorMessage: "Specification is required.", isArray: true  },
            { name: "price",  value: price,   errorMessage: "Price is required." },
            // { name: "vehicleBrand",  value: vehicleBrand,  errorMessage: "Vehicle Brand is required.", isArray: true  },
            // { name: "vehicleModal",  value: vehicleModal,  errorMessage: "Vehicle Model is required.", isArray: true  },
            { name: "usedFor",       value: usedFor,       errorMessage: "Used For is required.", isArray: true  },
            { name: "propertyType",  value: propertyType,  errorMessage: "Property Type is required.", isArray: true  },

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
            formData.append("compatible", JSON.stringify(compatible) ); 
            formData.append("outputPower", outputPower);
            formData.append("warrantyType", warrantyType);
            formData.append("charger_feature", JSON.stringify(featureValues));
            formData.append("description", description);
            formData.append("vehicleSpecification", vehicleSpecification.value);
            formData.append("vehicleBrand", vehicleBrand.value);
            formData.append("vehicleModal", vehicleModal.value);
            formData.append("price", price);
            formData.append("usedFor", JSON.stringify(usedFor));
            formData.append("propertyType", JSON.stringify(propertyType));
            // formData.append("usedFor", usedFor.value);
            // formData.append("propertyType", propertyType.value);

            if (specification) {
                formData.append("specification_pdf", specification);
            }
            if (file) {
                formData.append("charger_image", file);
            }
            if (galleryFiles.length > 0) {
                galleryFiles.forEach((galleryFile) => {
                    formData.append("charger_gallery", galleryFile);
                });
            }
            postRequestWithTokenAndFile('ev-charger-add', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/charger-installation/ev-charger-list');
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
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            setFile(selectedFile);
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
        }
    };
    const handleSpecificationChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) {  //application/pdf
            setspecification(selectedFile);
            setErrors((prev) => ({ ...prev, specification: "" }));
        } else {
            toast.error("Please upload a valid pdf file.");
        }
    };

    const handleRemoveImage         = () => setFile(null);
    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        // const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        const validFiles = selectedFiles.filter(file => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type));
 
        if (validFiles.length !== selectedFiles.length) {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
            return;
        }
        setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
        // setErrors((prev) => ({ ...prev, gallery: "" }));
    };
 
    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };
    const handleRemoveSpecification = () => setspecification(null);
    
    const addFeatures = () =>{
        setfeature([...feature, { features : '' }]);
    }
    const handlefeaturesdata = (index, featureVal) => {
        
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
    const handleSpecification = (selectedOptions) =>{
        setvehicleSpecification(selectedOptions)
    }
    const brandModelsMap = allBrandModaldata.reduce((acc, { brand, model }) => {
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(model);
        return acc;
    }, {});
    const handleBrand = (selectedOptions) => {
        setvehicleBrand(selectedOptions)  
        setvehicleModal([]);
        const allModels = brandModelsMap[selectedOptions.value].map(item => ({
            label: item,
            value: item
        }));
        setModalOption(allModels);
    }
    const handleModel = (selectedOptions) => {
        setvehicleModal(selectedOptions)
    }
    const handleUsedFor = (selectedOptions) => {
        setUsedFor(selectedOptions)
    }
    const handleProperty = (selectedOptions) => {
        setpropertyType(selectedOptions)
    }

    return (
        <div className={styles.addStationContainer}>
            <div className={styles.addHeading}>Add EV Charger</div>
            <div className={styles.addStationFormSection}>
                <ToastContainer />
                <form className={styles.formSection} onSubmit={handleSubmit}>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label className={styles.labelText} htmlFor="chargerName">Charger Name</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="chargerName" placeholder="Charger Name" className={styles.inputField} value={chargerName} onChange={(e) => setChargerName(e.target.value)} />
                                    {errors.chargerName && chargerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerName}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="compatible" className={styles.labelText}>Compatible</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <MultiCustomDropdown options={compatibleOption} value={compatible} onChange={handleCompatibility} labelledBy="Compatible" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll  />
                                    {errors.compatible && compatible.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.compatible}</p>}
                                    {/* selectAllValue={compatibleOption[0]?.value} allSelectedLabel={compatibleOption[0]?.label} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="outputPower" className={styles.labelText}>Output Power</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="outputPower" placeholder="Output Power" className={styles.inputField} value={outputPower} onChange={(e) => setoutputPower(e.target.value)} />
                                    {errors.outputPower && outputPower === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.outputPower}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="warrantyType" className={styles.labelText}>Warranty Type</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="warrantyType" placeholder="warranty Type" className={styles.inputField} value={warrantyType} onChange={(e) => setwarrantyType(e.target.value)} />
                                    {errors.warrantyType && warrantyType === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.warrantyType}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="price" className={styles.labelText}>Price</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <input type="text" autoComplete="off" id="price" placeholder="Price" className={styles.inputField} value={price} onChange={(e) => setPrice(e.target.value)} />
                                    {errors.price && price === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.price}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="vehicleBrand" className={styles.labelText}>Vehicle Brand</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <CustomDropdown options={brandOption} value={vehicleBrand} onChange={handleBrand} labelledBy="Select Brand" closeOnChangedValue={false} closeOnSelect={false}/>
                                    {errors.vehicleBrand && vehicleBrand.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleBrand}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="vehicleModal" className={styles.labelText}>Vehicle Model</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <CustomDropdown options={modalOption} value={vehicleModal} onChange={handleModel} labelledBy="Select Specification" closeOnChangedValue={false} closeOnSelect={false}/>
                                    {errors.vehicleModal && vehicleModal.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.vehicleModal}</p>}
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="usedFor" className={styles.labelText}>Used For</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <MultiCustomDropdown options={usedForOption} value={usedFor} onChange={handleUsedFor} labelledBy="Select Used For" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll/>
                                    {errors.usedFor && usedFor.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.usedFor}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="propertyTypeOption" className={styles.labelText}>Property Type</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <MultiCustomDropdown options={propertyTypeOption} value={propertyType} onChange={handleProperty} labelledBy="Select Property Type" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll/>
                                    {errors.propertyType && propertyType.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.propertyType}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label className={styles.featureLabel} htmlFor="Features"> Features 
                                <button type="button" onClick={addFeatures} className={styles.featureButton}>
                                    <img src={Add} alt="Add" className={styles.addImg} />
                                    <span className={styles.addContent}>Add</span>
                                </button>
                            </label>
                            <div className={`row`}>
                                <div className={`col-xl-12 col-lg-12`}>
                                    {feature.map((feature, index) => (<>
                                        <div ref={serviceDropdownRef} className={styles.featureDivision}>
                                            <input type="text" autoComplete="off" id={`Feature`} placeholder={`Feature`} className={styles.inputField} value={feature.features} onChange={(e) => handlefeaturesdata(index, e.target.value)} />
                                                {index > 0 && (
                                                    <button type="button" className={styles.removeButton} onClick={() => handleRemoveFeature(index )}>
                                                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                                                    </button>
                                                )}
                                            </div>
                                    </>))}
                                    {errors.feature && feature[0].features == '' && <p className={styles.error} style={{ color: 'red' }}>{errors.feature}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`row`}>
                        <div className={`col-xl-11 col-lg-12`}>
                            <label htmlFor="description" className={styles.labelText}>Description</label>
                                <div className={`row`}>
                                <div className={`col-xl-12 col-lg-12`}>
                                    <textarea id="description" placeholder="Enter Description" className={styles.inputField} rows="4" value={description} onChange={(e) => setDescription(e.target.value)} />
                                    {errors.description && description === '' && <p className="error" style={{ color: 'red' }}>{errors.description}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`row`}>
                        <div className={`col-lg-6`}>
                            <label htmlFor="coverFileUpload" className={styles.labelText}>Specification PDF</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>{specification ? `${specification?.name}` : 'Upload File'}</span>
                                        <label htmlFor="specificationFileUpload" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                        <input type="file" id="specificationFileUpload" accept=".pdf" onChange={handleSpecificationChange} className={styles.hiddenInput} />
                                    </div>
                                    {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                </div>
                            </div>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.galleryContainer}>
                                        {specification && (
                                            <div className={styles.imageContainer}>
                                                <img alt="Preview" className={styles.previewImage} src={PdfIcon} />
                                                <button type="button" className={styles.removeButton} onClick={handleRemoveSpecification}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`col-lg-6`}>
                            <label htmlFor="coverFileUpload" className={styles.labelText}>Cover Image</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                        <label htmlFor="coverFileUpload" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                        <input type="file" id="coverFileUpload" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
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
                        <div className={`col-lg-6`}>
                            <label htmlFor="Station Image" className={styles.labelText}> Gallery</label>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                    <div className={styles.uploadContainer}>
                                        <span className={styles.uploadLabel}>
                                            {galleryFiles.length > 0
                                                ? (
                                                    galleryFiles.length > 2 ? `${galleryFiles[0].name}, ${galleryFiles[1].name}... (${galleryFiles.length - 2} more)` : galleryFiles.map(file => file.name).join(', ')
                                                    )
                                                : 'Upload Gallery Image'}
                                        </span>
                                        <label htmlFor="galleryFiles" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                        <input type="file" multiple id="galleryFiles" accept=".jpg,.jpeg,.png" onChange={handleGalleryChange} className={styles.hiddenInput} />
                                    </div>
                                    {errors.galleryFiles && <p className={styles.error} style={{ color: 'red' }}>{errors.galleryFiles}</p>}
                                </div>
                            </div>
                            <div className={`row`}>
                                <div className={`col-xl-10 col-lg-12`}>
                                        <div className={styles.galleryContainer}>
                                        {galleryFiles.map((file, index) => (
                                            <div className={styles.imageContainer} key={index}>
                                                <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={URL.createObjectURL(file)} />
                                                <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(index)}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                            </div>
                                        ))}
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

export default AddEVCharger;
