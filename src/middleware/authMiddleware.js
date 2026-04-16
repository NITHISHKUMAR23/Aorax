const JwtHelper = require('../helpers/jwtHelper');
const MESSAGES = require('../constants/messages');

/**
 * AuthMiddleware - Authentication and Authorization middleware
 * Verifies JWT tokens and protects routes
 */
class AuthMiddleware {
    /**
     * Authenticate middleware
     * Verifies JWT token from Authorization header
     * Adds decoded user data to req.user
     * Usage: router.get('/profile', AuthMiddleware.authenticate, controller.getProfile)
     */
    static authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;

            // Check if Authorization header exists and has Bearer format
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.TOKEN_MISSING
                });
            }

            // Extract token (remove "Bearer " prefix)
            const token = authHeader.substring(7);

            // Verify JWT token
            const verification = JwtHelper.verify(token);

            if (!verification.valid) {
                return res.status(401).json({
                    Status: 'FAIL',
                    Message: verification.error === 'jwt expired' 
                        ? MESSAGES.AUTH.TOKEN_EXPIRED 
                        : MESSAGES.AUTH.TOKEN_INVALID
                });
            }

            // Attach decoded user info to request object
            // Contains: { id, email, role }
            req.user = verification.decoded;
            next();

        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                Status: 'ERROR',
                Message: MESSAGES.ERROR.INTERNAL_SERVER
            });
        }
    }

    /**
     * Authorization middleware
     * Checks if user has required role
     * Must be used after authenticate middleware
     * Usage: router.delete('/user/:id', AuthMiddleware.authenticate, AuthMiddleware.authorize('admin'), controller.deleteUser)
     */
    static authorize(...allowedRoles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    Status: 'FAIL',
                    Message: MESSAGES.AUTH.UNAUTHORIZED
                });
            }

            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    Status: 'FAIL',
                    Message: MESSAGES.ERROR.FORBIDDEN
                });
            }

            next();
        };
    }

    /**
     * Optional authentication middleware
     * Sets req.user if valid token exists, otherwise sets to null
     * Does not block request if token is missing or invalid
     * Usage: router.get('/public-resource', AuthMiddleware.optionalAuth, controller.getResource)
     */
    static optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                req.user = null;
                return next();
            }

            const token = authHeader.substring(7);
            const verification = JwtHelper.verify(token);

            if (verification.valid) {
                req.user = verification.decoded;
            } else {
                req.user = null;
            }

            next();

        } catch (error) {
            req.user = null;
            next();
        }
    }
}

module.exports = AuthMiddleware;
