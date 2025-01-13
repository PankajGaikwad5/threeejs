'use client';
import './styles.css';

import React, { useState } from 'react';
import { UploadButton } from '../../utils/uploadthing'; // Assuming your UploadButton is in this path

const Page = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className='container'>
      <form>
        <textarea
          name='title'
          id='title'
          placeholder='Enter title'
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />

        <textarea
          name='description'
          id='description'
          placeholder='Enter description (optional)'
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />

        {/* Upload Button for Multiple Files */}
        <UploadButton
          endpoint='imageUploader' // Ensure this matches the FileRoute in your backend
          multiple // Enable multiple file upload
          onClientUploadComplete={(res) => {
            // Handle the response, which includes uploaded file data
            console.log('Files:', res);
            const uploadedUrls = res.map((file) => file.url); // Extract file URLs

            // Now send these URLs to your backend
            fetch('/api/topics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title,
                images: uploadedUrls, // Array of image URLs
                description,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                alert(data.msg); // Display success message
                setTitle('');
                setDescription('');
              })
              .catch((error) => {
                console.error('Error:', error);
                alert('Failed to submit. Please try again.');
              });
          }}
          onUploadError={(error) => {
            // Handle upload error
            alert(`ERROR! ${error.message}`);
          }}
        />
      </form>
    </div>
  );
};

export default Page;
