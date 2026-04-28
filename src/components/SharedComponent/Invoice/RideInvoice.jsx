import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import styles from './invoice.module.css';
import logo from '../../../assets/images/Logo.svg';
import html2pdf from 'html2pdf.js';
import Download from '../../../assets/images/Download.svg'

const Invoice = ({ title, details }) => {
    console.log(details)
    const handleDownload = () => {
        const invoiceElement = document.getElementById('invoiceToDownload');
        const options = {
            margin:       0.5,
            filename:     'Invoice.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas : { scale: 2 },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(options).from(invoiceElement).save();
    };
    const InvoiceNo = !!details.booking_id ? details.booking_id.replace('PMB', 'INV') : '';
    return (
        <div className={styles.invoiceMainContainer}>
            <div className={styles.invoiceSection} >
                {/* <div className={styles.invoiceDownloadSection}>
                    <div className={styles.invoiceHeading}>{title}</div>
                    <div className={styles.downloadButton} onClick={handleDownload}>
                        <img src={Download} alt="Download" />
                        <span>Download</span>
                    </div>
                </div> */}
                <div className={styles.container} id="invoiceToDownload">
                    <table className={styles.table} style={{ width: "100%" }}>
                        <tbody>
                            <tr>
                                <td colSpan="2">
                                    <table>
                                        <tr>
                                            <td className={styles.logoSection}>
                                                <img src={logo} alt="company logo" className={styles.logoImage} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className={styles.invoiceBar}>
                                                    <span className={styles.invoiceText}>INVOICE</span>
                                                    <span className={styles.bookingText} style={{fontSize: "20px"}}>
                                                        Invoice No:  {InvoiceNo}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            {/* <tr>
                                <td colSpan="4">
                                    <table style={{ width: '100%', marginTop: '10px' }}>
                                        <tr>
                                            <td className={styles.invoiceDetails} style={{textAlign: "left"}}>
                                                <p style ={{fontSize: "18px", marginLeft: "10px"}}>
                                                    Invoice Date: {moment(details?.updated_at).format('DD MMM YYYY')}
                                                </p>
                                            </td>
                                            <td className={styles.invoiceDetails} style={{textAlign: "right"}}>
                                                <p style ={{fontSize: "18px", marginRight: "10px"}}>
                                                    Invoice No.: {InvoiceNo}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr> */}
                            <tr>
                                <td colSpan="2">
                                    <table style={{ width: '100%', borderSpacing: 0, marginTop:"16px" }}>
                                        <thead>
                                            <tr className={styles.serviceHeader}>
                                                <th>Invoice Date</th>
                                                <th>Ride ID</th>
                                                <th>Total Time</th>
                                                <th className={styles.amountRightAlign}>Total Fare</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className={styles.serviceItem}>
                                                <td>{moment(details?.updated_at).format('DD MMM YYYY')}</td>
                                                <td>{details?.booking_id}</td>
                                                <td>{details?.time_taken} Mins</td>
                                                <td className={styles.amountRightAlign}>₹{( details?.price ||0 ).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            {/* Price Summery */}
                            <br />
                            <tr>
                                <td colSpan="2">
                                    <table style={{ width: '100%', borderSpacing: 0, marginTop:"16px" }}>
                                        <thead>
                                            <tr className={styles.serviceHeader}>
                                                <th>Description</th>
                                                <th></th>
                                                <th></th>
                                                <th className={styles.amountRightAlign}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className={styles.serviceItem}>
                                                <td>
                                                    Base Fare
                                                    <p style ={{fontSize: "12px"}}> 
                                                        Covers the first 10 minutes of the ride
                                                    </p>
                                                </td>
                                                <td></td>
                                                <td></td>
                                                <td className={styles.amountRightAlign}>
                                                    ₹{ Number( details?.base_price || 0 ).toFixed(2) }
                                                </td>
                                            </tr>
                                            { !!details?.additionalPrice && 
                                                <tr className={styles.serviceItem}>
                                                    <td>
                                                        Additional Charge
                                                        <p style ={{fontSize: "12px"}}> 
                                                            {details.additional_price_text} 
                                                            {/* {details?.additionalPrice} */}
                                                        </p>
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className={styles.amountRightAlign}>
                                                        ₹{ Number(details?.additionalPrice || 0 ).toFixed(2)  }
                                                    </td>
                                                </tr>
                                            }
                                            { !!details.taxPrice && 
                                                <tr className={styles.serviceItem}>
                                                    <td>
                                                        GST ( {details.tax_text} )
                                                        {/* <p style ={{fontSize: "12px"}}> </p> */}
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className={styles.amountRightAlign}>
                                                        ₹{ Number( details?.taxPrice || 0 ).toFixed(2) }
                                                    </td>
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr className={styles.serviceItem}>
                                <td style={{ width: '60%', textAlign: 'left' }}>
                                    <p className={styles.totalAmountLabel}>Total Amount:</p>
                                </td>
                                <td className={styles.amountRightAlign}>
                                    <p className={styles.totalAmountValue}>
                                        ₹{ Number( details?.price || 0 ).toFixed(2) }
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
