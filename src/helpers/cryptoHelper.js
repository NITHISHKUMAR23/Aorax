const crypto = require('crypto');

/**
 * CryptoHelper - Handles encryption/decryption for sensitive personal data
 * Uses AES-256-CBC encryption for fields like first_name, last_name, mobile, address, state, pincode
 */
class CryptoHelper {
    /**
     * Get encryption key from environment
     * @returns {Buffer} - 32-byte encryption key for AES-256
     */
    static getEncryptionKey() {
        const key = process.env.ENCRYPTION_KEY;
        if (!key) {
            throw new Error('ENCRYPTION_KEY is not defined in environment variables');
        }
        // Ensure key is exactly 32 bytes for AES-256
        return Buffer.from(key.padEnd(32, '0').substring(0, 32), 'utf8');
    }

    /**
     * Encrypt text using AES-256-CBC
     * @param {string} text - Plain text to encrypt
     * @returns {Buffer} - Encrypted data as Buffer (for VARBINARY storage)
     */
    static encrypt(text) {
        try {
            if (!text || text.trim() === '') {
                return null;
            }

            const algorithm = 'aes-256-cbc';
            const key = this.getEncryptionKey();
            const iv = crypto.randomBytes(16); // Initialization vector
            
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let encrypted = cipher.update(text, 'utf8');
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            
            // Combine IV and encrypted data (IV is needed for decryption)
            const result = Buffer.concat([iv, encrypted]);
            
            return result;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt data using AES-256-CBC
     * @param {Buffer} encryptedData - Encrypted Buffer from database
     * @returns {string} - Decrypted plain text
     */
    static decrypt(encryptedData) {
        try {
            if (!encryptedData) {
                return null;
            }

            const algorithm = 'aes-256-cbc';
            const key = this.getEncryptionKey();
            
            // Extract IV (first 16 bytes) and encrypted content
            const iv = encryptedData.slice(0, 16);
            const encrypted = encryptedData.slice(16);
            
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted, null, 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Encrypt multiple fields in an object
     * @param {Object} data - Object with fields to encrypt
     * @param {Array} fieldsToEncrypt - Array of field names to encrypt
     * @returns {Object} - Object with encrypted fields
     */
    static encryptFields(data, fieldsToEncrypt) {
        const encrypted = { ...data };
        
        fieldsToEncrypt.forEach(field => {
            if (data[field]) {
                encrypted[field] = this.encrypt(data[field]);
            }
        });
        
        return encrypted;
    }

    /**
     * Decrypt multiple fields in an object
     * @param {Object} data - Object with encrypted fields
     * @param {Array} fieldsToDecrypt - Array of field names to decrypt
     * @returns {Object} - Object with decrypted fields
     */
    static decryptFields(data, fieldsToDecrypt) {
        const decrypted = { ...data };
        
        fieldsToDecrypt.forEach(field => {
            if (data[field] && Buffer.isBuffer(data[field])) {
                decrypted[field] = this.decrypt(data[field]);
            }
        });
        
        return decrypted;
    }

    /**
     * Generate random token for password reset, verification codes, etc.
     * @param {number} length - Length of token in bytes
     * @returns {string} - Random hex token
     */
    static generateRandomToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Generate random numeric code
     * @param {number} length - Length of code
     * @returns {string} - Random numeric code
     */
    static generateRandomCode(length = 6) {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += digits[Math.floor(Math.random() * digits.length)];
        }
        return code;
    }

    /**
     * Hash data using SHA-256 (for non-reversible hashing)
     * @param {string} data - Data to hash
     * @returns {string} - SHA-256 hash
     */
    static hashSHA256(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

module.exports = CryptoHelper;
