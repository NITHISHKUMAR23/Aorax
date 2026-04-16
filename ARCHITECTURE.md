# Architecture Documentation

## Overview

This project follows **Clean Architecture** principles with a layered approach that ensures:
- Separation of concerns
- Testability
- Maintainability
- Scalability

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Routes (HTTP Layer)             │  Entry point for requests
├─────────────────────────────────────────┤
│         Middleware Layer                │  Authentication, Validation
├─────────────────────────────────────────┤
│         Controllers                     │  Request handling, Response formatting
├─────────────────────────────────────────┤
│         Validations                     │  Input validation, Sanitization
├─────────────────────────────────────────┤
│         Services (Business Logic)       │  Business rules, Decryption, Formatting
├─────────────────────────────────────────┤
│         Repositories (Data Access)      │  Direct SQL queries, Encryption
├─────────────────────────────────────────┤
│         Database (MySQL)                │  Data storage
└─────────────────────────────────────────┘

         Helpers (Utilities)
         ├── CryptoHelper (AES-256 Encryption)
         ├── PasswordHelper (Bcrypt Hashing)
         └── JwtHelper (JWT Token Management)
```

**Note**: This architecture **does not include a model/ORM layer**. Repositories execute direct SQL queries for maximum control and simplicity.

## Request Flow

### Example: User Registration

```
1. Client sends POST request to /api/auth/register
   ↓
2. Routes (authRoutes.js) → authController.register
   ↓
3. Controller validates input using AuthValidation
   ↓
4. Controller calls authService.registerUser
   ↓
5. Service checks if email exists via authRepository
   ↓
6. Service hashes password using PasswordHelper.hash (bcrypt)
   ↓
7. Service calls authRepository.createUser with plain text data
   ↓
8. Repository encrypts personal fields using CryptoHelper.encrypt (AES-256)
   - first_name → encrypted Buffer
   - last_name → encrypted Buffer
   - mobile → encrypted Buffer
   - address → encrypted Buffer
   - state → encrypted Buffer
   - pincode → encrypted Buffer
   ↓
9. Repository executes direct SQL INSERT query
   - email: plain text (for lookup)
   - password: bcrypt hash
   - personal fields: encrypted Buffer (VARBINARY)
   ↓
10. Repository returns user ID
   ↓
11. Service fetches raw user data (encrypted fields as Buffer)
   ↓
12. Service decrypts personal fields using CryptoHelper.decrypt
   ↓
13. Service formats response (snake_case → camelCase)
   ↓
14. Service generates JWT token using JwtHelper
   ↓
15. Controller sends formatted response to client
   ↓
16. Client receives JWT token + decrypted user data (camelCase)
```

## Data Security Implementation

### 1. Email (Plain Text)
- **Storage**: VARCHAR in database
- **Reason**: Used for lookup during login
- **Example**: `"user@example.com"`

### 2. Password (Bcrypt Hash)
- **Helper**: `PasswordHelper.js`
- **Algorithm**: bcrypt with 10 salt rounds
- **Storage**: VARCHAR(255) in database
- **Flow**: 
  - Registration: `plain password → bcrypt.hash() → store hash`
  - Login: `plain password + stored hash → bcrypt.compare() → boolean`
- **Example**: `"$2b$10$rQYN0YjYhZFj7qGLQqJysuF1Eo3P7HZVmO6Qqr3D.XjqvYqZqNzE6"`

### 3. Personal Fields (AES-256 Encryption)
- **Helper**: `CryptoHelper.js`
- **Algorithm**: AES-256-CBC
- **Fields**: `first_name`, `last_name`, `mobile`, `address`, `state`, `pincode`
- **Storage**: VARBINARY in database
- **Key**: 32-byte key from `ENCRYPTION_KEY` environment variable
- **Flow**:
  - **Encryption** (during create/update):
    ```
    Plain text → AES-256 encrypt → Buffer (16-byte IV + encrypted data) → VARBINARY in DB
    ```
  - **Decryption** (during read):
    ```
    VARBINARY from DB → Buffer → AES-256 decrypt → Plain text
    ```
- **Example**:
  - Plain: `"John"`
  - Encrypted: `<Buffer a3 7f 9e 2c ... >` (stored in VARBINARY column)
  - Decrypted: `"John"` (returned in response)

### 4. JWT Tokens
- **Helper**: `JwtHelper.js`
- **Algorithm**: HS256 (HMAC-SHA256)
- **Secret**: From `JWT_SECRET` environment variable
- **Payload**: `{ id, email, role }`
- **Expiration**: 1 day (configurable via `JWT_EXPIRES_IN`)
- **Usage**: Stateless authentication

## Layer Responsibilities

### 1. Routes Layer (`src/routes/`)
- Define API endpoints
- Map HTTP methods to controller functions
- Apply middleware (authentication, authorization)
- **No business logic**

### 2. Middleware Layer (`src/middleware/`)
- **Authentication**: Verify JWT tokens
- **Authorization**: Check user roles/permissions
- Attach decoded user to `req.user`
- **No business logic**

### 3. Controllers Layer (`src/controllers/`)
- Handle HTTP requests and responses
- Validate input (call validation layer)
- Call service layer methods
- Format responses
- Error handling (try/catch)
- **No business logic**
- **No database operations**

### 4. Validations Layer (`src/validations/`)
- Input validation (required fields, formats)
- Data sanitization (trim, normalize)
- Return validation errors
- **No database operations**

### 5. Services Layer (`src/services/`)
- **Business logic implementation**
- Orchestrate operations between multiple repositories
- Implement interface contracts (`iAuthService.js`)
- Password hashing via `PasswordHelper`
- JWT generation via `JwtHelper`
- **No database operations** (delegates to repositories)
- **No encryption** (delegates to repositories)

### 6. Repositories Layer (`src/repositories/`)
- **Direct database queries** (no model layer)
- Database CRUD operations via SQL
- **Encryption** of personal fields before writes
- Implement interface contracts (`iAuthRepository.js`)
- Return raw data (encrypted fields as Buffer)
- **No decryption** (handled by service)
- **No business logic**

### 7. Helpers Layer (`src/helpers/`)
- Utility functions
- **CryptoHelper**: AES-256 encryption/decryption
- **PasswordHelper**: Bcrypt hashing/comparison
- **JwtHelper**: JWT token generation/verification
- Reusable across all layers

## Interface-Based Design

### Why Interfaces?
- Define contracts for service and repository layers
- Enable easy mocking for testing
- Enforce consistent method signatures
- Support dependency injection

### Example: IAuthService
```javascript
class IAuthService {
    async loginUser(credentials) {
        throw new Error('Method loginUser() must be implemented');
    }
    // ... other method signatures
}
```

### Implementation: AuthService
```javascript
class AuthService extends IAuthService {
    async loginUser(credentials) {
        // Actual implementation
    }
}
```

## Error Handling

### Consistent Response Format

```javascript
// Success Response
{
  Status: "SUCCESS",
  Message: "Login successful",
  Data: {
    token: "...",
    user: { ... }
  }
}

