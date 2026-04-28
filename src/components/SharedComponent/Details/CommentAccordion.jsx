import React, { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './comment.module.css';
import moment from 'moment';

const CommentAccordion = ({history, rsa, imageUrl, fieldMapping, title }) => {
    const sections = history?.map((item) => {
        const [name, phone, countryCode] = item?.rider_data?.split(',') || [];
        return {
            title: `${name}, ${countryCode} ${phone} `,
            name, 
            phone: `${countryCode} ${phone}`, 
            details: item.comment,
            time: item.created_at ? moment(item.created_at).format('MMMM Do YYYY, h:mm:ss a') : null,
            imageUrl: imageUrl + '' + item?.image,
            
        };
    });
    const [activeKey, setActiveKey] = useState("1");
    const handleAccordionToggle = (key) => {
        setActiveKey(activeKey === key ? null : key);
    };

    return (
        <div className={styles.accordionContainer}>
            <div className={styles.header}>
                <div className={styles.status}>{title || "Comments"}</div>
            </div>
            <Accordion activeKey={activeKey} className={styles.accordion}>
                        
                {sections?.map((section, index) => (
                    <Accordion.Item eventKey={index.toString()} key={index} className={styles.accordionItem}>
                        <Accordion.Header onClick={() => handleAccordionToggle(index.toString())} className={styles.accordionHeader}>
                        
                                    {/* <span><img src={section?.imageUrl} alt="Image" style={{ maxWidth: '100%', height: 'auto' }} /></span> */}
                                
                            <span>{section.title}</span>
                            <span className={styles.icon} style={{ marginLeft: '8px', color: 'white' }}>
                                {activeKey === index.toString() ? '▲' : '▼'}
                            </span>
                        </Accordion.Header>
                        <Accordion.Body className={styles.accordionBody}>
                          
                                <p><strong>Comment:</strong> {section?.details}</p>
                                {section.time && <p className={styles.accodionPTag}> {section.time}</p>}
                            
                            {/* {section.showImage && (
                                <div>
                                    <p><strong>Image:</strong></p>
                                    <img src={section?.imageUrl} alt="Image" style={{ maxWidth: '100%', height: 'auto' }} />
                                </div>
                            )} */}
                            
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </div>
    );
};

export default CommentAccordion;
