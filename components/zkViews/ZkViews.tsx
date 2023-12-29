// import React, { useState } from 'react';
// import { Grid, Box, Button, Card, CardMedia, CardActionArea } from '@mui/material';
// import useImageHasher from '@/hooks/useImageHasher';
// const ZkViews: React.FC = () => {
//     const [images, setImages] = useState<File[]>([]);
//     const hashedImages = useImageHasher(images);
  
//     const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//       if (event.target.files) {
//         setImages(Array.from(event.target.files));
//       }
//     };
  
//     return (
//       <div>
//         <input
//           type="file"
//           multiple
//           accept="image/png, image/jpeg"
//           onChange={handleImageChange}
//         />
//         {/* Display hashed images and keys */}
//         {Object.entries(hashedImages).map(([imageName, { hash, publicKey, privateKey }]) => (
//           <div key={imageName}>
//             <p>Image: {imageName}</p>
//             <p>Hash: {hash}</p>
//             <p>Public Key: {publicKey}</p>
//             <p>Private Key: {privateKey}</p>
//           </div>
//         ))}
//       </div>
//     );
//   };

// export default ZkViews;

import React, { useState, useEffect } from 'react';
import { Grid, Card, CardActionArea, CardMedia, CardActions, Button } from '@mui/material';
import ProgressModal from '../progressModal'; // Ensure this path is correct
import { readFileAsDataURL, generateAESKeys } from '../../utils/helpers';
import { encryptImage } from '../../utils/encryption';
import useImageHasher from '@/hooks/useImageHasher';

const ZkViews: React.FC = () => {
    const [images, setImages] = useState<File[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [encryptFlag, setEncryptFlag] = useState(false);

    // Use the hook and destructure the needed values
    const { hashedImages, progress, privateKeys } = useImageHasher(images, encryptFlag);

    useEffect(() => {
        const encryptImages = async () => {
            console.log('Starting encryption process for selected images');
            for (const image of images.filter(img => selectedImages.has(img.name))) {
                try {
                    console.log('Processing image:', image.name);
                    const imageData = await readFileAsDataURL(image);
                    const { publicKey, privateKey } = generateAESKeys();
                    console.log(`Generated keys for ${image.name} - Public: ${publicKey}, Private: ${privateKey}`);
    
                    // Encrypt the image
                    const encryptedImageData = await encryptImage(imageData, publicKey, privateKey);
                    console.log(`Encrypted image data for ${image.name}`);
    
                    // Modify the iTXt chunk with updated information (e.g., encryption details)
                    const modifiedImageData = modifyITXtChunk(encryptedImageData, image.name, privateKey);
    
                    // Send the modified data to the server
                    await sendEncryptedImageToServer(image.name, modifiedImageData);
                } catch (error) {
                    console.error('Error encrypting image:', image.name, error);
                }
            }
            setEncryptFlag(false); // Reset the flag after encryption
        };
    
        if (encryptFlag) {
            encryptImages();
        }
    }, [encryptFlag, images, selectedImages]);
    const sendEncryptedImageToServer = async (imageName: string, updatedImageData: string): Promise<void> => {        try {
          await fetch('/api/saveEncryptedImage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageName,
              updatedImageData
            })
          });
        } catch (error) {
          console.error('Error sending encrypted image to server:', imageName, error);
        }
      };
      
      const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            console.log('Selected images:', event.target.files);
            setImages(Array.from(event.target.files));
        }
    };

    const handleImageSelect = (imageName: string) => {
        console.log('Selected image for encryption:', imageName);
        const newSelectedImages = new Set(selectedImages);
        if (newSelectedImages.has(imageName)) {
            newSelectedImages.delete(imageName);
        } else {
            newSelectedImages.add(imageName);
        }
        setSelectedImages(newSelectedImages);
    };

    const encryptSelectedImages = () => {
        console.log('Encrypting selected images');
        setEncryptFlag(true); // Set the flag to trigger encryption for selected images
    };

    const encryptAllImages = () => {
        console.log('Encrypting all images');
        setSelectedImages(new Set(images.map(img => img.name))); // Select all images
        setEncryptFlag(true); // Set the flag to trigger encryption for all images
    };

    return (
       
        <div>
            <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
            />
            <Button onClick={encryptAllImages}>Encrypt All Images</Button>
            <Grid container spacing={2}>
                {Object.entries(hashedImages).map(([imageName, { updatedImageData }], index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card>
                            <CardActionArea onClick={() => handleImageSelect(imageName)}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={updatedImageData}
                                    alt={imageName}
                                />
                            </CardActionArea>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => encryptSelectedImages()}>
                                    Encrypt
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <ProgressModal open={encryptFlag} progress={progress} privateKeys={privateKeys} />
        </div>
    );
};

export default ZkViews;