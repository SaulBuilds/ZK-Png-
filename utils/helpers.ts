import CryptoJS from 'crypto-js';

export const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            console.log(`Read file as data URL: ${file.name}`);
            resolve(reader.result as string);
        };
        reader.onerror = () => {
            console.error(`Error reading file: ${file.name}`);
            reject(reader.error);
        };
        reader.readAsDataURL(file);
    });
};

export const generateAESKeys = (): { publicKey: string; privateKey: string } => {
    const passphrase = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const publicKey = CryptoJS.AES.encrypt(passphrase, passphrase).toString();
    const privateKey = CryptoJS.AES.decrypt(publicKey, passphrase).toString(CryptoJS.enc.Utf8);
    console.log('Generated AES keys');
    return { publicKey, privateKey };
};
