import styles from './list.module.css';
import Edit from '../../../assets/images/Pen.svg';
// import Cancel from '../../../assets/images/Cancel.svg';
import Delete from '../../../assets/images/Delete.svg';
import View from '../../../assets/images/ViewEye.svg'
import { useNavigate } from 'react-router-dom';
import { statusMapping } from '../../../utils/statusMapping';

const List = ({ list, tableHeaders, listData, keyMapping, pageHeading, onDeleteSlot }) => {
    const userDetails  = JSON.parse(sessionStorage.getItem('userDetails')); 
    const departmentId = userDetails.departmentId;
    const navigate         = useNavigate();
    const handleClickEvent = (hrefLink, id) => navigate(`${hrefLink}/${id}`)
    const access = userDetails.access?.split('_') || [];

    return (
        <div className={styles.containerCharger}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {tableHeaders?.map((header, i) => (
                            <th key={i}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* {
                        list === 'time slot' ?
                            <tr>
                                <span className={styles.listSpan}>Date:12-12-2024</span>
                            </tr> : ''
                    } */}
                    {listData.map((data, index) => (
                        <tr key={index}>
                            {/* {keyMapping.map((keyObj, keyIndex) => (
                                <td key={keyIndex}>
                                    {keyObj.format
                                        ? keyObj.relatedKeys
                                            ? keyObj.format(data, keyObj.key, keyObj.relatedKeys)
                                            : keyObj.format(data[keyObj.key])
                                        : data[keyObj.key]
                                    }
                                </td>
                            ))} */}

                            { keyMapping.map((keyObj, keyIndex) => {
                                const rawValue = data[keyObj.key];
                                const cellValue = keyObj.format
                                    ? keyObj.relatedKeys
                                        ? keyObj.format(data, keyObj.key, keyObj.relatedKeys)
                                        : keyObj.format(rawValue)
                                    : rawValue;

                                const keyLower = keyObj.key.toLowerCase();
                                const isStatusColumn = keyLower === 'status';
                                const isBasePriceColumn = keyLower === 'base_price';
                                let style = {};

                                if (isStatusColumn) {
                                    const readableStatus = statusMapping[rawValue] || '';
                                        if (readableStatus === 'On Going')      style.color = '#00B26B';
                                    else if (readableStatus === 'Failed') style.color = 'red';
                                }
                                else if (isBasePriceColumn) {
                                    style.color = '#00B26B';
                                }

                                return (
                                    <td key={keyIndex} style={style}>
                                        {isStatusColumn ? statusMapping[rawValue] || cellValue : cellValue}
                                    </td>
                                );
                            })}

                            <td>
                                <div className={styles.editContent}>

                                    { (pageHeading === "Total App Signup List" ) && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/mobility/app-signup/app-signup-details', data.rider_id)} />
                                            )}
                                        </>
                                    )}
                                    { pageHeading === "List of Stations" && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/mobility/mobility-station/station-details', data.station_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/mobility/mobility-station/edit-mobility-station', data.station_id)} />
                                            )}
                                            {/* { access.includes('delete') && (
                                                <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.station_id)} />
                                            )} */}
                                        </>
                                    )}

                                    { pageHeading === "List of Cycles" && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/mobility/mobility-station/cycle-details', data.cycle_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/mobility/mobility-station/edit-cycle', data.cycle_id)} />
                                            )}
                                            {/* { access.includes('delete') && (
                                                <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.cycle_id)} />
                                            )} */}
                                        </>
                                    )}

                                    { pageHeading === 'List of Universities' && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/mobility/universities/university-details', data.university_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/mobility/universities/edit-university', data.university_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'List of Students' && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/mobility/universities/student-details', data.rider_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/mobility/universities/edit-student', data.rider_id)} />
                                            )}
        
                                        </>
                                    )}

                                    { pageHeading === 'Drivers List' && (
                                        <>
                                            {/* <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.rsa_id)} /> */}
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/drivers/drivers-details', data.rsa_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/drivers/edit-driver', data.rsa_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'Ev Road Assistance Invoice List' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/ev-road-assistance/invoice-details', data.invoice_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'Total Public Chargers List' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/public-charger-station/public-charger-station-details', data.station_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/public-charger-station/edit-charger-station', data.station_id)} />
                                            )}
                                        </>
                                    )}
                                    

                                    { pageHeading === 'EV Chargers' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/ev-charger-details', data.charger_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/charger-installation/ev-charger-edit', data.charger_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'EV Charger Bookings' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/ev-charger-booking-details', data.request_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'EV Product List' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/product-details', data.charger_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/charger-installation/product-edit', data.charger_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'EV Accessories' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/accessories-details', data.charger_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/charger-installation/accessories-edit', data.charger_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'EV Accessories Bookings' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/accessories-booking-details', data.request_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'Charger Installation Booking' && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/charger-installation-details', data.request_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === "EV Products & Installation" && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charger-installation/purchase-customer-details', data.purchase_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/charger-installation/purchase-edit', data.charger_id)} />
                                            )}
                                        </>
                                    )}
                                    { pageHeading === "Chargers Share Listings" && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/charge-share/charge-share-details', data.charger_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/charge-share/charge-share-edit', data.charger_id)} />
                                            )}
                                        </>
                                    )}


                                    { pageHeading === 'Offer List' && (
                                        <>
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/offer/edit-offer', data.offer_id)} />
                                            )}
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/offer/offer-details', data.offer_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === 'Coupon List' && (
                                        <>
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/coupon/edit-coupon', data.id)} />
                                            )}
                                            { access.includes('delete') && (
                                                <img src={Delete} alt="delete" onClick={() => onDeleteSlot(data.coupan_code)} />
                                            )}
                                        </>
                                    )}
                                    { pageHeading === 'Ev Insurance List' && (
                                        <>
                                              <img src={View} alt="view" onClick={() => handleClickEvent('/electric/ev-insurance/ev-insurance-detail', data.insurance_id)} />
                                        </>
                                    )}
                                    

                                    { pageHeading === "Home Charger List" && (
                                        <>
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/home-charger/edit-charger', data.charger_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === "Home Charger Device List" && (
                                        <>
                                            { access.includes('view') && (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/electric/home-charger/device-details', data.pod_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/home-charger/edit-device', data.pod_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === "Home Charger Area List" && (
                                        <>
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/home-charger/edit-area', data.area_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === "POD Brand List" && (
                                        <>
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/electric/home-charger/edit-brand', data.area_id)} />
                                            )}
                                        </>
                                    )}

                                    { pageHeading === "Cycle List" && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/mobility/mobility-station/cycle-details', data.cycle_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/mobility/mobility-station/edit-cycle', data.cycle_id)} />
                                            )}
                                            {/* { access.includes('delete') && (
                                                <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.cycle_id)} />
                                            )} */}
                                        </>
                                    )}
                                    
                                    { pageHeading === "List of Coupon" && (
                                        <>
                                            { access.includes('view') &&  (
                                                <img src={View} alt="view" onClick={() => handleClickEvent('/coupon/coupon-list/coupon-details', data.coupon_id)} />
                                            )}
                                            { access.includes('edit') && (
                                                <img src={Edit} alt='edit' onClick={() => handleClickEvent('/coupon/coupon-list/edit-coupon', data.coupon_id)} />
                                            )}
                                            {/* { access.includes('delete') && (
                                                <img src={Delete} alt='delete' onClick={() => onDeleteSlot(data.cycle_id)} />
                                            )} */}
                                        </>
                                    )}

                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default List;
