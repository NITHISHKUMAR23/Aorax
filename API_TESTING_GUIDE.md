# API Testing Guide

## Quick Start

### 1. Start the Server

```bash
npm run dev
```

Server should start on `http://localhost:5000`

### 2. Test Basic Endpoints

```bash
# Health check
curl http://localhost:5000/

# Database connection test
curl http://localhost:5000/test-db
```

## Authentication API Tests

### 1. Register New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "1234567890",
    "address": "123 Main St, Apt 4B",
    "state": "California",
    "pincode": "90210"
  }'
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Message": "Registration successful",
  "Data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "mobile": "1234567890",
      "address": "123 Main St, Apt 4B",
      "state": "California",
      "pincode": "90210"
    }
  }
}
```

**Note**: Personal fields (first_name, last_name, mobile, address, state, pincode) are:
- Encrypted with AES-256 before storing in database
- Stored as VARBINARY in database
- Decrypted when returned in response

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Message": "Login successful",
  "Data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "mobile": "1234567890",
      "address": "123 Main St, Apt 4B",
      "state": "California",
      "pincode": "90210"
    }
  }
}
```

**Save the token from the response for protected endpoints!**

### 3. Get Profile (Protected)

```bash
# Replace YOUR_TOKEN_HERE with actual token from login/register
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Data": {
    "id": 1,
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "1234567890",
    "address": "123 Main St, Apt 4B",
    "state": "California",
    "pincode": "90210",
    "created_at": "2026-04-16T10:30:00.000Z"
  }
}
```

### 4. Update Profile (Protected)

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "mobile": "9876543210",
    "address": "456 Oak Avenue",
    "state": "New York",
    "pincode": "10001"
  }'
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Message": "Resource updated successfully",
  "Data": {
    "id": 1,
    "email": "john.doe@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "mobile": "9876543210",
    "address": "456 Oak Avenue",
    "state": "New York",
    "pincode": "10001"
  }
}
```

### 5. Change Password (Protected)

```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Message": "Password changed successfully"
}
```

### 6. Verify Token

```bash
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "user",
    "iat": 1713264600,
    "exp": 1713351000
  }
}
```

### 7. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Expected Response:**
```json
{
  "Status": "SUCCESS",
  "Data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Error Scenarios

### 1. Registration with Existing Email

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Response (400):**
```json
{
  "Status": "FAIL",
  "Message": "User with this email already exists"
}
```

### 2. Login with Invalid Credentials

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword123!"
  }'
```

**Expected Response (401):**
```json
{
  "Status": "FAIL",
  "Message": "Invalid email or password"
}
```

### 3. Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (400):**
```json
{
  "Status": "FAIL",
  "Message": "Bad request",
  "Errors": [
    { "field": "first_name", "message": "First name is required" },
    { "field": "last_name", "message": "Last name is required" }
  ]
}
```

### 4. Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123!"
  }'
```

**Expected Response (400):**
```json
{
  "Status": "FAIL",
  "Message": "Bad request",
  "Errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### 5. Weak Password

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "confirmPassword": "123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected Response (400):**
```json
{
  "Status": "FAIL",
  "Message": "Bad request",
  "Errors": [
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### 6. Access Protected Route without Token

```bash
curl -X GET http://localhost:5000/api/auth/profile
```

**Expected Response (401):**
```json
{
  "Status": "FAIL",
  "Message": "Token is missing"
}
```

### 7. Access with Invalid Token

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (401):**
```json
{
  "Status": "FAIL",
  "Message": "Invalid token"
}
```

### 8. Access with Expired Token

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer expired_token_here"
```

**Expected Response (401):**
```json
{
  "Status": "FAIL",
  "Message": "Token has expired"
}
```

## Verification of Encryption

### Check Database Directly

Connect to MySQL and run:

```sql
USE aoraniti_db;

-- View raw data in database
SELECT 
    id,
    email,
    -- Password should be bcrypt hash
    password,
    -- Personal fields should be VARBINARY (not readable)
    HEX(first_name) as first_name_hex,
    HEX(last_name) as last_name_hex,
    HEX(mobile) as mobile_hex,
    created_at
FROM users
WHERE email = 'john.doe@example.com';
```

**What you should see:**
- `email`: Plain text (e.g., "john.doe@example.com")
- `password`: Bcrypt hash (e.g., "$2b$10$rQYN0YjYhZFj...")
- `first_name_hex`: Hex representation of encrypted binary (e.g., "A37F9E2C...")
- `last_name_hex`: Hex representation of encrypted binary
- **You cannot read the actual names from the database!**

### Verify Encryption Flow

1. **Register a user** with first_name = "TestName"
2. **Check database** - see encrypted binary data
3. **Get profile** via API - see "TestName" (decrypted)
4. **Verify**: API returns decrypted data, but database stores encrypted

## Using Postman

1. Import `Aoraniti_API.postman_collection.json`
2. Set `baseUrl` variable to `http://localhost:5000`
3. Run "Register" request - token is auto-saved
4. Run other protected requests - token is automatically included

## Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | SUCCESS | Request successful |
| 201 | SUCCESS | Resource created |
| 400 | FAIL | Bad request / Validation error |
| 401 | FAIL | Unauthorized / Invalid credentials |
| 403 | FAIL | Forbidden / Insufficient permissions |
| 404 | FAIL | Resource not found |
| 500 | ERROR | Internal server error |

## Security Testing Checklist

- [x] Password is hashed with bcrypt (not plain text)
- [x] Personal fields are encrypted with AES-256
- [x] Email is stored as plain text for lookup
- [x] JWT tokens expire after configured time
- [x] Invalid tokens are rejected
- [x] Missing tokens are rejected
- [x] Input validation prevents invalid data
- [x] SQL injection prevention via parameterized queries
- [x] Consistent error messages (no sensitive info leak)
- [x] Protected routes require authentication

## Performance Testing

```bash
# Install Apache Bench (if not installed)
# Ubuntu: sudo apt-get install apache2-utils
# Mac: already included

# Test login endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -p login.json -T application/json http://localhost:5000/api/auth/login

# Create login.json file:
echo '{"email":"john.doe@example.com","password":"SecurePass123!"}' > login.json
```

## Troubleshooting

### Issue: "Database connection failed"
**Solution**: 
1. Check if MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists: `CREATE DATABASE aoraniti_db;`

### Issue: "ENCRYPTION_KEY is not defined"
**Solution**: Add `ENCRYPTION_KEY` to `.env` file (32 characters)

### Issue: "Invalid token"
**Solution**: 
1. Check if JWT_SECRET is set in `.env`
2. Ensure token is sent as `Bearer <token>`
3. Token may have expired - login again

### Issue: "Decryption failed"
**Solution**: 
1. Ensure ENCRYPTION_KEY hasn't changed
2. If key changed, existing encrypted data cannot be decrypted
3. May need to re-register users

## Next Steps

1. Test all endpoints systematically
2. Verify data encryption in database
3. Test error scenarios
4. Run performance tests
5. Set up automated testing
6. Deploy to staging environment
