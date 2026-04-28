import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from './addProduct.module.css';
import { AiOutlineClose } from 'react-icons/ai';
import { MdOutlineCloudUpload } from "react-icons/md";
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import MultiCustomDropdown from "../../../SharedComponent/UI/CustomMultiDropdown/MultiSelectDropdown";
import Loader from "../../../SharedComponent/Loader/Loader";

import Add from '../../../../assets/images/Add.svg';
import PdfIcon from "../../../../assets/images/PdfIcon.svg";
import UploadIcon from '../../../../assets/images/uploadicon.svg';


const EditProduct = () => {
    const { chargerId }                     = useParams()
    const userDetails                       = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                          = useNavigate();
    const [file, setFile]                   = useState(null);
    const [galleryFiles, setGalleryFiles]   = useState([]); 
    const [errors, setErrors]               = useState({});
    const [loading, setLoading]             = useState(false);
    const [showLoader, setShowLoader]       = useState(false);

    const [chargerName, setChargerName]     = useState('');
    const [compatible, setCompatible]       = useState([]);
    const [outputPower, setoutputPower]     = useState('');
    const [warrantyType, setwarrantyType]   = useState('');
    
    const [description, setDescription]     = useState('');
    const [specification, setspecification] = useState('');
    const [feature, setfeature]             = useState([ { features : '' } ]);

    const [vehicleSpecification, setvehicleSpecification] = useState({});
    const [vehicleBrand, setvehicleBrand]                 = useState({});
    const [vehicleModal, setvehicleModal]                 = useState({});
    const [price, setPrice]                               = useState('');
    const [chargerType, setChargerType ]                  = useState({});
    const [connectorType, setConnectorType ]              = useState('');
    const [imageBaseUrl, setImageBaseUrl]                 = useState("");
    const [compatibleOption, setCompatibleOption]         = useState([]);
    const [brandOption, setBrandOption]                   = useState([]);
    const [modalOption, setModalOption]                   = useState([]);
    const [specificationOption, setSpecificationOption]   = useState([
        { value : 'GCC', label: 'GCC' },
        { value : 'Non-GCC', label: 'Non-GCC' },
    ]);
    
    const [chargerTypeOption, setChargerTypeOption]   = useState([
        { value : 'AC',  label: 'AC' },
        { value : 'DC',  label: 'DC' }, 
    ]);
    const [allBrandModaldata, setAllBrandModaldata] = useState([]);
    const brandDropdownRef = useRef(null);
    const serviceDropdownRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    
    const fetchDetails = () => {
        setShowLoader(true);
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            charger_id : chargerId,
            brand_data : 1
        };
        postRequestWithToken('ev-accessories-details', obj, (response) => {
            
            if (response.code === 200) {
                const data = response?.data || {};
                setImageBaseUrl(response?.base_url || "");
                setCompatibleOption(response?.brandData);
                setAllBrandModaldata(response?.vehicleData);

                const uniqueBrands = [...new Set(response?.vehicleData.map(item => item.brand))];
                const allBrand = (uniqueBrands || []).map(item => ({
                    label: item,
                    value: item
                }));
                setBrandOption(allBrand)

                setChargerName(data?.charger_name);
                setCompatible(data?.compatible);
                setoutputPower(data?.outputPower);
                setwarrantyType(data?.warrantyType);
                setDescription(data?.description);
                // setspecification(data?.specification_pdf);
                setfeature(data?.charger_feature);
                // setFile(data?.charger_image);
                setFile({
                    name: data?.charger_image,
                    url: `${response?.base_url}${data?.charger_image}`,
                    type: "image/*"
                });
                setspecification({
                    name: data?.specification_pdf,
                    url: `${response?.base_url}${data?.specification_pdf}`,
                    type: "application/pdf"
                });
                const galleryArr = (response?.gallery_data || []).map((img) => ({
                    name: img,
                    url : `${response?.base_url}${img}`,
                    type: "image/jpeg",
                    file: null,
                }));
                setGalleryFiles(galleryArr);
                const statusMap = data?.status === 1 ? true : false;
                setIsActive(statusMap); 

                const newFtrs = [];
                data?.charger_feature.map( (value, index) => {
                    newFtrs.push( { features : value });
                });
                setfeature(newFtrs);
                
                setvehicleSpecification({ label: data?.vehicle_specification, value: data?.vehicle_specification })
                setvehicleBrand({ label: data?.vehicle_brand, value: data?.vehicle_brand })
                setvehicleModal({ label: data?.vehicle_modal, value: data?.vehicle_modal })
                setPrice(data?.price)
                setChargerType({ label: data?.charger_type, value: data?.charger_type }) 
                setConnectorType(data?.connector_type)


                let allModels = brandModelsMap[data?.vehicle_brand].map(item => ({
                    label: item,
                    value: item
                }));
                setModalOption(allModels);

            } else {
                console.error('Error in ev-charger-details API', response);
            }
            setShowLoader(false);
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
        navigate('/electric/charger-installation/accessories-list')
    }
    const validateForm = (featureValues) => {
        const fields = [
            { name: "chargerName",   value: chargerName,  errorMessage: "Charger Name is required." },
            { name: "compatible",   value: compatible,    errorMessage: "Compatible is required.", isArray: true },
            // { name: "outputPower",  value: outputPower,   errorMessage: "Output Power is required."},
            // { name: "warrantyType", value: warrantyType,  errorMessage: "Warranty Type is required."},
            { name: "feature",      value: featureValues, errorMessage: "Feature is required.", isArray: true },
            { name: "description",  value: description,   errorMessage: "Description is required." },
            // { name: "vehicleSpecification", value: vehicleSpecification, errorMessage: "Specification is required.", isArray: true  },
            { name: "price",  value: price,   errorMessage: "Price is required." },
            // { name: "vehicleBrand",  value: vehicleBrand,  errorMessage: "Vehicle Brand is required.", isArray: true  },
            // { name: "vehicleModal",  value: vehicleModal,  errorMessage: "Vehicle Model is required.", isArray: true  },
            { name: "chargerType",  value: chargerType,  errorMessage: "Charger Type is required.", isArray: true  },
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
            console.log(compatible)
        
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("charger_id", chargerId);
            formData.append("charger_name", chargerName);
            formData.append("compatible", JSON.stringify(compatible) ); 
            formData.append("outputPower", outputPower);
            formData.append("warrantyType", warrantyType);
            formData.append("charger_feature", JSON.stringify(featureValues));
            formData.append("description", description);
            formData.append("status", isActive);
            formData.append("vehicleSpecification", vehicleSpecification.value);
            formData.append("vehicleBrand", vehicleBrand.value);
            formData.append("vehicleModal", vehicleModal.value);
            formData.append("price", price);
            formData.append("chargerType", chargerType.value);
            formData.append("connectorType", connectorType);
            
            if (specification) {
                formData.append("specification_pdf", specification);
            }
            if (file) {
                formData.append("charger_image", file);
            }
            galleryFiles.forEach(img => {
                if (img.file instanceof File) {
                    formData.append("charger_gallery", img.file);
                }
            });
            postRequestWithTokenAndFile('ev-accessories-edit', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/charger-installation/accessories-list');
                    }, 1000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('Error in  API:', response);
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

    const handleGalleryChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        // const validFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
        const validFiles = selectedFiles.filter(file => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type));

        if (validFiles.length !== selectedFiles.length) {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
            return;
        }

        const mappedFiles = validFiles.map(file => ({
            file,
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type,
        }));

        setGalleryFiles((prev) => [...prev, ...mappedFiles]);
        setErrors((prev) => ({ ...prev, gallery: "" }));
        // setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
    };

    const handleRemoveGalleryImage = (index) => {
        setGalleryFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveImage         = () => setFile(null);
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

    const handleToggle = () => {
        setIsActive((prevState) => !prevState);
    };

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
    const handleCharger = (selectedOptions) => {
        setChargerType(selectedOptions)
    }

    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader /> :
                <>
                    <div className={styles.addHeading}>Edit Accessories</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit}>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label className={styles.labelText} htmlFor="chargerName">Product Name</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="chargerName" placeholder="Product Name" className={styles.inputField} value={chargerName} onChange={(e) => setChargerName(e.target.value)} />
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
                                    <label htmlFor="warrantyType" className={styles.labelText}>warranty Type</label>
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
                                    <label htmlFor="chargerType" className={styles.labelText}>Charger Type</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <CustomDropdown options={chargerTypeOption} value={chargerType} onChange={handleCharger} labelledBy="Select Charger Type" closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.chargerType && chargerType.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.chargerType}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="connectorType" className={styles.labelText}>Connector Type</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="connectorType" placeholder="Connector Type" className={styles.inputField} value={connectorType} onChange={(e) => setConnectorType(e.target.value)} />
                                            {errors.connectorType && connectorType === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.connectorType}</p>}
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
                            
                            <div className={styles.toggleContainer}>
                                <label className={styles.statusLabel}>Status</label>
                                <div className={styles.toggleSwitch} onClick={handleToggle}>
                                    <div className={`${styles.toggleButton} ${isActive ? styles.activeToggle : styles.inactiveToggle }`}>
                                        <div className={styles.slider}></div>
                                    </div>
                                    <span className={`${styles.toggleText} ${isActive ? styles.activeText : styles.inactiveText }`}>
                                        {isActive ? 'Active' : ' In-active'}
                                    </span>
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
                                                <input type="file" id="coverFileUpload" accept=".jpeg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                {file && imageBaseUrl && (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={file.url ? file.url : URL.createObjectURL(file)} />
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
                                    <label htmlFor="Station Image" className={styles.labelText}>Station Gallery</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>
                                                    { galleryFiles.length > 0 ? (
                                                        galleryFiles.length > 2 ? `${galleryFiles[0].name}, ${galleryFiles[1].name}... (${galleryFiles.length - 2} more)`
                                                            : galleryFiles.map(file => file.name).join(', ') ) : 'Upload Gallery Image'
                                                    }
                                                    {/* {galleryFiles.length > 0 ? galleryFiles.map((file) => file.name).join(', ') : 'Upload Gallery Image' } */}
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
                                                { galleryFiles.map((file, index) => (
                                                    <div className={styles.imageContainer} key={index}>
                                                        <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={file.url} />
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
                </>
            }
        </div>
    );
};

export default EditProduct;
