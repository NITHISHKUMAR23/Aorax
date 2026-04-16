const authService = require('../services/authService');
const AuthValidation = require('../validations/authValidation');
const MESSAGES = require('../constants/messages');

/**
 * AuthController - Request handler layer
 * Handles HTTP requests and responses
 * Validates input and delegates to service layer
 * No business logic here
 */
class AuthController {
    /**
     * Login endpoint
     * POST /api/auth/login
     * Body: { email, password }
     * Response: JWT token with decrypted user data
     */
    async login(req, res) {
        try {
            // Sanitize input (trim whitespace, etc.)
            const sanitizedData = AuthValidation.sanitizeInput(req.body);

            // Validate required fields and format
            const validation = AuthValidation.validateLoginInput(sanitizedData);

            if (!validation.isValid) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: MESSAGES.ERROR.BAD_REQUEST,
                    Errors: validation.errors
                });
            }

            // Delegate to service layer
            const result = await authService.loginUser(sanitizedData);

            // Service returns decrypted user data
            if (result.Status === 'FAIL') {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Register endpoint
     * POST /api/auth/register
     * Body: { email, password, confirmPassword, first_name, last_name, mobile?, address?, state?, pincode? }
     * Personal fields will be encrypted before storing
     * Password will be hashed with bcrypt
     * Email stored as plain text
     * Response: JWT token with decrypted user data
     */
    async register(req, res) {
        try {
            // Sanitize input
            const sanitizedData = AuthValidation.sanitizeInput(req.body);

            // Validate required fields, email format, password strength, etc.
            const validation = AuthValidation.validateRegisterInput(sanitizedData);

            if (!validation.isValid) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: MESSAGES.ERROR.BAD_REQUEST,
                    Errors: validation.errors
                });
            }

            // Delegate to service layer
            // Service will hash password and encrypt personal fields via repository
            const result = await authService.registerUser(sanitizedData);

            if (result.Status === 'FAIL') {
                return res.status(400).json(result);
            }

            // Return decrypted user data
            return res.status(201).json(result);

        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Get user profile (Protected route)
     * GET /api/auth/profile
     * Headers: Authorization: Bearer <token>
     * Response: Decrypted user data
     */
    async getProfile(req, res) {
        try {
            // User ID from JWT token (set by authMiddleware)
            const userId = req.user.id;

            // Get user with decrypted personal fields
            const result = await authService.getUserProfile(userId);

            if (result.Status === 'FAIL') {
                return res.status(404).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Update user profile (Protected route)
     * PUT /api/auth/profile
     * Headers: Authorization: Bearer <token>
     * Body: { first_name?, last_name?, mobile?, address?, state?, pincode? }
     * Personal fields will be encrypted before updating
     * Response: Updated user data (decrypted)
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const sanitizedData = AuthValidation.sanitizeInput(req.body);

            // Allow updating personal fields (will be encrypted by repository)
            const allowedUpdates = ['first_name', 'last_name', 'mobile', 'address', 'state', 'pincode'];
            const updates = {};

            allowedUpdates.forEach(field => {
                if (sanitizedData[field] !== undefined) {
                    updates[field] = sanitizedData[field];
                }
            });

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: 'No valid fields to update'
                });
            }

            // Service will encrypt fields via repository before updating
            const result = await authService.updateUserProfile(userId, updates);

            if (result.Status === 'FAIL') {
                return res.status(404).json(result);
            }

            // Return decrypted data
            return res.status(200).json(result);

        } catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Change password (Protected route)
     * POST /api/auth/change-password
     * Headers: Authorization: Bearer <token>
     * Body: { oldPassword, newPassword }
     */
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;

            // Validate required fields
            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: 'Old password and new password are required'
                });
            }

            // Validate new password strength
            const passwordValidation = AuthValidation.validatePassword(newPassword);

            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: passwordValidation.message
                });
            }

            // Service will verify old password and hash new one
            const result = await authService.changePassword(userId, oldPassword, newPassword);

            if (result.Status === 'FAIL') {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Change password error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Verify JWT token
     * POST /api/auth/verify-token
     * Headers: Authorization: Bearer <token>
     */
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.TOKEN_MISSING
                });
            }

            const result = await authService.verifyToken(token);

            if (result.Status === 'FAIL') {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Verify token error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Refresh JWT token
     * POST /api/auth/refresh-token
     * Body: { refreshToken }
     */
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Message: 'Refresh token is required'
                });
            }

            const result = await authService.refreshToken(refreshToken);

            if (result.Status === 'FAIL') {
                return res.status(401).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }
}

module.exports = new AuthController();
