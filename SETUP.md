# Setup Guide for Aoraniti Task Management API

## Quick Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a MySQL database:

```sql
CREATE DATABASE aoraniti_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Update Environment Variables

Copy and update the `.env` file with your database credentials:

```env
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=aoraniti_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d

# Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@aoraniti.com
ADMIN_PASSWORD=admin123
```

### 4. Run Database Schema

Execute the SQL files in the `database/schema/` directory:

```bash
# Connect to MySQL
mysql -u root -p

# Run schema files
USE aoraniti_db;
SOURCE database/schema/001_create_tables.sql;
SOURCE database/schema/002_create_users_table.sql;
```

Or use a MySQL client (MySQL Workbench, phpMyAdmin, etc.) to run the SQL files.

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 6. Test the API

Visit `http://localhost:5000/` - you should see:
```json
{
  "status": "success",
  "message": "Aoraniti Task Management API is running!",
  "version": "1.0.0"
}
```

Test database connection: `http://localhost:5000/test-db`

### 7. Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `Aoraniti_API.postman_collection.json`
4. Update the `baseUrl` variable if needed (default: `http://localhost:5000`)

### 8. Test Authentication

Using Postman or curl:

#### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Save the token from the response!

#### Get Profile (Protected Route):
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Database Connection Issues

If you see "Database connection failed":

1. Check if MySQL is running
2. Verify credentials in `.env`
3. Ensure database `aoraniti_db` exists
4. Check if user has proper permissions

```sql
GRANT ALL PRIVILEGES ON aoraniti_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Port Already in Use

If port 5000 is already in use:

1. Change `PORT` in `.env` file
2. Update Postman collection `baseUrl` variable
3. Restart the server

### JWT Token Issues

If you get "Invalid token" errors:

1. Check if `JWT_SECRET` is set in `.env`
2. Verify token is being sent in Authorization header
3. Format: `Bearer <token>`

### Password Hashing for Admin User

If the admin login doesn't work, generate a new password hash:

```javascript
const bcrypt = require('bcrypt');
const password = 'admin123';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

Then update the admin user in the database with the new hash.

## Architecture Overview

```
Client Request
    ↓
Routes (authRoutes.js)
    ↓
Middleware (authMiddleware.js)
    ↓
Controller (authController.js)
    ↓
Validation (authValidation.js)
    ↓
Service (authService.js)
    ↓
Repository (authRepository.js)
    ↓
Model (userModel.js)
    ↓
Database
```

## Next Steps

1. Implement additional features (tasks, projects, etc.)
2. Add more middleware (rate limiting, logging)
3. Implement refresh token functionality
4. Add email verification
5. Implement password reset
6. Add unit tests
7. Set up CI/CD pipeline
8. Deploy to production

## Support

For issues or questions, please contact the development team or create an issue in the repository.
