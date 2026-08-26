import config from "@/config/config";
import CryptoJS from "crypto-js";


export const encryptPassword = (password: string): string => {
    const key = CryptoJS.enc.Utf8.parse(config.encryptionSecretKey); // 16-byte key for AES-128

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(password, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
};
