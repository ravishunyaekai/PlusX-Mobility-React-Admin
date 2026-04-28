import styles from '../details.module.css';
import { AiOutlineClose } from 'react-icons/ai';

const BookingImageSection = ({ titles, content, type, onRemoveImage }) => {
    const baseUrl = content.baseUrl;
    return (
        <div className={styles.ImageMainSection}>
            <div className={styles.imageMainContainer}>
                <div className={styles.infoSection}>
                {/* Check if coverImages exists and render if present */}
                {Array.isArray(content.coverImages) && content.coverImages.length > 0 ? (
                    <div className="col-12">
                    <div className={styles.infoBlock}>
                        <span className={styles.infoHeading}>{titles.coverImages}</span>
                        <div className={styles.galleryImages}>
                        {content.coverImages.map((image, index) => (
                            <img
                            key={index}
                            src={`${baseUrl}${image}`}
                            alt={`Cover Img ${index + 1}`}
                            className={styles.galleryImage}
                            />
                        ))}
                        </div>
                    </div>
                    </div>
                ) : content.coverImage ? (
                    /* Render coverImage only if coverImages is not available */
                    <div className="col-12">
                    <div className={styles.infoBlock}>
                        <span className={styles.infoHeading}>{titles.coverImage}</span>
                        <div className={styles.galleryImages}>
                        <img
                            src={`${baseUrl}${content.coverImage}`}
                            alt="Cover"
                            className={styles.galleryImage}
                        />
                        {/* <button type="button" className={styles.galleryImagesCloseButton} onClick={() => onRemoveImage()}>
                          <AiOutlineClose size={20} style={{ padding: '2px' }} />
                        </button> */}
                        </div>
                    </div>
                    </div>
                ) : (
                    /* Fallback for no data */
                    <div className="col-12">
                        <div className={styles.infoBlock}>
                            <span className={styles.infoHeading}>{titles.coverImages || titles.coverImage}</span>
                            <p className={styles.noDataMessage}>No data available</p>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};
export default BookingImageSection;
