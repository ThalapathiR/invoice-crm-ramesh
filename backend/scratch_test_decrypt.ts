import * as CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SecertKey = "e8c35c0a-94d3-4d8e-a9bb-c9d088aa4dd1"; // From .env

function Decrypt(text: string) {
    try {
        const DuplicateKey = CryptoJS.enc.Hex.parse(text);
        const OriginalKey = DuplicateKey.toString(CryptoJS.enc.Base64);
        const bytes = CryptoJS.AES.decrypt(OriginalKey, SecertKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return "DECRYPTION_FAILED: " + e.message;
    }
}

const passwords = [
    "53616c7465645f5f8d1783eadcb705165e24e641c669465b3ca03e4f0f4a31bd", // admin@user.com
    "53616c7465645f5f80da29b9422f95c0d9aade936bf5a75dc526e187f438162f", // leo@gmail.com
    "53616c7465645f5ffcdb14e5ca9c4384a2244ac1fae6b3944c13d2152cf673ff"  // admin@example.com
];

passwords.forEach(p => {
    console.log(`Encrypted: ${p}`);
    console.log(`Decrypted: ${Decrypt(p)}`);
});
