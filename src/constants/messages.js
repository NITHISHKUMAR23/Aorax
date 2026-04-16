const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Login successful',
        LOGIN_FAILED: 'Invalid email or password',
        REGISTER_SUCCESS: 'Registration successful',
        REGISTER_FAILED: 'Registration failed',
        LOGOUT_SUCCESS: 'Logout successful',
        UNAUTHORIZED: 'Unauthorized access',
        TOKEN_EXPIRED: 'Token has expired',
        TOKEN_INVALID: 'Invalid token',
        TOKEN_MISSING: 'Token is missing',
        USER_ALREADY_EXISTS: 'User with this email already exists',
        USER_NOT_FOUND: 'User not found',
        PASSWORD_WEAK: 'Password does not meet strength requirements',
        EMAIL_INVALID: 'Invalid email format',
        CREDENTIALS_REQUIRED: 'Email and password are required'
    },
    
    VALIDATION: {
        REQUIRED_FIELD: 'This field is required',
        INVALID_FORMAT: 'Invalid format',
        INVALID_EMAIL: 'Invalid email format',
        INVALID_PASSWORD: 'Password must be at least 8 characters',
        PASSWORDS_NOT_MATCH: 'Passwords do not match'
    },

    ERROR: {
        INTERNAL_SERVER: 'Internal server error',
        DATABASE_ERROR: 'Database operation failed',
        SOMETHING_WENT_WRONG: 'Something went wrong',
        BAD_REQUEST: 'Bad request',
        NOT_FOUND: 'Resource not found',
        FORBIDDEN: 'Access forbidden'
    },

    SUCCESS: {
        OPERATION_SUCCESS: 'Operation completed successfully',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully'
    }
};

module.exports = MESSAGES;
