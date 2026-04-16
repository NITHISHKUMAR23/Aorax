const bcrypt = require('bcrypt');

/**
 * PasswordHelper - Handles password hashing and comparison using bcrypt
 * Used for secure password storage (one-way hashing, cannot be reversed)
 */
class PasswordHelper {
    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Bcrypt hashed password
     */
    static async hash(password) {
        const saltRounds = 10; // Higher = more secure but slower
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare plain password with hashed password
     * @param {string} plainPassword - Plain text password from login
     * @param {string} hashedPassword - Bcrypt hash from database
     * @returns {Promise<boolean>} - True if password matches
     */
    static async compare(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static validateStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];

        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static generateRandomPassword(length = 12) {
        const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        const allChars = upperChars + lowerChars + numbers + specialChars;
        
        let password = '';
        password += upperChars[Math.floor(Math.random() * upperChars.length)];
        password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += specialChars[Math.floor(Math.random() * specialChars.length)];
        
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

module.exports = PasswordHelper;