// Failure Response (Client Error)
{
  Status: "FAIL",
  Message: "Invalid email or password",
  Errors: [
    { field: "email", message: "Email is required" }
  ]
}

// Error Response (Server Error)
{
  Status: "ERROR",
  Message: "Internal server error"
}
```

### Error Handling Pattern

```javascript
// Controller Level
async methodName(req, res) {
    try {
        // Validation
        // Call service
        // Return response
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            Status: 'ERROR',
            Message: 'Internal server error'
        });
    }
}
```

## Environment Variables

Required in `.env` file:

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aoraniti_db

# JWT (for authentication)
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d

# Encryption (32 characters for AES-256)
ENCRYPTION_KEY=AORAX_SECURE_ENCRYPTION_KEY_32
```

## Database Schema

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Plain text (for lookup)
    email VARCHAR(150) UNIQUE NOT NULL,
    
    -- Bcrypt hash
    password VARCHAR(255) NOT NULL,
    
    -- Encrypted fields (VARBINARY for Buffer storage)
    first_name VARBINARY(255) NOT NULL,
    last_name VARBINARY(255) NOT NULL,
    mobile VARBINARY(255),
    address VARBINARY(500),
    state VARBINARY(255),
    pincode VARBINARY(50),
    
    -- Metadata
    is_active BIT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);
```

## Security Best Practices

1. **Never log sensitive data** (passwords, encryption keys)
2. **Use environment variables** for secrets
3. **Validate all user input** before processing
4. **Use parameterized queries** to prevent SQL injection
5. **Hash passwords with bcrypt** (not reversible)
6. **Encrypt personal data with AES-256** (reversible for display)
7. **Use JWT for stateless authentication**
8. **Implement rate limiting** (future enhancement)
9. **Use HTTPS in production**
10. **Regularly update dependencies**

## Testing Strategy

### Unit Tests
- Test each layer independently
- Mock dependencies
- Test helpers (CryptoHelper, PasswordHelper, JwtHelper)

### Integration Tests
- Test API endpoints
- Test database operations
- Test encryption/decryption flow

### Security Tests
- Test authentication/authorization
- Test input validation
- Test SQL injection prevention
- Test encryption strength

## Future Enhancements

1. **Rate Limiting**: Prevent brute force attacks
2. **Email Verification**: Send verification email on registration
3. **Password Reset**: Forgot password functionality
4. **Refresh Tokens**: Store in database with expiration
5. **Audit Logging**: Track user actions
6. **Role-Based Access Control**: Fine-grained permissions
7. **Two-Factor Authentication**: Additional security layer
8. **API Documentation**: Swagger/OpenAPI integration
9. **Caching**: Redis for session management
10. **Monitoring**: Application performance monitoring

## Best Practices Followed

✅ Clean Architecture with clear layer separation  
✅ Interface-based design for testability  
✅ Consistent response format  
✅ Comprehensive error handling  
✅ Input validation and sanitization  
✅ Secure password hashing with bcrypt  
✅ AES-256 encryption for sensitive data  
✅ JWT-based stateless authentication  
✅ Environment-based configuration  
✅ Detailed code comments  
✅ Singleton pattern for services/repositories  
✅ Async/await for asynchronous operations  
✅ No business logic in controllers  
✅ No database operations in services  
✅ Separation of encryption logic in repository layer  

## Conclusion

This architecture ensures:
- **Maintainability**: Easy to modify and extend
- **Testability**: Each layer can be tested independently
- **Security**: Multiple layers of data protection
- **Scalability**: Can handle growing complexity
- **Readability**: Clear structure with comprehensive comments
- **Production-Ready**: Follows industry best practices
