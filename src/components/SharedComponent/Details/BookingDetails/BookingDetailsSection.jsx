import React from 'react'
import styles from '../details.module.css'
import moment from 'moment';


const BookingDetailsSection = ({ titles, content, type }) => {
  // return (
  //   <div className="container-fluid">
  //     <div className={styles.infoSection}>
  //       <div className="row">
  //         {Object.keys(content).map((key) => {
  //           if (titles[key] && content[key]) {
  //             return (
  //               <div className="col-xl-3 col-lg-6 col-12" key={key}>
  //                 <div className={styles.infoBlock}>
  //                   <span className={styles.infoHeading}>{titles[key]}</span>
  //                   <span className={styles.Detailshead}>{content[key]}</span>
  //                 </div>
  //               </div>
  //             );
  //           }
  //           return null; 
  //         })}
  //       </div>
  //     </div>
  //   </div>
  // );

  console.log('content',content)
  

  return (
    <div className="container-fluid">
      <div className={styles.infoSection}>
        <div className="row">
          {Object.keys(content).map((key) => {
            if (titles[key] && content[key]) {
              // Display the cover image if key is 'coverImage'
              if (key === 'coverImage' && content.baseUrl && content[key]) {
                return (
                  <div className="col-xl-3 col-lg-6 col-12" key={key}>
                    <div className={styles.infoBlock}>
                      <span className={styles.infoHeading}>{titles[key]}</span>
                      <img
                        src={`${content.baseUrl}${content[key]}`}
                        alt="Cover"
                        className={styles.coverImage}
                      />
                    </div>
                  </div>
                );
              }

              // Display the gallery images if key is 'galleryImages'
              // if (key === 'galleryImages' && content.baseUrl && Array.isArray(content[key])) {
              //   return (
                  
              //   );
              // }

              // Default content display for other items
              return (
                <div className="col-xl-3 col-lg-6 col-12" key={key}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoHeading}>{titles[key]}</span>
                    <span className={styles.Detailshead}>{content[key]}</span>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );

};


export default BookingDetailsSection