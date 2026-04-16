const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * Base path: /api/auth
 * 
 * Response Format:
 * {
 *   Status: "SUCCESS" | "FAIL" | "ERROR",
 *   Message: "...",
 *   Data: { ... }
 * }
 */

// Public Routes (no authentication required)

/**
 * POST /api/auth/login
 * Login with email and password
 * Body: { email, password }
 * Returns: JWT token + decrypted user data
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/register
 * Register new user
 * Body: { email, password, confirmPassword, first_name, last_name, mobile?, address?, state?, pincode? }
 * Personal fields (first_name, last_name, mobile, address, state, pincode) are encrypted before storing
 * Password is hashed with bcrypt
 * Email stored as plain text for lookup
 * Returns: JWT token + decrypted user data
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/verify-token
 * Verify if JWT token is valid
 * Headers: Authorization: Bearer <token>
 * Returns: Decoded token data if valid
 */
router.post('/verify-token', authController.verifyToken);

/**
 * POST /api/auth/refresh-token
 * Get new access token using refresh token
 * Body: { refreshToken }
 * Returns: New access token and refresh token
 */
router.post('/refresh-token', authController.refreshToken);

// Protected Routes (authentication required)

/**
 * GET /api/auth/profile
 * Get current user profile with decrypted personal data
 * Headers: Authorization: Bearer <token>
 * Returns: User profile with decrypted fields
 */
router.get('/profile', AuthMiddleware.authenticate, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Headers: Authorization: Bearer <token>
 * Body: { first_name?, last_name?, mobile?, address?, state?, pincode? }
 * Fields will be encrypted before updating
 * Returns: Updated user profile with decrypted fields
 */
router.put('/profile', AuthMiddleware.authenticate, authController.updateProfile);

/**
 * POST /api/auth/change-password
 * Change user password
 * Headers: Authorization: Bearer <token>
 * Body: { oldPassword, newPassword }
 * New password will be hashed with bcrypt
 * Returns: Success message
 */
router.post('/change-password', AuthMiddleware.authenticate, authController.changePassword);

module.exports = router;
