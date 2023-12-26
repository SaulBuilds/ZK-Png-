// hooks/useGenerateInputJson.js
import CryptoJS from 'crypto-js';

const hexToString = (hexStr:string) => {
  return '0x' + hexStr;
};

const useGenerateInputJson = () => {
  const generateInputJson = (formData: any) => {
    const nameHash = CryptoJS.SHA256(formData.name).toString(CryptoJS.enc.Hex);
    const addressHash = CryptoJS.SHA256(formData.address).toString(CryptoJS.enc.Hex);
    const phoneNumberHash = CryptoJS.SHA256(formData.phoneNumber).toString(CryptoJS.enc.Hex);

    // Convert hashes to string representations of BigInts
    const nameHashStr = hexToString(nameHash);
    const addressHashStr = hexToString(addressHash);
    const phoneNumberHashStr = hexToString(phoneNumberHash);

    return {
      nameHash: nameHashStr,
      addressHash: addressHashStr,
      phoneNumberHash: phoneNumberHashStr,
      expectedNameHash: nameHashStr,
      expectedAddressHash: addressHashStr,
      expectedPhoneNumberHash: phoneNumberHashStr,
    };
  };

  return generateInputJson;
};

export default useGenerateInputJson;