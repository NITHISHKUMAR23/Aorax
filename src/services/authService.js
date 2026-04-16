const IAuthService = require('./interfaces/iAuthService');
const authRepository = require('../repositories/authRepository');
const PasswordHelper = require('../helpers/passwordHelper');
const JwtHelper = require('../helpers/jwtHelper');
const CryptoHelper = require('../helpers/cryptoHelper');
const MESSAGES = require('../constants/messages');

/**
 * AuthService - Business logic layer for authentication
 * Handles business logic, data transformation, and decryption
 * No database operations here - delegates to repository
 */
class AuthService extends IAuthService {
    /**
     * Encrypted fields that need decryption
     */
    static encryptedFields = ['first_name', 'last_name', 'mobile', 'address', 'state', 'pincode'];

    /**
     * Login user with email and password
     * @param {Object} credentials - { email, password }
     * @returns {Object} - Response with status, message, and JWT token
     */
    async loginUser(credentials) {
        try {
            const { email, password } = credentials;

            // Fetch raw user from repository (encrypted fields as Buffer)
            const rawUser = await authRepository.getUserByEmail(email);

            // User not found
            if (!rawUser) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.LOGIN_FAILED
                };
            }

            // Compare password with bcrypt hashed password
            const isPasswordValid = await PasswordHelper.compare(password, rawUser.password);

