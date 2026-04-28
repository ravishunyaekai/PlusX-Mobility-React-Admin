import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './subheader.module.css';
import Plus from '../../../assets/images/Plus.svg';
import Filter from '../../../assets/images/Filter.svg';
import Search from '../../../assets/images/Search.svg';
import Download from '../../../assets/images/Download.svg'
import SearchAccordion from '../Accordion/SearchAccodion';
import AccordionFilter from '../Accordion/Accordions';
import { Link } from 'react-router-dom';
import FormModal from '../CustomModal/FormModal';
import ModalAssign from '../BookingDetails/ModalAssign'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { postRequestWithToken } from '../../../api/Requests';

const SubHeader = ({ heading, fetchFilteredData, dynamicFilters, filterValues, addButtonProps, searchTerm, count, modalTitle, setRefresh,apiEndPoint, nameKey, setDownloadClicked, handleDownloadClick, scheduleDateChange, scheduleFilters, areaOptions, areaSelected, handleArea, rowOptions, rowSelected, handleRowperPagePage, onFilterChange,isLoading  }) => {

    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate    = useNavigate();
    // const departmentId = userDetails.departmentId || '';
    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
    }, []);

    const [isSearchAccordionOpen, setIsSearchAccordionOpen] = useState(false);
    const [isFilterAccordionOpen, setIsFilterAccordionOpen] = useState(false);
    const [showPopup, setShowPopup]                         = useState(false);
    const [name, setName]                                   = useState("");

    const handleAddClick = () => {
        setShowPopup(true); 
    };
    const handleClosePopup = () => {
        setShowPopup(false); 
        setName("");
    };
    const handleReasonChange = (e) => {
        setName(e.target.value); 
    };
    const handleConfirmAdd = () => {
        if (!name.trim()) {
            toast("Please enter name.", {type:'error'})
            return;
        }
        const obj = {
            userId     : userDetails?.user_id,
            email      : userDetails?.email,
            [nameKey]  : name
        };
        postRequestWithToken(apiEndPoint, obj, async (response) => {
            if (response.code === 200) {
                toast(response.message, {type:'success'})
                    setTimeout(() => {
                        setRefresh(prev => !prev);
                    }, 1500);
                setShowPopup(false);
            } else {
                toast(response.message, {type:'error'})
                console.log(`Error in ${apiEndPoint} API`, response);
            }
        });
    };
    const toggleSearchAccordion = () => {
        setIsSearchAccordionOpen(!isSearchAccordionOpen);
        setIsFilterAccordionOpen(false);
    };

    const toggleFilterAccordion = () => {
        setIsFilterAccordionOpen(!isFilterAccordionOpen);
        setIsSearchAccordionOpen(false);
    };
  
    const shouldShowFilterButtonArr = ["Total App Signup List","Total Deleted Account List", "Failed Ride Booking List", "Notification List","List of all users","Brands","EV Charger Booking List","EV Chargers List","EV Accessories List", "Offer List", "Home Charger List", "Incomplete Ride Booking List", "Support Request List"]
    const shouldShowFilterButton = !shouldShowFilterButtonArr.includes(heading)

    const shouldShowSearchButtonArr = ["Total Deleted Account List", "Notification List","List of all users","EV Road Assistance Invoice List","List of Universities","List of Students", "Offer List", "Home Charger Slot List"]
    const shouldShowSearchButton = !shouldShowSearchButtonArr.includes(heading)
    // "Ride Booking List", "Failed Ride Booking List", 

    const shouldShowAddButtonArr = ["Total App Signup List","Total Deleted Account List","Ride Booking List", "Failed Ride Booking List", "Notification List", "EV Road Assistance Booking List","EV Road Assistance Invoice List","Failed RSA Booking List","Charger Installation Booking","EV Charger Booking List", "EV Charger Bookings", "EV Accessories Bookings", "Home Charger Booking List", "Home Charger Invoice List", "Failed Charger Booking List","Ev Insurance List","Customer POD Booking List","Chargers Share Listings", "Incomplete Ride Booking List", "Invoice List", "Support Request List"];
        
    // const shouldShowDownloadButtonArr = ["Portable Charger Booking List",];
    // const shouldShowDownloadButton = shouldShowDownloadButtonArr.includes(heading)

    const shouldShowAddButton = !shouldShowAddButtonArr.includes(heading);

    const cardArray = ["Total App Signup List","Total Deleted Account List","Ride Booking List","Failed Ride Booking List","List of Stations","List of Cycles","Failed RSA Booking List", "Total Public Chargers List","EV Chargers","EV Accessories","EV Charger Booking List","EV Chargers List","EV Accessories List","List of Universities","List of Students","EV Road Assistance Booking List", "Offer List", "Coupon List","Charger Installation Booking", "EV Charger Bookings", "EV Accessories Bookings", "Home Charger List", "Home Charger Booking List","Home Charger Invoice List","Failed Charger Booking List","POD Brand List","Ev Insurance List","Customer POD Booking List", "Incomplete Ride Booking List", "Invoice List", "Support Request List"]
    const showCard = cardArray.includes(heading);

    const headingArray = ["Notification List","List of all users","EV Road Assistance Invoice List","Drivers List","Brands", "Home Charger Area List", "Home Charger Device List", "Home Charger Slot List", "Roadside Assistance Slot List", "EV Products & Installation","Chargers Share Listings"]
    const showHeading = headingArray.includes(heading);

    return (
        <div className={styles.subHeaderContainer}>
            <div className={styles.headerCharger}>
                { showHeading && (
                    <div className={styles.headingList}>{heading} </div>
                )}
                {showCard && (
                    <div className={styles.headCardSection}>
                        <div className={styles.headCardNumber}>{count || 0}</div>
                        <div className={styles.headCardText}>{heading}</div>
                    </div>
                )}
                <div className={styles.subHeaderButtonSection}>
                    {shouldShowAddButton &&  (
                        (heading === "Brands") ? (
                            <div className={styles.addButtonSection} onClick={handleAddClick}>
                                <div className={styles.addButtonImg}>
                                    <img src={Plus} alt='plus' />
                                </div>
                                <div className={styles.addButtonText}>{addButtonProps?.heading}</div>
                            </div>
                        ) : (
                            <Link to={addButtonProps?.link}>
                                <div className={styles.addButtonSection}>
                                    <div className={styles.addButtonImg}>
                                        <img src={Plus} alt='plus' />
                                    </div>
                                    <div className={styles.addButtonText}>{addButtonProps?.heading}</div>
                                </div>
                            </Link>
                        )
                    )}

                    {/* Search Button */}
                    {shouldShowSearchButton && (
                        <div className={styles.addButtonSection} onClick={toggleSearchAccordion}>
                            <div className={styles.addButtonImg}>
                                <img src={Search} alt='Search' />
                            </div>
                            <div className={styles.addButtonText}>Search</div>
                        </div>
                    )}

                    {/* Filter Button */}
                    {shouldShowFilterButton && (
                        <div className={styles.addButtonSection} onClick={toggleFilterAccordion}>
                            <div className={styles.addButtonImg}>
                                <img src={Filter} alt='Filter' />
                            </div>
                            <div className={styles.addButtonText}>Filter</div>
                        </div>
                    )}
                    
                    {/* Download Button */}
                    {/* {shouldShowDownloadButton && (
                        <div className={styles.addButtonSection} onClick={handleDownloadClick}>
                            <div className={styles.addButtonImg}>
                                <img src={Download} alt='Download' />
                            </div>
                            <div className={styles.addButtonText} >Download</div>
                        </div>
                    )} */}
                </div>
            </div>

            {/* Render SearchAccordion when isSearchAccordionOpen is true */}
            {isSearchAccordionOpen && (
                <SearchAccordion
                    type                ={heading}
                    isOpen              ={isSearchAccordionOpen}
                    fetchFilteredData   ={fetchFilteredData}
                    searchTerm          ={searchTerm}
                    filterValues        ={filterValues}
                />
            )}

            {isFilterAccordionOpen && (
                <AccordionFilter
                    type                 = {heading}
                    isOpen               = {isFilterAccordionOpen}
                    fetchFilteredData    = {fetchFilteredData}
                    dynamicFilters       = {dynamicFilters}
                    filterValues         = {filterValues}
                    scheduleDateChange   = {scheduleDateChange}
                    scheduleFilters      = {scheduleFilters}
                    areaOptions          = {areaOptions}
                    areaSelected         = {areaSelected}
                    handleArea           = {handleArea}
                    rowOptions           = {rowOptions}
                    rowSelected          = {rowSelected}
                    handleRowperPagePage = {handleRowperPagePage}
                    onFilterChange       = {onFilterChange}
                    isLoading            = {isLoading}
                />
            )}

            {showPopup && (
                <ModalAssign isOpen={showPopup} onClose={handleClosePopup} onAssign={handleConfirmAdd} buttonName = 'Submit'>
                    <div className="modalHeading">{modalTitle}</div>
                    <input id="name" placeholder={modalTitle} className="modal-textarea" value={name} onChange={handleReasonChange} />
                </ModalAssign>
            )}
        </div>
    );
};

export default SubHeader;
