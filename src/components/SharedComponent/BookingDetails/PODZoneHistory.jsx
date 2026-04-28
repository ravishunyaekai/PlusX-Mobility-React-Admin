import React, { useEffect, useState } from 'react';
import styles from './history.module.css';
import Pagination from '../Pagination/Pagination';
import AddZone from '../../../assets/images/AddDriver.svg';
import Modal from './ModalAssign';
import Add from '../../../assets/images/Plus.svg';
import Select from 'react-select';
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { getRequestWithToken } from '../../../api/Requests';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import CustomDropdown from '../UI/CustomDropdown/CustomDropdown';
const PODZoneHistory = ({podId }) => {
   
    const userDetails                                 = JSON.parse(sessionStorage.getItem('userDetails'));
    const [defaultCoordinates, setDefaultCoordinates] = useState({ lat: 25.276987, lng: 55.296249 });
    const navigate                                    = useNavigate()
    const [areaData, setAreadata]         = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [selectedArea, setSelectedArea] = useState('');
    const [areaOptions, setAreaOptions]   = useState([]);
    const [errors, setErrors]             = useState({});
    const [areaName, setAreaName]         = useState('')
   
    const[podSssignAreaList, setPodSssignAreaList] = useState([]);
    const obj = {
        userId : userDetails?.user_id,
        email  : userDetails?.email,
    };
    const getAllArea = () => {
        let AreaObj = {
            ...obj,
            podId : podId, 
            page_no : currentPage
        }
        getRequestWithToken('pod-assign-area-list', AreaObj, (response) => {
            if (response.code === 200) {
                
                setPodSssignAreaList(response?.data || []);  
                
            } else {
                console.log('error in area-list API', response);
            }
        });
    }

    useEffect(() => {
        
        getRequestWithToken('all-pod-area', obj, (response) => {
            if (response.code === 200) {
                // console.log(response.code)
                setAreadata(response?.data || []);  
                let area_options = response?.data.map((zone) => ({
                    value : zone.area_id,
                    label : zone.area_name,
                }));
                setAreaOptions(area_options)
            } else {
                console.log('error in brand-list API', response);
            }
        });
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        getAllArea();
        // 
    }, []);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const handleAddZoneClick = () => {
        setSelectedArea('');
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedArea('');
        setAreaName('')
        setErrors({})
    };

    // Load Google Maps
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    });
    if (!isLoaded) return <div>Loading...</div>;

    const handleChange = (e) => {
    
        const index = areaOptions.findIndex((u) => u.value === e.value);
        setSelectedArea(e.value);
        setAreaName(e)
        
        
        setDefaultCoordinates({ lat: areaData[index].latitude, lng: areaData[index].longitude })
    };
    console.log(areaName);
    const handleSubmit = () => {
        
        if(podId == ''){
            
            toast("POD ID is required.", {type:'error'});

        } else if(selectedArea == ''){
           
            setErrors((prev) => ({ ...prev, selectedArea: "Please Select Area!" }));
        } else {

            const formData = new FormData();
            formData.append("userId", userDetails?.user_id);
            formData.append("email", userDetails?.email);
            
            formData.append("podId", podId);
            formData.append("selectedArea", selectedArea);

            getRequestWithToken('pod-assign-area', formData, async (response) => {
                if (response.code === 200) {
                    toast(response.message[0], { type: "success" });
                    setTimeout(() => {
                        handleCloseModal();
                        getAllArea();
                        setSelectedArea('')
                    }, 2000);
                } else {
                    toast(response.message, {type:'error'})
                    console.log('error in add-brand api', response);
                }
            });
        }
    };

    return (
        <div className={styles.addressListContainer}>
            <ToastContainer />
            <div className={styles.brandHistorySection}>
                <span className={styles.sectionTitle}>POD Zone List</span>
                <button className={styles.brandHistoryButton} onClick={handleAddZoneClick}>
                    <img className={styles.brandImg} src={Add} alt="Add Brand" />
                    <span>Add Zone</span>
                </button>
            </div>
            <table className={`table ${styles.customTable}`}>
                <thead>
                    <tr>
                        <th>Zone ID</th>
                        <th>Area Name</th>
                        <th>Assigned Date</th>
                    </tr>
                </thead>
                <tbody>
                    { podSssignAreaList.length == 0 ? (
                            <tr>
                                <td colSpan={12} className='border-0 p-0'>
                                    <div style={{backgroundColor: "#fff",color: "#000", padding: "10px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"}}>No data available</div>
                                </td>
                            </tr>
                        ) : (
                        <>  
                            {podSssignAreaList.map((area, index) => (
                                <tr key={index}>
                                    <td>{area.area_id}</td>
                                    <td>{area.area_name}</td>
                                    <td>{moment(area.created_at).format('DD MMM YYYY HH:mm:ss') }</td>
                                </tr>
                            ))}
                        </>
                    )}
                    
                </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} buttonName="Add" onAssign={() => {  handleSubmit(); }} >
                <div className="modalHeading">Add New Zone</div>
                <div className={styles.modalContainer}>
                    <CustomDropdown value={areaName} options={areaOptions} placeholder="Select Area" onChange={handleChange}/>
                    {errors.selectedArea && selectedArea == '' && <p className="error">{errors.selectedArea}</p>}
                    <GoogleMap mapContainerClassName={styles.mapResponsive} center={defaultCoordinates} zoom={15}  >
                        <Marker position={defaultCoordinates} />
                    </GoogleMap>
                </div>
            </Modal>
        </div>
    );
};

export default PODZoneHistory;
