import styles from '../details.module.css'
import { AiOutlineClose } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import PdfIcon from "../../../../assets/images/PdfIcon.svg";

const BookingMultipleImages = ({ titles, content, type, onRemoveImage }) => {
  const baseUrl = content.baseUrl;
  
  const galleryImagesWithIds =
  Array.isArray(content?.galleryImages) && Array.isArray(content?.galleryImagesId)
    ? content.galleryImages.map((image, index) => ({
        image,
        id: content.galleryImagesId[index],
      }))
    : [];

  const handleDownload = (fileUrl) => {
      const fileName = fileUrl.split("/").pop().split("?")[0];
      const link     = document.createElement("a");
      link.href      = fileUrl;
      link.setAttribute("download", fileName);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();
  };  

  return (
    <div className={styles.multipleImageMainSection}>
      <div className={styles.multipleimageMainContainer}>
        <div className={styles.multipleinfoContainer}>

          {/* Display Gallery Images */}
          {Array.isArray(content?.galleryImages) && (
            <div className="col-12">
              <div className={styles.multiplemultipleinfoBlock}>
                <span className={styles.multiplemultipleinfoHeading}>{titles.galleryImages}</span>
                <div className={styles.multiplegalleryImages}>                  
                  {galleryImagesWithIds?.length > 0 ? (
                    galleryImagesWithIds?.map(({ image, id }, index) => (
                      <div className={styles.imageContainer} key={index}>
                        <img src={`${baseUrl}${image}`} alt={`Gallery img ${index + 1}`} className={styles.gallerymultipleImage} />
                      {type !== "EvchargerDetailGallery" &&    (<button type="button" className={styles.galleryImagesCloseButton} onClick={() => onRemoveImage(id)}>
                        <AiOutlineClose size={20} style={{ padding: '2px' }} />
                      </button>)}
                      </div>
                    ))
                  ) : 
                    content?.galleryImages?.length > 0 ? (
                      content?.galleryImages?.map((image, index) => (
                        <div className={styles.imageContainer} key={index}>
                          <img src={`${baseUrl}${image}`} alt={`Gallery img ${index + 1}`} className={styles.gallerymultipleImage} />
                        </div>
                      ))
                    ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Vehicle Registered Images */}
          {Array.isArray(content?.vehicleRegImages) && (
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                <span className={styles.multipleinfoHeading}>{titles.vehicleRegImages}</span>
                <div className={styles.multiplegalleryImages}>
                  {content?.vehicleRegImages?.length > 0 ? (
                    content?.vehicleRegImages?.map((image, index) => (
                      <div className={styles.imageContainer} key={index}>
                        <img src={`${baseUrl}${image}`} alt={`Gallery img ${index + 1}`} className={styles.gallerymultipleImage} />
                      </div>
                    ))
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Car Images */}
          {Array.isArray(content?.carImages) && (
            <div className="col-12">
                <div className={styles.multipleinfoBlock}>
                    <span className={styles.multipleinfoHeading}>{titles.carImages}</span>
                    <div className={styles.multiplegalleryImages}>
                        {content?.carImages?.length > 0 ? (
                            content?.carImages?.map((image, index) => {
                                const isPDF   = image.toLowerCase().endsWith('.pdf');
                                const fileUrl = `${baseUrl}${image}`;

                                return (
                                    <div className={styles.imageContainer} key={index}>
                                        {isPDF ? (
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={PdfIcon} alt={`PDF File ${index + 1}`} className={styles.pdfIcon} />
                                                <button type="button" className={styles.galleryImagesCloseButton} >
                                                    <FiDownload size={20} style={{ padding: '2px' }} />
                                                </button>
                                            </a>
                                        ) : (<>
                                            <img src={fileUrl} alt={`${titles.carImages} ${index + 1}`} className={styles.gallerymultipleImage} />
                                            <button type="button" className={styles.galleryImagesCloseButton} onClick={() => handleDownload(fileUrl)}>
                                                <FiDownload size={20} style={{ padding: '2px' }} />
                                            </button>   
                                        </>)}
                                    </div>
                                );                            
                            })
                        ) : (
                            <p>No data available</p>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* Display License Images */}
          {Array.isArray(content?.licenseImages) && (
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                <span className={styles.multipleinfoHeading}>{titles.licenseImages}</span>
                <div className={styles.multiplegalleryImages}>
                  {content?.licenseImages?.length > 0 ? (
                    // content.licenseImages.map((image, index) => (
                    //   <div className={styles.imageContainer} key={index}>
                    //     <img
                    //       src={`${baseUrl}${image}`}
                    //       alt={`License img ${index + 1}`}
                    //       className={styles.gallerymultipleImage}
                    //     />
                    //   </div>
                    // ))
                    content?.licenseImages?.map((image, index) => {
                        const isPDF   = image.toLowerCase().endsWith('.pdf');
                        const fileUrl = `${baseUrl}${image}`;

                        return (
                            <div className={styles.imageContainer} key={index}>
                                {isPDF ? (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={PdfIcon} alt={`PDF File ${index + 1}`} className={styles.pdfIcon} />
                                        <button type="button" className={styles.galleryImagesCloseButton} >
                                            <FiDownload size={20} style={{ padding: '2px' }} />
                                        </button>
                                    </a>
                                ) : (<>
                                    <img src={fileUrl} alt={`${titles.licenseImages} ${index + 1}`} className={styles.gallerymultipleImage} />
                                    <button type="button" className={styles.galleryImagesCloseButton} onClick={() => handleDownload(fileUrl)}>
                                        <FiDownload size={20} style={{ padding: '2px' }} />
                                    </button>   
                                </>)}
                            </div>
                        );                            
                    })
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Car type Images */}
          {Array.isArray(content?.typeImages) && content?.typeImages?.length > 0 ? (
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                <span className={styles.multipleinfoHeading}>{titles.typeImages}</span>
                <div className={styles.multiplegalleryImages}>
                  {content?.typeImages?.map((image, index) => (
                    <div className={styles.imageContainer} key={index}>
                      <img key={index} src={`${baseUrl}${image}`} alt={`Gallery img ${index + 1}`} className={styles.gallerymultipleImage} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // If no images are available, show the dummy image
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                {/* <span className={styles.multipleinfoHeading}>{titles.typeImages}</span> */}
                <span className={styles.multipleinfoHeading}></span>
                <div className={styles.multiplegalleryImages}>
                  {/* <img
                    src="" 
                    alt="no image"
                  className={styles.gallerymultipleImage}
                  /> */}
                  {/* <p>Image not available</p> */}
                </div>
              </div>
            </div>
          )}

          {/* Display Emirates Images */}
          {Array.isArray(content?.emiratesImages) && (
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                <span className={styles.multipleinfoHeading}>{titles.emiratesImages}</span>
                <div className={styles.multiplegalleryImages}>
                  {content?.emiratesImages?.length > 0 ? (
                    // content.emiratesImages.map((image, index) => (
                    //   <div className={styles.imageContainer} key={index}>
                    //     <img
                    //       src={`${baseUrl}${image}`}
                    //       alt={`Emirates img ${index + 1}`}
                    //       className={styles.gallerymultipleImage}
                    //     />
                    //   </div>
                    // ))
                    content?.emiratesImages?.map((image, index) => {
                        const isPDF   = image.toLowerCase().endsWith('.pdf');
                        const fileUrl = `${baseUrl}${image}`;

                        return (
                            <div className={styles.imageContainer} key={index}>
                                {isPDF ? (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={PdfIcon} alt={`PDF File ${index + 1}`} className={styles.pdfIcon} />
                                        <button type="button" className={styles.galleryImagesCloseButton} >
                                            <FiDownload size={20} style={{ padding: '2px' }} />
                                        </button>
                                    </a>
                                ) : (<>
                                    <img src={fileUrl} alt={`${titles.emiratesImages} ${index + 1}`} className={styles.gallerymultipleImage} />
                                    <button type="button" className={styles.galleryImagesCloseButton} onClick={() => handleDownload(fileUrl)}>
                                        <FiDownload size={20} style={{ padding: '2px' }} />
                                    </button>                                    
                                </>)}
                            </div>
                        );                            
                    })
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Car Tyre Images */}
          {Array.isArray(content?.tyreImages) && (
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                <span className={styles.multipleinfoHeading}>{titles.tyreImages}</span>
                <div className={styles.multiplegalleryImages}>
                  {content?.tyreImages?.length > 0 ? (
                    content?.tyreImages?.map((image, index) => (
                      <div className={styles.imageContainer} key={index}>
                        <img src={`${baseUrl}${image}`} alt={`Tyre img ${index + 1}`} className={styles.gallerymultipleImage} />
                      </div>
                    ))
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Other Images */}
          {Array.isArray(content?.otherImages) && (
            <div className="col-12">
              <div className={styles.multipleinfoBlock}>
                <span className={styles.multipleinfoHeading}>{titles.otherImages}</span>
                <div className={styles.multiplegalleryImages}>
                  {content?.otherImages?.length > 0 ? (
                    content?.otherImages?.map((image, index) => (
                      <div className={styles.imageContainer} key={index}>
                        <img src={`${baseUrl}${image}`} alt={`Other img ${index + 1}`} className={styles.gallerymultipleImage} />
                      </div>
                    ))
                  ) : (
                    <p>No data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display Files */}
          {content?.evChargerFiles && (
            <div className="col-12">
                <div className={styles.multipleinfoBlock}>
                    <span className={styles.multipleinfoHeading}>{titles.evChargerFiles}</span>
                    <div className={styles.multiplegalleryImages}>
                        <div className={styles.imageContainer} key={1}>
                            <a href={`${baseUrl}${content.evChargerFiles}`} target="_blank" rel="noopener noreferrer">
                                <img src={PdfIcon} alt={`PDF File 1`} className={styles.pdfIcon} />
                                <button type="button" className={styles.galleryImagesCloseButton} >
                                    <FiDownload size={20} style={{ padding: '2px' }} />
                                </button>
                            </a>
                        </div>                 
                    </div>
                </div>
            </div>
          )}

          <div className="row">
            { content?.fileContent?.length > 0 && (
                content?.fileContent?.map( (data, index) => {
                    // const isPDF   = data.FileName.toLowerCase().endsWith('.pdf');
                    const fileUrl = `${data.baseUrl}${data.FileName}`;
                    return (
                        <div className="col-4">
                            <div className={styles.multipleinfoBlock}>
                                <span className={styles.multipleinfoHeading}>{data.FileTitle}</span>
                                <div className={styles.multiplegalleryImages}>
                                    <div className={styles.imageContainer} key={1}>
                                        <a href={`${fileUrl}`} target="_blank" rel="noopener noreferrer">
                                            <img src={PdfIcon} alt={`PDF File 1`} className={styles.pdfIcon} />
                                            <button type="button" className={styles.galleryImagesCloseButton} >
                                                <FiDownload size={20} style={{ padding: '2px' }} />
                                            </button>
                                        </a>
                                    </div>                 
                                </div>
                            </div> 
                        </div>
                    );                            
                })
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default BookingMultipleImages;
