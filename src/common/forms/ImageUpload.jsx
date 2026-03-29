import { useState } from 'react';

import LazyImage from '../ui/LazyImage';
const ImageUpload = () => {
    
    const [images, setImages] = useState([]);

    const handleImageChange = (event) => {
        const selectedImages = Array.from(event.target.files);
        setImages(prevImage => [...prevImage, ...selectedImages]);
    };

    // Remove Uploaded Image Code
    const handleRemoveImage = (index) => {
        const updatedImages  = [...images]; 
        updatedImages.splice(index, 1); 
        setImages(updatedImages); 
    }

  return (
    <div className="image-uploader">
        <label htmlFor="ImageUploadLabel" className="image-uploader__label"> 
            <span className="d-none">Upload Image</span> 
        </label>

        <input type="file" className='image-uploader__input' id='ImageUploadLabel' multiple onChange={handleImageChange} />
        {
            images.length > 0 ? (
                <div className="uploaded-images d-flex flex-wrap gap-3">
                    {
                        images.map((image, index) => (
                            <div className="uploaded-image" key={index}>
                                <button type="button" className='uploaded-image__remove' onClick={()=> handleRemoveImage(index)}>
                                    <i className="fas fa-times"></i>
                                </button>

                                <LazyImage src={URL.createObjectURL(image)} alt={`Image ${index}`} />
                            </div>
                        ))
                    }
                </div>
            ) : (
                <div className="upload-text">
                    <span className="upload-text__icon">
                        <i className="fas fa-cloud-upload-alt"></i>
                    </span>
                    <span className='upload-text__text'>Drag &amp; Drop files here or click to browse</span>
                </div>
            )
        }
    </div>
  );
};

export default ImageUpload;
