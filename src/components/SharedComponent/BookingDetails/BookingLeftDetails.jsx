import styles from './bookingdetails.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BookingLeftDetails = ({ titles, content, sectionTitles2, sectionContent2, sectionTitles3, sectionContent3, 
    sectionTitles4, sectionContent4, sectionTitles5, sectionContent5,sectionTitles6, sectionContent6, sectionTitles7, sectionContent7 }) => {

    const shouldRenderThirdSection = Object.keys(content || {}).length > 0 && Object.keys(sectionContent2 || {}).length > 0 && Object.keys(sectionContent3 || {}).length > 0;
    const shouldRenderFourthSection = Object.keys(sectionContent4 || {}).length > 0; 
    const shouldRenderFifthSection = Object.keys(sectionContent5 || {}).length > 0; 
    const shouldRenderSixthSection = Object.keys(sectionContent6 || {}).length > 0;
    const shouldRenderSeventhSection = Object.keys(sectionContent7 || {}).length > 0; 
    
    return (
        <div className="col-xl-12">
            <div className={styles.bookingStatusContainer}>
                <div className={`row ${styles.customRow}`}>
                    {Object.keys(content || {}).length > 0 ? (
                        Object.keys(content).map((key) => (
                            <div className={`${styles.detailItem} col-xl-4 col-md-6 col-12`} key={key}>
                                <span className={styles.label}>{titles[key] || key}</span>
                                <span className={styles.value}>{content[key] || 'N/A'}</span>
                            </div>
                        ))
                    ) : (
                        <div className="col-12"></div>
                    )}
                </div>

                <div className={`row ${styles.customRow}`}>
                    {Object.keys(sectionContent2 || {}).length > 0 ? (
                        Object.keys(sectionContent2).map((key) => (
                            <div className={`${styles.detailItem} col-xl-4 col-md-6 col-12`} key={key}>
                                <span className={styles.label}>{sectionTitles2[key] || key}</span>
                                <span className={styles.value}>{sectionContent2[key] || 'N/A'}</span>
                            </div>
                        ))
                    ) : (
                        <div className="col-12"></div>
                    )}
                </div>

                {shouldRenderThirdSection && (
                    <div className={`row ${styles.customRow}`}>
                        {Object.keys(sectionContent3 || {}).length > 0 ? (
                            Object.keys(sectionContent3).map((key) => (
                                <div className={`${styles.detailItem} col-xl-4 col-md-6 col-12`} key={key}>
                                    <span className={styles.label}>{sectionTitles3[key] || key}</span>
                                    <span className={styles.value}>{sectionContent3[key] || 'N/A'}</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-12"></div>
                        )}
                    </div>
                )}

                {shouldRenderFifthSection && (
                    <div className={`row ${styles.customRow}`}>
                        {Object.keys(sectionContent5 || {}).length > 0 ? (
                            Object.keys(sectionContent5).map((key) => (
                                <div className={`${styles.detailItem} col-xl-4 col-md-6 col-12`} key={key}>
                                    <span className={styles.label}>{sectionTitles5[key] || key}</span>
                                    <span className={styles.value}>{sectionContent5[key] || 'N/A'}</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-12"></div>
                        )}
                    </div>
                )}

                {shouldRenderSixthSection && (
                    <div className={`row ${styles.customRow}`}>
                        {Object.keys(sectionContent6 || {}).length > 0 ? (
                            Object.keys(sectionContent6).map((key) => (
                                <div className={`${styles.detailItem} col-xl-4 col-md-6 col-12`} key={key}>
                                    <span className={styles.label}>{sectionTitles6[key] || key}</span>
                                    <span className={styles.value}>{sectionContent6[key] || 'N/A'}</span>
                                </div>
                            ))
                        ) : (
                            <div className="col-12"></div>
                        )}
                    </div>
                )}
            </div>

            {/* Start the description section */}
            {shouldRenderFourthSection && (
            <div className={styles.bookingDescriptionContainer}>
                
                    <div className="row">
                        {Object.keys(sectionContent4).map((key) => (
                            <div className={`${styles.detailItem} col-12`} key={key}>
                                <span className={styles.label}>{sectionTitles4[key] || key}</span>
                                <span className={styles.value}>{sectionContent4[key] || 'N/A'}</span>
                            </div>
                        ))}
                    </div>
                
            </div>
            )}
            {/* End the description section */}

            {/* Start the description section */}
            {shouldRenderSeventhSection && (
                <div className={styles.bookingDescriptionContainer}>
                    <div className="row">
                        {Object.keys(sectionContent7).map((key) => (
                            <div className={`${styles.detailItem} col-12`} key={key}>
                                <span className={styles.label}>{sectionTitles7[key] || key}</span>
                                <span className={styles.value}>{sectionContent7[key] || 'N/A'}</span>
                            </div>
                        ))}
                    </div>                    
                </div>
            )}
        </div>
    );
};

export default BookingLeftDetails;
