import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { encryptImage } from '../utils/encryption';
import { readFileAsDataURL, generateAESKeys } from '../utils/helpers';

type HashedImage = {
  hash: string;
  publicKey: string;
  privateKey: string;
  updatedImageData: string;
  encrypt: boolean;
};

export const useImageHasher = (images: File[], encryptFlag: boolean) => {
    const [progress, setProgress] = useState({ completed: 0, total: images.length });
    const [privateKeys, setPrivateKeys] = useState<Record<string, string>>({});
    const [hashedImages, setHashedImages] = useState<Record<string, HashedImage>>({});

    useEffect(() => {
        const processImages = async () => {
            const newHashes: Record<string, HashedImage> = {};
            let processedCount = 0;
    
            for (const image of images) {
                try {
                    const imageData = await readFileAsDataURL(image);
                    const hash = CryptoJS.SHA256(imageData).toString();
                    const { publicKey, privateKey } = generateAESKeys();
    
                    let updatedImageData = imageData;
                    if (encryptFlag) {
                        updatedImageData = await encryptImage(imageData, publicKey, privateKey);
                    }
    
                    newHashes[image.name] = { hash, publicKey, privateKey, updatedImageData, encrypt: encryptFlag };
                    setPrivateKeys(prev => ({ ...prev, [image.name]: privateKey }));
    
                    // Update progress for each image processed
                    processedCount++;
                    setProgress(prev => ({ ...prev, completed: processedCount }));
                } catch (error) {
                    console.error(`Error processing image ${image.name}:`, error);
                }
            }
    
            setHashedImages(newHashes);
        };
    
        if (encryptFlag) {
            processImages();
        }
    }, [encryptFlag, images]);

return { hashedImages, progress, privateKeys };
};

export default useImageHasher;