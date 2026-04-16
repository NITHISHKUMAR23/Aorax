const MESSAGES = require('../constants/messages');

class AuthValidation {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        if (!password || password.length < 8) {
            return {
                isValid: false,
                message: MESSAGES.VALIDATION.INVALID_PASSWORD
            };
        }
        return { isValid: true };
    }

    static validateLoginInput(data) {
        const errors = [];

        if (!data.email) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!this.validateEmail(data.email)) {
            errors.push({ field: 'email', message: MESSAGES.VALIDATION.INVALID_EMAIL });
        }

        if (!data.password) {
            errors.push({ field: 'password', message: 'Password is required' });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validateRegisterInput(data) {
        const errors = [];

        if (!data.email) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!this.validateEmail(data.email)) {
            errors.push({ field: 'email', message: MESSAGES.VALIDATION.INVALID_EMAIL });
        }

        if (!data.password) {
            errors.push({ field: 'password', message: 'Password is required' });
        } else {
            const passwordValidation = this.validatePassword(data.password);
            if (!passwordValidation.isValid) {
                errors.push({ field: 'password', message: passwordValidation.message });
            }
        }

        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
            errors.push({ field: 'confirmPassword', message: MESSAGES.VALIDATION.PASSWORDS_NOT_MATCH });
        }

        if (!data.first_name) {
            errors.push({ field: 'first_name', message: 'First name is required' });
        }

        if (!data.last_name) {
            errors.push({ field: 'last_name', message: 'Last name is required' });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static sanitizeInput(data) {
        const sanitized = {};
        
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string') {
                sanitized[key] = data[key].trim();
            } else {
                sanitized[key] = data[key];
            }
        });

        return sanitized;
    }
}

module.exports = AuthValidation;