            if (!isPasswordValid) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.LOGIN_FAILED
                };
            }

            // Decrypt personal fields for response
            const decryptedUser = this.decryptUserFields(rawUser);

            // Generate JWT token
            const token = JwtHelper.generateAccessToken(decryptedUser);

            // Format and return response with camelCase
            return {
                Status: 'SUCCESS',
                Message: MESSAGES.AUTH.LOGIN_SUCCESS,
                Data: {
                    token,
                    user: this.formatUserResponse(decryptedUser)
                }
            };

        } catch (error) {
            console.error('Error in loginUser:', error);
            throw error;
        }
    }

    /**
     * Register new user
     * Personal fields will be encrypted by repository
     * Password will be hashed using bcrypt
     * Email remains plain text for lookup
     * @param {Object} userData - User registration data
     * @returns {Object} - Response with status, message, and JWT token
     */
    async registerUser(userData) {
        try {
            const { email, password, first_name, last_name, mobile, address, state, pincode } = userData;

            // Check if email already exists (email is plain text in DB)
            const emailExists = await authRepository.checkEmailExists(email);

            if (emailExists) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.USER_ALREADY_EXISTS
                };
            }

            // Hash password using bcrypt
            const hashedPassword = await PasswordHelper.hash(password);

            // Create user - repository will encrypt personal fields
            const userId = await authRepository.createUser({
                email,                    // Plain text
                password: hashedPassword, // Bcrypt hash
                first_name,               // Repository will encrypt
                last_name,                // Repository will encrypt
                mobile: mobile || null,   // Repository will encrypt
                address: address || null, // Repository will encrypt
                state: state || null,     // Repository will encrypt
                pincode: pincode || null  // Repository will encrypt
            });

            // Fetch created user (raw data with encrypted fields)
            const rawUser = await authRepository.getUserById(userId);

            // Decrypt personal fields
            const decryptedUser = this.decryptUserFields(rawUser);

            // Generate JWT token
            const token = JwtHelper.generateAccessToken(decryptedUser);

            // Format and return response
            return {
                Status: 'SUCCESS',
                Message: MESSAGES.AUTH.REGISTER_SUCCESS,
                Data: {
                    token,
                    user: this.formatUserResponse(decryptedUser)
                }
            };

        } catch (error) {
            console.error('Error in registerUser:', error);
            throw error;
        }
    }

    /**
     * Get user profile (with decrypted personal fields)
     * @param {number} userId - User ID from JWT token
     * @returns {Object} - Response with decrypted user data
     */
    async getUserProfile(userId) {
        try {
            // Get raw user from repository (encrypted fields as Buffer)
            const rawUser = await authRepository.getUserById(userId);

            if (!rawUser) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.USER_NOT_FOUND
                };
            }

            // Decrypt personal fields
            const decryptedUser = this.decryptUserFields(rawUser);

            // Format and return response
            return {
                Status: 'SUCCESS',
                Data: this.formatUserResponse(decryptedUser, true) // Include created_at
            };

        } catch (error) {
            console.error('Error in getUserProfile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * Personal fields will be encrypted by repository before storing
     * @param {number} userId - User ID
     * @param {Object} userData - Fields to update
     * @returns {Object} - Response with updated decrypted data
     */
    async updateUserProfile(userId, userData) {
        try {
            // Repository will encrypt personal fields before updating
            const updated = await authRepository.updateUser(userId, userData);

            if (!updated) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.USER_NOT_FOUND
                };
            }

            // Fetch updated user (raw data with encrypted fields)
            const rawUser = await authRepository.getUserById(userId);

            // Decrypt personal fields
            const decryptedUser = this.decryptUserFields(rawUser);

            // Format and return response
            return {
                Status: 'SUCCESS',
                Message: MESSAGES.SUCCESS.UPDATED,
                Data: this.formatUserResponse(decryptedUser)
            };

        } catch (error) {
            console.error('Error in updateUserProfile:', error);
            throw error;
        }
    }

    /**
     * Change user password
     * @param {number} userId - User ID
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Object} - Response with status
     */
    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await authRepository.getUserById(userId);

            if (!user) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.USER_NOT_FOUND
                };
            }

            // Verify old password with bcrypt hash
            const isOldPasswordValid = await PasswordHelper.compare(oldPassword, user.password);

            if (!isOldPasswordValid) {
                return {
                    Status: 'FAIL',
                    Message: 'Current password is incorrect'
                };
            }

            // Hash new password with bcrypt
            const hashedNewPassword = await PasswordHelper.hash(newPassword);

            // Update password (only password, no encryption needed)
            await authRepository.updateUser(userId, { password: hashedNewPassword });

            return {
                Status: 'SUCCESS',
                Message: 'Password changed successfully'
            };

        } catch (error) {
            console.error('Error in changePassword:', error);
            throw error;
        }
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token to verify
     * @returns {Object} - Response with decoded token data
     */
    async verifyToken(token) {
        try {
            const verification = JwtHelper.verify(token);

            if (!verification.valid) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.TOKEN_INVALID
                };
            }

            return {
                Status: 'SUCCESS',
                Data: verification.decoded
            };

        } catch (error) {
            console.error('Error in verifyToken:', error);
            throw error;
        }
    }

    /**
     * Refresh JWT token
     * @param {string} refreshToken - Refresh token
     * @returns {Object} - Response with new tokens
     */
    async refreshToken(refreshToken) {
        try {
            const verification = JwtHelper.verify(refreshToken);

            if (!verification.valid || verification.decoded.type !== 'refresh') {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.TOKEN_INVALID
                };
            }

            // Get raw user from repository
            const rawUser = await authRepository.getUserById(verification.decoded.id);

            if (!rawUser) {
                return {
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.USER_NOT_FOUND
                };
            }

            // Decrypt for token generation
            const decryptedUser = this.decryptUserFields(rawUser);

            const newAccessToken = JwtHelper.generateAccessToken(decryptedUser);
            const newRefreshToken = JwtHelper.generateRefreshToken(decryptedUser);

            return {
                Status: 'SUCCESS',
                Data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            };

        } catch (error) {
            console.error('Error in refreshToken:', error);
            throw error;
        }
    }

    /**
     * Decrypt encrypted fields in user object
     * @param {Object} rawUser - Raw user data from database (with Buffer fields)
     * @returns {Object} - User object with decrypted string fields
     * @private
     */
    decryptUserFields(rawUser) {
        if (!rawUser) return null;

        const decrypted = { ...rawUser };

        AuthService.encryptedFields.forEach(field => {
            if (rawUser[field] && Buffer.isBuffer(rawUser[field])) {
                try {
                    decrypted[field] = CryptoHelper.decrypt(rawUser[field]);
                } catch (error) {
                    console.error(`Error decrypting field ${field}:`, error);
                    decrypted[field] = null;
                }
            }
        });

        return decrypted;
    }

    /**
     * Format user object for API response (camelCase, remove sensitive fields)
     * @param {Object} user - Decrypted user object
     * @param {boolean} includeTimestamps - Whether to include created_at/updated_at
     * @returns {Object} - Formatted user object for response
     * @private
     */
    formatUserResponse(user, includeTimestamps = false) {
        const response = {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            mobile: user.mobile || null,
            address: user.address || null,
            state: user.state || null,
            pincode: user.pincode || null
        };

        if (includeTimestamps) {
            response.createdAt = user.created_at;
            if (user.updated_at) {
                response.updatedAt = user.updated_at;
            }
        }

        return response;
    }
}

module.exports = new AuthService();
