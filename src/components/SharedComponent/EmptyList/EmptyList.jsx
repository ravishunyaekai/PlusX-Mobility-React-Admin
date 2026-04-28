import styles from './EmptyList.module.css';

const EmptyList = ({ tableHeaders, message }) => {
    
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
                    <tr>
                        <td colSpan={12}>
                            {message}
                        </td>
                    </tr>
                </tbody>
            </table>          
        </div>
    );
};

export default EmptyList;
