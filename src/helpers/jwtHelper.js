const jwt = require('jsonwebtoken');

/**
 * JwtHelper - Handles JWT token generation and verification
 * Used for stateless authentication
 */
class JwtHelper {
    /**
     * Generate JWT token with custom payload
     * @param {Object} payload - Data to encode in token
     * @param {string} expiresIn - Expiration time (e.g., '1d', '7d', '1h')
     * @returns {string} - JWT token
     */
    static generate(payload, expiresIn = null) {
        const options = {};
        
        if (expiresIn) {
            options.expiresIn = expiresIn;
        } else if (process.env.JWT_EXPIRES_IN) {
            options.expiresIn = process.env.JWT_EXPIRES_IN;
        }

        return jwt.sign(payload, process.env.JWT_SECRET, options);
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token to verify
     * @returns {Object} - { valid: boolean, decoded?: Object, error?: string }
     */
    static verify(token) {
        try {
            return {
                valid: true,
                decoded: jwt.verify(token, process.env.JWT_SECRET)
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Decode JWT token without verification (use only for debugging)
     * @param {string} token - JWT token
     * @returns {Object} - Decoded payload
     */
    static decode(token) {
        return jwt.decode(token);
    }

    /**
     * Generate access token for user authentication
     * @param {Object} user - User object with id, email, role
     * @returns {string} - JWT access token
     */
    static generateAccessToken(user) {
        return this.generate({
            id: user.id,
            email: user.email,
            role: user.role || 'user'
        }, process.env.JWT_EXPIRES_IN || '1d');
    }

    /**
     * Generate refresh token for token renewal
     * @param {Object} user - User object with id
     * @returns {string} - JWT refresh token (longer expiration)
     */
    static generateRefreshToken(user) {
        return this.generate({
            id: user.id,
            type: 'refresh'
        }, '7d');
    }
}

module.exports = JwtHelper;
