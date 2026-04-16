# Aoraniti - Task Management API

A robust task management API built with Node.js, Express, and MySQL following clean architecture principles.

## Project Structure

```
task-management-api/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js                 # Database connection configuration
│   │
│   ├── routes/
│   │   └── authRoutes.js         # Authentication route definitions
│   │
│   ├── controllers/
│   │   └── authController.js     # Request handling and response formatting
│   │
│   ├── services/
│   │   ├── interfaces/
│   │   │   └── iAuthService.js   # Service interface contract
│   │   └── authService.js        # Business logic + decryption + formatting
│   │
│   ├── repositories/
│   │   ├── interfaces/
│   │   │   └── iAuthRepository.js # Repository interface contract
│   │   └── authRepository.js     # Direct database queries + encryption
│   │
│   ├── helpers/
│   │   ├── cryptoHelper.js       # AES-256 encryption utilities
│   │   ├── passwordHelper.js     # Bcrypt password hashing
│   │   └── jwtHelper.js          # JWT token management
│   │
│   ├── middleware/
│   │   └── authMiddleware.js     # Authentication and authorization middleware
│   │
│   ├── validations/
│   │   └── authValidation.js     # Input validation and sanitization
│   │
│   ├── constants/
│   │   └── messages.js           # Application-wide message constants
│   │
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
│
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

**Note**: This architecture **does not use a model layer**. Repositories handle direct database queries.

## Features

- User registration and authentication
- JWT-based authorization
- Password hashing with bcrypt
- Input validation and sanitization
- Clean architecture with interface-based design
- Centralized error handling
- Database connection pooling
- Role-based access control

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Aorax
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aoraniti_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

# Admin (for initial seed)
ADMIN_EMAIL=admin@aoraniti.com
ADMIN_PASSWORD=admin123
```

4. Create the database and tables:
```sql
CREATE DATABASE aoraniti_db;

USE aoraniti_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_is_active ON users(is_active);
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "status": "SUCCESS",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    }
  }
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

#### Change Password (Protected)
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

#### Verify Token
```http
POST /api/auth/verify-token
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

## Architecture Layers

### 1. Routes Layer
- Defines API endpoints
- Maps HTTP requests to controller methods
- Applies middleware for authentication/validation

### 2. Controllers Layer
- Handles HTTP requests and responses
- Validates input data
- Calls service layer methods
- Formats responses

### 3. Services Layer
- Contains business logic
- **Handles data decryption and formatting**
- Coordinates between repositories
- Implements interface contracts
- Independent of HTTP layer

### 4. Repositories Layer
- **Direct database queries (no model layer)**
- Handles data encryption before writes
- Returns raw database data
- Abstracts database complexity

### 5. Helpers Layer
- Utility functions
- Password hashing (Bcrypt)
- JWT token management
- Encryption/decryption (AES-256)

### 6. Middleware Layer
- Authentication verification
- Authorization checks
- Request preprocessing

### 7. Validations Layer
- Input validation
- Data sanitization
- Business rule validation

**Note**: This architecture **intentionally omits a model/ORM layer** for simplicity and direct database control.

## Error Handling

The API uses standardized response formats:

Success Response:
```json
{
  "status": "SUCCESS",
  "message": "Operation successful",
  "data": {}
}
```

Error Response:
```json
{
  "status": "FAIL",
  "message": "Error message",
  "errors": []
}
```

Server Error Response:
```json
{
  "status": "ERROR",
  "message": "Internal server error"
}
```

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- CORS enabled
- Environment variable configuration

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript conventions with:
- Class-based architecture
- Interface-driven design
- Singleton pattern for services and repositories
- Proper error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

Aoraniti Team
