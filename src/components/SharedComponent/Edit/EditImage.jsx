import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiX } from 'react-icons/fi'; // Importing the close icon from react-icons
import styles from './edit.module.css';
import UploadIcon from '../../../assets/images/uploadicon.svg';

const EditImage = () => {
  const [images, setImages] = useState([]);

  const onDrop = (acceptedFiles) => {
    const newImages = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
  });

  return (
    <div className='container-fluid'>
      <div className={styles.uploadContainer}>
        <div className={styles.imagePreview}>
          {images.length > 0 ? (
            <div className={styles.imageGrid}>
              {images.map((image, index) => (
                <div key={index} className={styles.imageItem}>
                  <img src={image.preview} alt={`Preview ${index}`} className={styles.image} />
                  {/* Add the delete button using react-icons */}
                  <button
                    className={styles.deleteButton}
                    onClick={() => removeImage(index)}
                  >
                    <FiX size={20} color="#000000" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
            >
              <input {...getInputProps()} />
              <div className={styles.uploadIcon}>
                <img src={UploadIcon} alt="Upload Icon" />
              </div>
              <p>
                <strong style={{ fontSize: '20px' }}>Select Files to Upload</strong> <br />
                or Drag & Drop, Copy & Paste Files
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditImage;
