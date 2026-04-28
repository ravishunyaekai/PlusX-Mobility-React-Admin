import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AddPurchase.module.css';

import { AiOutlineClose } from 'react-icons/ai';
import { MdOutlineCloudUpload } from "react-icons/md";
import InputMask from 'react-input-mask';
import moment from 'moment';
import { postRequestWithTokenAndFile, postRequestWithToken } from '../../../../api/Requests';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import MultiCustomDropdown from "../../../SharedComponent/UI/CustomMultiDropdown/MultiSelectDropdown";

import Add from '../../../../assets/images/Add.svg';
import PdfIcon from "../../../../assets/images/PdfIcon.svg";
import UploadIcon from '../../../../assets/images/uploadicon.svg';
import Loader from "../../../SharedComponent/Loader/Loader";

const EditPurchase = () => {
    const { purchaseId }                            = useParams()
    const userDetails                               = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate                                  = useNavigate();
    const [file, setFile]                           = useState(null);
    const [errors, setErrors]                       = useState({});
    const [loading, setLoading]                     = useState(false);
    const [showLoader, setShowLoader]               = useState(false);
     
    const [customerName, setCustomerName]           = useState('');
    const [customerEmail, setCustomerEmail]         = useState('');
    const [customerMobile, setCustomerMobile]       = useState('');
    const [customerAddress, setCustomerAddress]     = useState('');

    const [productName, setProductName]             = useState('');
    const [outputPower, setoutputPower]             = useState([]);
    const [price, setPrice]                         = useState('');
    const [typeOfService, setTypeOfService]         = useState([]);
    const [purchaseDate, setPurchaseDate]           = useState('');
    const [warrantyExpires, setWarrantyExpires]     = useState('');
    const [installationDate, setInstallationDate]   = useState('');
    
    const [purchaseInvoice, setPurchaseInvoice]             = useState('');
    const [installationInvoice, setInstallationInvoice]     = useState('');
    const [completionCertificate, setCompletionCertificate] = useState('');

    const [purchaseInfo, setPurchaseInfo]         = useState(false);
    const [installationInfo, setInstallationInfo] = useState(false);

    const powerOption = [
        { value : '7KW',   label: '7KW'  },
        { value : '12KW',  label: '12KW' },
        { value : '20KW',  label: '20KW' },
        { value : '22KW',  label: '22KW' },
    ];
    const serviceOption = [
        { value : 'Charger & Installation', label: 'Charger & Installation'  },
        { value : 'Charger Only',           label: 'Charger Only' },
        { value : 'Installation Only',      label: 'Installation Only' },
    ];
    
    const fetchDetails = () => {
        setShowLoader(true);
        const obj = {
            userId      : userDetails?.user_id,
            email       : userDetails?.email,
            purchase_id : purchaseId,
        };
        postRequestWithToken('purchase-history-details', obj, (response) => {
            
            if (response.code === 200) {
                const data = response?.data || {};
                
                setCustomerName(data?.customer_name);
                setCustomerEmail(data?.customer_email);
                setCustomerMobile(data?.customer_mobile);
                setCustomerAddress(data?.customer_address);

                setProductName(data?.product_name);
                setoutputPower(data?.output_Power);
                setPrice(data?.price);
                setTypeOfService(data?.type_of_service);
                setPurchaseDate(moment(data?.purchase_date, "YYYY-MM-DD").format("DD-MM-YYYY")); 
                setWarrantyExpires(moment(data?.warranty_expiry_date, "YYYY-MM-DD").format("DD-MM-YYYY")); 
                setInstallationDate(moment(data?.installation_date, "YYYY-MM-DD").format("DD-MM-YYYY")); 

                setPurchaseInvoice({
                    name: data?.purchase_invoice_pdf,
                    url: `${response?.base_url}${data?.purchase_invoice_pdf}`,
                    type: "application/pdf"
                });
                setInstallationInvoice({
                    name: data?.installation_invoice_pdf,
                    url: `${response?.base_url}${data?.installation_invoice_pdf}`,
                    type: "application/pdf"
                });
                setCompletionCertificate({
                    name: data?.completion_certificate_pdf,
                    url: `${response?.base_url}${data?.completion_certificate_pdf}`,
                    type: "application/pdf"
                });                
                setDatesShowHide(data?.type_of_service);
        
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
        navigate('/electric/charger-installation/purchase-customer-list');
    }
    const validateForm = () => {
        const fields = [
            { name: "customerName",     value: customerName,     errorMessage: "Customer Name is required." },
            { name: "customerEmail",    value: customerEmail,    errorMessage: "Email is required.", },
            { name: "customerMobile",   value: customerMobile,   errorMessage: "Contact No. is required."},
            { name: "customerAddress",  value: customerAddress,  errorMessage: "Address is required."},
            
            { name: "productName",      value: productName,      errorMessage: "Product Name is required." },
            { name: "outputPower",      value: outputPower,      errorMessage: "Output Power is required.",     isArray: true },
            { name: "price",            value: price,            errorMessage: "Price is required." },
            { name: "typeOfService",    value: typeOfService,    errorMessage: "Type Of Service is required.",  isArray: true  },
            { name: "purchaseDate",     value: purchaseDate,     errorMessage: "Date of Purchase is required.", },
            { name: "warrantyExpires",  value: warrantyExpires,  errorMessage: "Warranty Expiry is required.",},
            { name: "installationDate", value: installationDate, errorMessage: "Date of Installation is required.",},
        ];
        const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
            if ( (!isArray && !value) || ( isArray && (!value || value.length === 0) )) {
                errors[name] = errorMessage;
            }
            if( (name === "purchaseDate" && purchaseInfo === false ) || (name === "warrantyExpires" && purchaseInfo === false) || (name === "installationDate" && installationInfo === false)){
                delete errors[name];
            }
            return errors;
        }, {});
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
            formData.append("purchase_id", purchaseId);

            formData.append("customer_name", customerName);
            formData.append("customer_email", customerEmail);
            formData.append("customer_mobile", customerMobile);
            formData.append("customer_address", customerAddress);

            formData.append("product_name", productName);
            formData.append("output_Power", JSON.stringify(outputPower) );
            formData.append("price", price);
            formData.append("type_of_service", JSON.stringify(typeOfService) );
            formData.append("purchase_date", purchaseDate);
            formData.append("warranty_expiry_date", warrantyExpires);
            formData.append("installation_date", installationDate);
            
            if (purchaseInvoice) {
                formData.append("purchase_invoice_pdf", purchaseInvoice);
            }
            if (installationInvoice) {
                formData.append("installation_invoice_pdf", installationInvoice);
            }
            if (completionCertificate) {
                formData.append("completion_certificate_pdf", completionCertificate);
            }
            postRequestWithTokenAndFile('purchase-history-edit', formData, async (response) => {
                if (response.status === 1) {
                    toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/electric/charger-installation/purchase-customer-list');
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
    const handlePUChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setPurchaseInvoice(selectedFile);
            setErrors((prev) => ({ ...prev, purchaseInvoice: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleInstallationChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setInstallationInvoice(selectedFile);
            setErrors((prev) => ({ ...prev, installationInvoice: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleCompletionChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('application/')) { 
            setCompletionCertificate(selectedFile);
            setErrors((prev) => ({ ...prev, completionCertificate: "" }));
        } else {
            toast('Please upload a valid pdf file.', {type:'error'})
        }
    };
    const handleRemovePurchaseInvoice       = () => setPurchaseInvoice(null);
    const handleRemoveInstallationInvoice   = () => setInstallationInvoice(null);
    const handleRemoveCompletionCertificate = () => setCompletionCertificate(null);
    
    const handleOutputPower = (selectedOptions) =>{
        setoutputPower(selectedOptions)
    }
    const handleServiceType = (selectedOptions) => {
        
        setDatesShowHide(selectedOptions);
        setTypeOfService(selectedOptions);
    } 
    const setDatesShowHide = (ServiceType) => {
        let labels = ServiceType.map(item => item.label);
        labels     = labels.join(",");   //

        setPurchaseInfo(labels.includes("Charger"));    
        setInstallationInfo(labels.includes("Installation"));
    }

    return (
        <div className={styles.addStationContainer}>
            { showLoader ? <Loader /> :
                <>
                    <div className={styles.addHeading}>Edit Details</div>
                    <div className={styles.addStationFormSection}>
                        <ToastContainer />
                        <form className={styles.formSection} onSubmit={handleSubmit}>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label className={styles.labelText} htmlFor="customerName">Customer Name</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="customerName" placeholder="Customer Name" className={styles.inputField} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                            {errors.customerName && customerName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.customerName}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="customerMobile" className={styles.labelText}>Contact No.</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="customerMobile" placeholder="Contact No." className={styles.inputField} value={customerMobile}
                                                onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setCustomerMobile(value.slice(0, 12)); 
                                            }} />
                                            {errors.customerMobile && (customerMobile?.length || 0 < 10) && <p className={styles.error} style={{ color: 'red' }}>{errors.customerMobile}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="customerEmail" className={styles.labelText}>Email ID</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="email" autoComplete="off" id="customerEmail" placeholder="Email ID" className={styles.inputField} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                                            {errors.customerEmail && customerEmail === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.customerEmail}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="customerAddress" className={styles.labelText}>Address</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="customerAddress" placeholder="Address" className={styles.inputField} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                                            {errors.customerAddress && customerAddress === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.customerAddress}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="productName" className={styles.labelText}>Product Name</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <input type="text" autoComplete="off" id="productName" placeholder="Product Name" className={styles.inputField} value={productName} onChange={(e) => setProductName(e.target.value)} />
                                            {errors.productName && productName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.productName}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="outputPower" className={styles.labelText}>Output Power</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <MultiCustomDropdown options={powerOption} value={outputPower} onChange={handleOutputPower} labelledBy="Output Power" closeOnChangedValue={false} closeOnSelect={false}/>
                                            {errors.outputPower && outputPower.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.outputPower}</p>}
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
                                    <label htmlFor="service" className={styles.labelText}>Type of Service</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <MultiCustomDropdown options={serviceOption} value={typeOfService} onChange={handleServiceType} labelledBy="Type of Service" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll/>
                                            {errors.typeOfService && typeOfService.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.typeOfService}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            { purchaseInfo && (
                                <div className={`row`}>
                                    <div className={`col-lg-6`}>
                                        <label htmlFor="propertyTypeOption" className={styles.labelText}>Purchase Date</label>
                                        <div className={`row`}>
                                            <div className={`col-xl-10 col-lg-12`}>
                                                <InputMask mask="99-99-9999" value={purchaseDate} placeholder="DD-MM-YYYY" className={styles.inputField}
                                                    onChange={(e) => {
                                                        setPurchaseDate(e.target.value);
                                                        if (errors.purchaseDate && e.target.value.length === 10) {
                                                            setErrors((prevErrors) => ({ ...prevErrors, purchaseDate: "" }));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (purchaseDate.length === 10) {
                                                            const [day, month, year] = purchaseDate.split('-');
                                                            const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                            day <= 31 && month <= 12; 
                                                            if (!isValidDate) {
                                                                setErrors((prevErrors) => ({
                                                                    ...prevErrors,
                                                                    purchaseDate: "Invalid date in DD-MM-YYYY format",
                                                                }));
                                                            }
                                                        }
                                                    }}/>
                                                {errors.purchaseDate && purchaseDate == null && <p className={styles.error} style={{ color: 'red' }}>{errors.purchaseDate}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`col-lg-6`}>
                                        <label htmlFor="Warranty" className={styles.labelText}>Warranty Expires on</label>
                                        <div className={`row`}>
                                            <div className={`col-xl-10 col-lg-12`}>
                                                <InputMask mask="99-99-9999" value={warrantyExpires} placeholder="DD-MM-YYYY" className={styles.inputField}
                                                    onChange={(e) => {
                                                        setWarrantyExpires(e.target.value);
                                                        if (errors.warrantyExpires && e.target.value.length === 10) {
                                                            setErrors((prevErrors) => ({ ...prevErrors, warrantyExpires: "" }));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (warrantyExpires.length === 10) {
                                                            const [day, month, year] = warrantyExpires.split('-');
                                                            const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                            day <= 31 && month <= 12; 
                                                            if (!isValidDate) {
                                                                setErrors((prevErrors) => ({
                                                                    ...prevErrors,
                                                                    warrantyExpires: "Invalid date in DD-MM-YYYY format",
                                                                }));
                                                            }
                                                        }
                                                    }}
                                                />
                                                {errors.warrantyExpires && warrantyExpires == null && <p className={styles.error} style={{ color: 'red' }}>{errors.warrantyExpires}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            { installationInfo && (
                                <div className={`row`}>
                                    <div className={`col-lg-6`}>
                                        <label htmlFor="Date" className={styles.labelText}>Date of Installation</label>
                                        <div className={`row`}>
                                            <div className={`col-xl-10 col-lg-12`}>
                                                <InputMask mask="99-99-9999" value={installationDate} placeholder="DD-MM-YYYY" className={styles.inputField}
                                                    onChange={(e) => {
                                                        setInstallationDate(e.target.value);
                                                        if (errors.installationDate && e.target.value.length === 10) {
                                                            setErrors((prevErrors) => ({ ...prevErrors, installationDate: "" }));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (installationDate.length === 10) {
                                                            const [day, month, year] = installationDate.split('-');
                                                            const isValidDate = !isNaN(Date.parse(`${year}-${month}-${day}`)) &&
                                                            day <= 31 && month <= 12; 
                                                            if (!isValidDate) {
                                                                setErrors((prevErrors) => ({
                                                                    ...prevErrors,
                                                                    installationDate: "Invalid date in DD-MM-YYYY format",
                                                                }));
                                                            }
                                                        }
                                                    }}
                                                />
                                                {errors.installationDate && installationDate == null && <p className={styles.error} style={{ color: 'red' }}>{errors.installationDate}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="purchaseInvoice" className={styles.labelText}>Upload Purchase Invoice</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>{purchaseInvoice ? `${purchaseInvoice?.name}` : 'Upload File'}</span>
                                                <label htmlFor="purchaseInvoice" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" id="purchaseInvoice" accept=".pdf" onChange={handlePUChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                {purchaseInvoice && (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={PdfIcon} />
                                                        <button type="button" className={styles.removeButton} onClick={handleRemovePurchaseInvoice}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="installationInvoice" className={styles.labelText}>Upload Installation Invoice</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>{installationInvoice ? `${installationInvoice?.name}` : 'Upload File'}</span>
                                                <label htmlFor="installationInvoice" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" id="installationInvoice" accept=".pdf" onChange={handleInstallationChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                {installationInvoice && (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={PdfIcon} />
                                                        <button type="button" className={styles.removeButton} onClick={handleRemoveInstallationInvoice}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`row`}>
                                <div className={`col-lg-6`}>
                                    <label htmlFor="completionCertificate" className={styles.labelText}>Upload Completion Certificate</label>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.uploadContainer}>
                                                <span className={styles.uploadLabel}>{completionCertificate ? `${completionCertificate?.name}` : 'Upload File'}</span>
                                                <label htmlFor="completionCertificate" className={styles.uploadButton}><MdOutlineCloudUpload /> Upload </label>
                                                <input type="file" id="completionCertificate" accept=".pdf" onChange={handleCompletionChange} className={styles.hiddenInput} />
                                            </div>
                                            {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col-xl-10 col-lg-12`}>
                                            <div className={styles.galleryContainer}>
                                                {completionCertificate && (
                                                    <div className={styles.imageContainer}>
                                                        <img alt="Preview" className={styles.previewImage} src={PdfIcon} />
                                                        <button type="button" className={styles.removeButton} onClick={handleRemoveCompletionCertificate}><AiOutlineClose size={20} style={{ padding: "2px" }} /></button>
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
                </>
            }
        </div>
        );
};

export default EditPurchase;
