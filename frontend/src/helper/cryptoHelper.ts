// utils/cryptoHelper.ts
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || ' '; // Replace or set via .env.local

// Encrypt an object
export const encrypt = (data: object): string => {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
};

// Decrypt an encrypted string to an object
export const decrypt = (encryptedData: string): object => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const jsonString = bytes.toString(CryptoJS.enc.Utf8);
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error('Failed to decrypt or parse object.');
    }
};



export const encryptString = (plainText: string): string => {

    return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};


export const decryptString = (cipherText: string): string => {

    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};


export const encryptImage = (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result as string; // Base64 string of the image
            const encryptedImage = CryptoJS.AES.encrypt(base64Image, secretKey).toString();
            resolve(encryptedImage);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile); // Convert the file to a base64 string
    });
};



export const decryptImage = (encryptedData: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const base64Image = bytes.toString(CryptoJS.enc.Utf8);
    return base64Image; // You can use this string as the src for an image element
};

export function generateToken(payload: string | object | Buffer) {
    const secretKey = process.env.JWT_SECRET || "";
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    return token;
}

export function verifyToken(token: string) {

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log("Decoded token:", decoded);
        return decoded;
    } catch (error: any) {
        console.error("Error object:", error);
        console.error("Token verification failed:", error instanceof Error ? error.message : error);
        return null; // Or handle the error as needed
    }
}

