import React from 'react';
import PropTypes from 'prop-types';
import styles from './history.module.css';
import { useNavigate } from 'react-router-dom';

const GenericTable = ({ columns, data, actions, firstLink }) => {
    const navigate = useNavigate();
    const renderBooking = (e) => {
        const id = e.target.textContent.trim();
        navigate(`/home-charger/charger-booking-details/${id}`); 
    }

    return (
        <table className={`table ${styles.customTable}`}>
            <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index}>{col.label}</th>
                    ))}
                    {actions && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
                { data.length === 0 ? (
                    <tr>
                        <td colSpan={12} className='border-0 p-0'>
                            <div style={{backgroundColor: "#fff",color: "#000", padding: "10px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"}}> No data available</div>
                        </td>
                    </tr>
                ) : (
                <>  
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} id={colIndex}>
                                    { colIndex === 0 && firstLink ? ( 
                                        <a onClick={renderBooking} style={{color : "#00b26b !important"}}>{row[col.field]} </a> 
                                    ) : ( 
                                        <> {col.render ? col.render(row[col.field], row) : row[col.field]} </>
                                    ) }
                                    
                                </td>
                            ))}
                            {actions && (
                                <td>
                                    {actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={() => action.onClick(row)}
                                            className={styles.actionButton}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </td>
                            )}
                        </tr>
                    ))}
                </>
                )}
            </tbody>
        </table>
    );
};

GenericTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            field: PropTypes.string.isRequired,
            render: PropTypes.func,
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    actions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
        })
    ),
};

export default GenericTable;
