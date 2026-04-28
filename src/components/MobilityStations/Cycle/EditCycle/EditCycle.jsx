import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from "./EditCycle.module.css";
import { MdOutlineCloudUpload } from "react-icons/md";
import { BsQrCodeScan } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineClose } from 'react-icons/ai';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import Loader from "../../../SharedComponent/Loader/Loader";
 
const EditCycle = () => {
    const userDetails                         = JSON.parse(sessionStorage.getItem('userDetails'));
    const { cycleId }                         = useParams();
    const navigate                            = useNavigate();
    const [errors, setErrors]                 = useState({});
    const [loading, setLoading]               = useState(false);
    const [loadingStation, setLoadingStation] = useState(false);
    const [showLoader, setShowLoader]         = useState(false);
    
    const [cycleID, setCycleID]               = useState('');
    const [cycleName, setCycleName]           = useState('');
    const [cycleBrand, setCycleBrand]         = useState('');
    const [station, setStation]               = useState([]);
    const [stationOption, setStationOption]   = useState([]);
    const [cycleType, setCycleType]           = useState([]);
    const [cycleUsedFor, setCycleUsedFor]     = useState([]);
    const [basePrice, setBasePrice]           = useState();
    const [file, setFile]                     = useState(null);
    const [galleryFiles, setGalleryFiles]     = useState([]);
    const [priceId,setpriceId]                = useState();
    // const [qrCode, setqrCode]                 = useState();
    const [qrImage, setqrImage]               = useState();
    const [imageBaseUrl, setImageBaseUrl]     = useState("");

    const userObj = {
        userId: userDetails?.user_id,
        email : userDetails?.email,
        cycle_id: cycleID,
    };

    const cycleTypes = [
        { value: 'ecycle', label: 'E-Cycle' },
        { value: 'cycle',  label: 'Cycle' },
    ]

    const usedFor = [
        { value: 'rent',  label: 'Rent' },
        { value: 'lease', label: 'Lease' },
    ]

    const handleCancel = () => {
        navigate('/mobility/mobility-station/cycle-list')
    }

    function handleStationList(value) {
        setStation(value);
    }

    function handleCycleType(value) {
        setCycleType(value);
    }

    function handleCycleUsedFor(value) {
        setCycleUsedFor(value);
    }

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        // if (selectedFile && selectedFile.type.startsWith('image/')) {
        if (selectedFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
            // setFile(selectedFile);
            setFile({
                file: selectedFile,
                name: selectedFile.name,
                url: URL.createObjectURL(selectedFile),
                type: selectedFile.type,
            });
            setErrors((prev) => ({ ...prev, file: "" }));
        } else {
            toast.error("Invalid file. Only .jpg, .jpeg, .png allowed.");
        }
    };

    const handleRemoveImage = () => setFile(null);
   
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
        // setGalleryFiles((prevFiles) => [...prevFiles, ...validFiles]);
    };
 
    const handleRemoveGalleryImage = (file) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (!confirmDelete) return;

        if (!file?.id) {
            setGalleryFiles((prevFiles) => prevFiles.filter((f) => f !== file));
            return;
        }

        if (confirmDelete) {
            const obj = {
                userId      : userDetails?.user_id,
                email       : userDetails?.email,
                image_id    : file.id,
                requirement : "cycle",
            };
            postRequestWithToken("delete-image", obj, (response) => {
                if (response.code === 200) {
                    toast.success(response?.message);
                    setGalleryFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
                } else {
                    toast.error(response?.message);
                }
            });
        }
    }
          
    // const handleQrCodeButton = async(e) => {
    //     if (!validateForm()) {
    //         toast.error("Please fill all required fields before generating QR Code.");
    //         return;
    //     }
    //     postRequestWithToken('generate-qr-code', userObj, async (response) => {
    //         if (response.status === 1) {
    //             setqrImage(response.data.qr_image)
    //             setqrCode(response.data.qrcode);
    //             toast.success("Generate Qr Code Successfully" || response.message[0] || response.message);
    //         } else {
    //             toast.error(response.message[0] || response.message || "Something went wrong");
    //             console.log('Error in generate-qr-code API:', response);
    //             setLoading(false);
    //         }
    //     })
    // };

    const fetchDetails = () => {
        setShowLoader(true);
        const obj = {
            userId       : userDetails?.user_id,
            email        : userDetails?.email,
            cycleId      : cycleId,
            service_type : 'cycle_details',
            page_no      : 1
        };

        postRequestWithToken('cycle-details', obj, (response) => {
            if (response.code === 200) {
                const cycleData = response?.data?.cycle;
                const baseUrl = response.data.base_url || "";
                setImageBaseUrl(response?.data?.base_url || "");

                setCycleID(cycleData?.cycle_id);
                setCycleName(cycleData?.cycle_name);
                setCycleBrand(cycleData?.brand);
                setStation({ label: cycleData?.station_name, value: cycleData?.station_id });
                setBasePrice(cycleData?.base_price);
                setqrImage(cycleData?.qr_image);
                setpriceId(cycleData?.price_id)
                // setFile(cycleData?.cover_image || "");
                // setGalleryFiles(response?.data?.imgName || []);
                setFile({
                    name: cycleData?.cover_image || [],
                    url : `${baseUrl}${cycleData?.cover_image}`,
                    type: "image/*",
                    file: null,
                });
                const galleryArr = (response?.data?.imgName || []).map((img, index) => ({
                    name: img,
                    url : `${baseUrl}${img}`,
                    id  : response?.data?.imgId?.[index],
                    type: "image/jpeg",
                    file: null,
                }));
                setGalleryFiles(galleryArr);
            
                const selectedCycleType = cycleTypes.find(  (ct) => ct.label.toLowerCase().trim() === cycleData.cycle_type.toLowerCase().trim());
                if (selectedCycleType) {
                    setCycleType(selectedCycleType);
                }
                
                const selectedusedFor=  usedFor.find(uf=>uf.value===cycleData.used_for );

                if (selectedusedFor){
                    setCycleUsedFor(selectedusedFor);
                }              
            } else {
                console.log('error in cycle-details API', response);
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
        
    const validateForm = (checkQr = false) => {
        const fields = [
            { name: "cycleName",    value: cycleName,           errorMessage: "Cycle Name is required." },
            { name: "cycleBrand",   value: cycleBrand,          errorMessage: "Cycle Brand is required." },
            { name: "station",      value: station?.value,      errorMessage: "Station Name For is required.",           isArray: true },
            { name: "cycleType",    value: cycleType?.value,    errorMessage: "Cycle Type is required.",                 isArray: true },
            { name: "cycleUsedFor", value: cycleUsedFor?.value, errorMessage: "Cycle Used For is required.",             isArray: true },
            { name: "basePrice",    value: basePrice,           errorMessage: "Base Price is required." },
            { name: "file",         value: file,                errorMessage: "Cover Image is required." },
            // { name: "galleryFiles", value: galleryFiles,        errorMessage: "At least one gallery image is required.", isArray: true },
        ];

        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
                errors[name] = errorMessage;
            }
            return errors;
        }, {});

        if (!cycleID) {
            newErrors.cycleID = "Cycle ID is required.";
        } else if (!/^CY[A-Z0-9]+$/.test(cycleID)) {
            newErrors.cycleID = "Cycle ID must start with 'CY'";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
    
        if (validateForm(true)) {
            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            formData.append("country_id", userDetails?.country_id);
            formData.append("city_id", station.city_id);
            formData.append("cycle_id", cycleId);

            formData.append("cycle_name", cycleName);
            formData.append("cycle_brand", cycleBrand);
            formData.append("station_id", station.value);
            formData.append("cycle_type", cycleType.value);
            formData.append("used_for", cycleUsedFor.value);
            formData.append("base_price", basePrice);
            // formData.append("qr_code", qrCode);
            formData.append("price_id", priceId);

            // formData.append("qr_image", qrImage);
        
            if (file?.file instanceof File) {
                formData.append("cover_image", file.file);
            }
             console.log("galleryFiles",galleryFiles)

            galleryFiles.forEach(img => {
                if (img.file instanceof File) {
                    formData.append("shop_gallery", img.file);
                }
            });
            postRequestWithTokenAndFile('edit-cycle', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message || response.message[0], {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/mobility/mobility-station/cycle-list');
                    }, 1000);
                } else {
                    toast(response.message || response.message[0], {type:'error'})
                    console.log('Error in edit-cycle API:', response);
                    setLoading(false);
                }
            } )
        } else {
            toast.error("Some fields are missing");
            setLoading(false);
        }
    };
         
    const getStations = () => {
        setLoadingStation(true);
        postRequestWithToken('station-list-for-select-box', userObj, (response) => {
            if (response.code === 200) {
                const stationsList = (response?.data || []).map(item => ({
                    label: item.station_name,
                    value: item.station_id,
                     city_id: item.city_id
                }));
                   setStationOption(stationsList);
                   setLoadingStation(false);
            } else {
                console.log('error in station-list-for-select-box API', response);
                setLoadingStation(false);
            }
        });
    };

    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader /> : 
                <>
                    <div className={styles.addHeading}>Edit Cycle</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit}>
                            
                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle ID" className={styles.labelText}>Cycle ID</label>
                                            <input type="text" disabled autoComplete="off" id="cycleID" placeholder="Cycle ID (e.g. CYXXX)" className={styles.inputField} value={cycleID} 
                                                onChange={(e) => {
                                                    const value = e.target.value.toUpperCase();
                                                    setCycleID(value);
                                                }} />
                                            {errors.cycleID && <p className={styles.error} style={{ color: 'red' }}>{errors.cycleID}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle Name" className={styles.labelText}>Cycle Name</label>
                                            <input type="text" autoComplete="off" id="cycleName" placeholder="Cycle Name" className={styles.inputField} value={cycleName} onChange={(e) => setCycleName(e.target.value)} />
                                            {errors.cycleName && cycleName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.cycleName}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle Brand" className={styles.labelText}>Cycle Brand</label>
                                            <input type="text" autoComplete="off" id="cycleBrand" placeholder="Cycle Brand" className={styles.inputField} value={cycleBrand} onChange={(e) => setCycleBrand(e.target.value)} />
                                            {errors.cycleBrand &&  cycleBrand === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.cycleBrand}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Station Name" className={styles.labelText}>Station Name</label>
                                            <CustomDropdown options={stationOption} value={station} onChange={handleStationList} placeholder="Select station" onMenuOpen={getStations} isLoading={loadingStation}/>
                                            {errors.station &&  station.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.station}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle Type" className={styles.labelText}>Type of cycle</label>
                                            <CustomDropdown options={cycleTypes} value={cycleType} onChange={handleCycleType} placeholder="Type of Cycle"/>
                                            {errors.cycleType &&  cycleType.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.cycleType}</p>}
                                        </div>
                                        <div className={`col-xl-5 col-lg-6`}>
                                            <label htmlFor="Cycle Used for" className={styles.labelText}>Cycle Used for</label>
                                            <CustomDropdown options={usedFor} value={cycleUsedFor} onChange={handleCycleUsedFor} placeholder="Cycle Used for"/>
                                            {errors.cycleUsedFor &&  cycleUsedFor.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.cycleUsedFor}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <label htmlFor="Base Price" className={styles.labelText}>Base Price</label>
                                            <input type="text" autoComplete="off" id="basePrice" placeholder="Base Price" className={styles.inputField} value={basePrice}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                                    setBasePrice(value);
                                                }}
                                            />
                                            {errors.basePrice &&  (basePrice === undefined || basePrice === '') && <p className={styles.error} style={{ color: 'red' }}>{errors.basePrice}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <label htmlFor="Cover Image" className={styles.labelText}>Cover Image</label>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>{file ? `${file?.name}` : 'Upload Cover Image'}</span>
                                                <label htmlFor="coverImage" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" id="coverImage" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                { file && imageBaseUrl &&  (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={file.url} />
                                                        <button type="button" className={styles.removeButton} onClick={handleRemoveImage}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <label htmlFor="Gallery Image" className={styles.labelText}>Gallery Image</label>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>
                                                        { galleryFiles.length > 0 ? (
                                                            galleryFiles.length > 2 ? `${galleryFiles[0].name}, ${galleryFiles[1].name}... (${galleryFiles.length - 2} more)`
                                                                : galleryFiles.map(file => file.name).join(', ') ) : 'Upload Gallery Image'
                                                        }
                                                        {/* {galleryFiles.length > 0 ? galleryFiles.map((file) => file.name).join(', ') : 'Upload Gallery Image' } */}
                                                </span>
                                                <label htmlFor="galaryImage" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" multiple id="galaryImage" accept=".jpg,.jpeg,.png" onChange={handleGalleryChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.galleryFiles &&  galleryFiles.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.galleryFiles}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                { galleryFiles.map((file, index) => (
                                                    <div className={styles.imageContainer} key={index}>
                                                        <img alt={`Preview ${index + 1}`} className={styles.previewImage} src={file.url} />
                                                        <button type="button" className={styles.removeButton} onClick={() => handleRemoveGalleryImage(file)}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <div className={`row d-flex align-items-center`}>
                                        <div className={`col-lg-5`}>
                                            <img className={styles.qrIcon} src={qrImage}/>//
                                            {errors.qrCode && <p className={styles.error} style={{ color: 'red' }}>{errors.qrCode}</p>}
                                        </div>
                                        <div className={`col-lg-5`}>
                                            <div className={styles.coverImage}>
                                            { qrImage  && (<img src={qrImage} alt="qr" className={styles.qrImage} />) //
                                            }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

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
 
export default EditCycle;