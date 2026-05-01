import { useEffect, useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import styles from './accordion.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from "../Calendar/Calendar";
import { format } from 'date-fns';
import CustomDropdown from "../UI/CustomDropdown/CustomDropdown";

import SelectSearch from 'react-select-search';
import 'react-select-search/style.css';

const AccordionFilter = ({ type, isOpen, fetchFilteredData, dynamicFilters, filterValues, scheduleDateChange, scheduleFilters, areaOptions, areaSelected, handleArea, rowOptions, rowSelected, handleRowperPagePage, onFilterChange, isLoading }) => {
 
    const [showContent, setShowContent] = useState(isOpen);
    const [openDropdowns, setOpenDropdowns] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchFilteredData({ }); 
            setShowContent(true);
        } else {
            const timer = setTimeout(() => setShowContent(false), 300); 
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        fetchFilteredData({ ...filterValues, [name]: value });
    };

    const handleBlur = (name) => {
        fetchFilteredData(filterValues);
        setOpenDropdowns((prev) => ({ ...prev, [name]: false }));
    };

    const handleDateChange = (range) => {
        fetchFilteredData({
            ...filterValues,
            start_date: null,
            end_date: null,
        });
        if (!range || range.length < 2) {
            fetchFilteredData({
                ...filterValues,
                start_date: null,
                end_date: null
            });
            return;
        }

        const [start, end]   = range;
        const formattedStart = format(start, 'yyyy-MM-dd');
        const formattedEnd   = format(end, 'yyyy-MM-dd');
        fetchFilteredData({
            ...filterValues,
            start_date: formattedStart,
            end_date: formattedEnd
        });
    };
    const handleScheduleDateChange = (range) => {
        scheduleDateChange({
            ...scheduleFilters,
            start_date : null,
            end_date   : null,
        });
        if (!range || range.length < 2) {
            scheduleDateChange({
                ...scheduleFilters,
                start_date : null,
                end_date   : null
            });
            return;
        }
        const [start, end]   = range;
        const formattedStart = format(start, 'yyyy-MM-dd');
        const formattedEnd   = format(end, 'yyyy-MM-dd');
        scheduleDateChange({
            ...scheduleFilters,
            start_date: formattedStart,
            end_date: formattedEnd
        });
    };
    const toggleDropdown = (name) => {
        setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
    };
    const handleAreaa = (val) => {
        handleArea(val);
    };
    const pageLimit = (e) => {
        const { name, value } = e.target;
        handleRowperPagePage(value);
    };
    return (
        <div data-aos="fade-left">
            <Accordion defaultActiveKey="0" className={`${styles.accordionContainer} ${isOpen ? styles.open : ''}`}>
                <Card className={styles.accordionCard}>
                    <Accordion.Collapse eventKey="0">
                        <AnimatePresence>
                            {showContent && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ height: { duration: 0.3 }, opacity: { duration: 0.3 } }}
                                >
                                    <Card.Body>
                                        <form className={styles.filterForm}>
                                            { (type === 'Driver Details' || type === "Failed Charger Booking List" || type === "Home Charger Area List" || type === "Home Charger Device List" || type === "Home Charger Booking List" || type ==="Invoice List") && (
                                                <div className={`col-xl-3 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    {/* <label className={styles.filterLabel} htmlFor="date_filter">Schedule Date</label> */}
                                                    <Calendar handleDateChange={handleScheduleDateChange} placeholder={type.includes('Booking') || type === 'Driver Details' ? 'Schedule Date' : 'Select  Date'} />
                                                </div>  
                                            )}
                                            { (type === 'Drivers List' || type === "EV Road Assistance Booking List" || type === "EV Road Assistance Invoice List" || type === "Failed RSA Booking List" || type === "Total Public Chargers List" || type === "EV Charger List" || type === "EV Chargers" || type === "EV Product List" ||  type === "EV Accessories" || type === "Charger Installation List" || type === "Charger Installation Booking" || type === "Driver Location" || type === "Driver Details" || type === "Coupon List" || type === "Offer Details" || type === "EV Charger Bookings" || type === "EV Accessories Bookings" || type === "Failed Charger Booking List" || type === "Home Charger Slot List" || type === "Home Charger Invoice List" || type === "Home Charger Booking List" || type === "EV Products & Installation" ) && (
                                                <div className={`col-xl-3 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    <Calendar handleDateChange={handleDateChange} placeholder={type.includes('Booking') || type === 'Driver Details' ? 'Booking Date' : 'Select  Date'} />
                                                </div> 
                                            )}
                                            
                                            {dynamicFilters?.map((filter) => (
                                                <div key={filter.name} className={`col-xl-3 col-lg-6 col-12 ${styles.filterItem}`}>
                                                    {filter.type === 'select' ? (
                                                        <div className={`${styles.customSelectWrapper} ${openDropdowns[filter.name] ? styles.open : ''}`} onClick={() => toggleDropdown(filter.name)}>
                                                            <CustomDropdown options={filter.options} placeholder={`${filter.label}`} isLoading={isLoading?.[filter.name] || false}
                                                                value={filter.options.find(option => option.value === filterValues?.[filter.name]) || null}
                                                                onChange={(selectedOption) => {
                                                                    
                                                                    console.log(filter.name)
                                                                let value = selectedOption.value;
                                                                    // const value = selectedOption ? selectedOption.value : "";
                                                                    handleInputChange({ target: { name: filter.name, value } });

                                                                    if (onFilterChange) {
                                                                        onFilterChange(filter.name, value);
                                                                    }
                                                                }}
                                                                onMenuOpen={() => {
                                                                    if (onFilterChange) {
                                                                        onFilterChange(`${filter.name}_open`);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <input className={styles.filterInput} type={filter.type} id={filter.name} name={filter.name} autoComplete='off' 
                                                            value={filterValues[filter.name] || ''} onChange={handleInputChange} onBlur={() => handleBlur(filter.name)}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            { (type === 'Home Charger Booking Lists' ) && (
                                                <div className={`col-xl-3 col-lg-6 col-12 ${styles.selectItem}`} >
                                                    {/* <label className={styles.filterLabel} htmlFor="date_filter">Search Area</label> */}
                                                    <div className={styles.selectSearch}>
                                                    <SelectSearch search isClearable options={areaOptions} value={areaSelected} placeholder="Search Area" name="areaSearch"
                                                        onChange={(val) => handleAreaa(val )} />
                                                    </div>
                                                </div>  
                                            )}
                                            { (type === 'Home Charger Booking List' || type === "Pick & Drop Booking List" || type === "EV Road Assistance Booking List") && (
                                                <div className={`col-xl-3 col-lg-6 col-12 ${styles.selectItem}`}  style={{ position: 'relative', }}>
                                                    <CustomDropdown placeholder="Select No. of Records" options={rowOptions.map(option => ({ value: option, label: option }))} 
                                                        value={rowOptions
                                                            .map(option => ({ value: option, label: option }))
                                                            .find(opt => opt.value === rowSelected) || null}
                                                        
                                                        onChange={(selectedOption) => {
                                                            const value = selectedOption ? selectedOption.value : "";
                                                            pageLimit({ target: { name: "no_of_records", value } }); 
                                                            handleBlur("no_of_records");
                                                        }}
                                                    />
                                                </div>  
                                            )}
                                        </form>
                                    </Card.Body>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    );
};

export default AccordionFilter;
 
// Old dynamicFilters dropdown code
// <label className={styles.filterLabel} htmlFor={filter.name}>{filter.label}</label>
// <select
//     className={`${styles.filterSelect} ${styles.customSelect}`}
//     id={filter.name}
//     name={filter.name}
//     value={filterValues[filter.name] || ''}
//     onChange={handleInputChange}
//     onBlur={() => handleBlur(filter.name)}
// >
//     {filter.options.map((option) => (
//         <option key={option.value} value={option.value}>{option.label}</option>
//     ))}
// </select>
// <span className={styles.customSelectIcon}>▼</span>

// Old No. of Record dropdown code 
//<label className={styles.filterLabel} htmlFor="date_filter">No. of Records</label>
//<select
//    className={`${styles.filterSelect} ${styles.customSelect}`}
//    id="no_of_records"
//    name="no_of_records"
//    value={rowSelected}
//    onChange={pageLimit}
//    onBlur={() => handleBlur('no_of_records')}
//>
//    {rowOptions.map((option) => (
//        <option key={option} value={option}>{option}</option>
//    ))}
//</select>

// Calender field label
// <label className={styles.filterLabel} htmlFor="date_filter">{type.includes('Booking') || type === '' ? 'Booking Date' : 'Select  Date'}</label>
