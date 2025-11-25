import React, { useState } from 'react';
import { Form, Button, Image } from 'react-bootstrap';

function ImageUpload({ onImageSelect, currentImage }) {
  const [preview, setPreview] = useState(currentImage || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="image-upload-container">
      <Form.Label>Featured Image (Optional)</Form.Label>
      
      {preview ? (
        <div className="image-preview">
          <Image src={preview} thumbnail />
          <Button 
            size="sm" 
            variant="outline-danger" 
            onClick={handleRemove}
            className="mt-2"
          >
            Remove Image
          </Button>
        </div>
      ) : (
        <div className="image-upload-box">
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <p className="text-muted mt-2 mb-0" style={{fontSize: '0.85rem'}}>
            Upload a featured image for your post
          </p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;