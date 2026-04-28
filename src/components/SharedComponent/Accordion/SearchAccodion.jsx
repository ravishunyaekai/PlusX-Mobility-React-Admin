import React, { useEffect, useState } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import styles from './accordion.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const SearchAccodion = ({ type, isOpen, fetchFilteredData, dynamicFilters, filterValues, searchTerm }) => {
    const [showContent, setShowContent] = useState(isOpen);
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFilteredData({}); //remove existing search or filter data when opening the other accordion
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

    const handleBlur = () => {
        fetchFilteredData(filterValues);
        setIsOpenDropdown(false); 
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
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card.Body>
                                        <form className={styles.filterForm}>
                                            {searchTerm?.map((filter) => (
                                                // <div key={filter.name} className={`col-xl-4 col-lg-6 col-12 ${styles.filterItem}`}>
                                                <div key={filter.name} className={`col-12 ${styles.filterItem}`}>
                                                    {/* <label className={styles.filterLabel} htmlFor={filter.name}>Search</label> */}
                                                    {filter.type === 'select' ? (
                                                        <input 
                                                        className={styles.filterInput} 
                                                        type={filter.type} 
                                                        id={filter.name} 
                                                        name={filter.name} 
                                                        value={filterValues[filter.name] || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        autoComplete='off'
                                                        placeholder='Search'
                                                    />
                                                    ) : (
                                                        <input 
                                                        className={styles.filterInput} 
                                                        type={filter.type} 
                                                        id={filter.name} 
                                                        name={filter.name} 
                                                        value={filterValues[filter.name] || ''}
                                                        onChange={handleInputChange}
                                                        onBlur={handleBlur}
                                                        autoComplete='off'
                                                        placeholder='Search'
                                                    />
                                                    )}
                                                </div>
                                            ))}
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

export default SearchAccodion;
