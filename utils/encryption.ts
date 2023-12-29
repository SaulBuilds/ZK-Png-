export const encryptImage = async (imageData: string, publicKey: string, privateKey: string): Promise<string> => {
    try {
        console.log('Sending image data for encryption processing');
        const response = await fetch('/api/processImage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dataUri: imageData,
                keyword: 'Encryption',
                text: `Public: ${publicKey}, Private: ${privateKey}`
            })
        });
        const result = await response.json();
        console.log('Received encrypted image data from server');

        return result.updatedDataUri;
    } catch (error) {
        console.error('Error encrypting image:', error);
        return '';
    }
};