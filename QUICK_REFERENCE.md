# Quick Reference Card

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure .env file
# (Update DB credentials and secrets)

# 3. Create database and run migrations
mysql -u root -p < database/schema/002_create_users_table.sql

# 4. Start server
npm run dev

# 5. Test API
curl http://localhost:5000/
```

## 📋 Common Commands

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Test database connection
curl http://localhost:5000/test-db
```

## 🔑 Environment Variables (.env)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aoraniti_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
ENCRYPTION_KEY=AORAX_SECURE_ENCRYPTION_KEY_32
```

## 🌐 API Endpoints

### Register
```bash
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "mobile": "1234567890",
  "address": "123 Main St",
  "state": "California",
  "pincode": "90210"
}
```

### Login
```bash
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Get Profile (Protected)
```bash
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### Update Profile (Protected)
```bash
PUT /api/auth/profile
Headers: Authorization: Bearer <token>
Body: {
  "first_name": "Jane",
  "mobile": "9876543210"
}
```

### Change Password (Protected)
```bash
POST /api/auth/change-password
Headers: Authorization: Bearer <token>
Body: {
  "oldPassword": "SecurePass123!",
  "newPassword": "NewPass456!"
}
```

## 🔐 Security Summary

| Field | Security Method | Storage Format | Can Retrieve? |
|-------|----------------|----------------|---------------|
| email | Plain text | VARCHAR | ✅ Yes |
| password | Bcrypt hash | VARCHAR | ❌ No |
| first_name | AES-256 encrypt | VARBINARY | ✅ Yes |
| last_name | AES-256 encrypt | VARBINARY | ✅ Yes |
| mobile | AES-256 encrypt | VARBINARY | ✅ Yes |
| address | AES-256 encrypt | VARBINARY | ✅ Yes |
| state | AES-256 encrypt | VARBINARY | ✅ Yes |
| pincode | AES-256 encrypt | VARBINARY | ✅ Yes |

## 📊 Response Format

### Success
```json
{
  "Status": "SUCCESS",
  "Message": "...",
  "Data": { ... }
}
```

### Fail (Client Error)
```json
{
  "Status": "FAIL",
  "Message": "...",
  "Errors": [...]
}
```

### Error (Server Error)
```json
{
  "Status": "ERROR",
  "Message": "Internal server error"
}
```

## 🎯 HTTP Status Codes

| Code | Status | When Used |
|------|--------|-----------|
| 200 | OK | Successful GET, PUT, POST |
| 201 | Created | Successful registration |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid credentials/token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Error | Server error |

## 🏗️ Architecture Flow

```
Request
  ↓
Route → Middleware → Controller
  ↓                      ↓
Validation ← ← ← ← ← ← ←
  ↓
Service (Decrypt + Format)
  ↓
Repository (Direct SQL + Encrypt)
  ↓
Database
```

**Note**: No model layer - repositories query database directly

## 🔧 Helper Functions

### CryptoHelper
```javascript
CryptoHelper.encrypt(text)           // Returns Buffer
CryptoHelper.decrypt(buffer)         // Returns string
CryptoHelper.encryptFields(obj, arr) // Encrypt multiple fields
CryptoHelper.decryptFields(obj, arr) // Decrypt multiple fields
```

### PasswordHelper
```javascript
await PasswordHelper.hash(password)              // Hash password
await PasswordHelper.compare(plain, hash)        // Verify password
PasswordHelper.validateStrength(password)        // Check strength
```

### JwtHelper
```javascript
JwtHelper.generateAccessToken(user)   // Create access token
JwtHelper.generateRefreshToken(user)  // Create refresh token
JwtHelper.verify(token)                // Verify token
JwtHelper.decode(token)                // Decode without verify
```

## 🗂️ Project Structure

```
src/
├── config/         Database connection
├── routes/         API endpoints
├── middleware/     Authentication
├── controllers/    Request handlers
├── validations/    Input validation
├── services/       Business logic + decryption + formatting
├── repositories/   Direct SQL queries + encryption
├── helpers/        Utilities (crypto, password, JWT)
└── constants/      Message constants
```

**Note**: No models folder - repositories handle SQL directly

## 🧪 Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","confirmPassword":"Test123!","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get Profile (replace TOKEN)
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment configuration |
| `README.md` | Project overview |
| `SETUP.md` | Setup instructions |
| `ARCHITECTURE.md` | Design documentation |
| `API_TESTING_GUIDE.md` | API testing guide |
| `PROJECT_SUMMARY.md` | Project summary |
| `Aoraniti_API.postman_collection.json` | Postman tests |

## 🐛 Common Issues

### "Database connection failed"
- Check MySQL is running
- Verify `.env` credentials
- Ensure database exists

### "ENCRYPTION_KEY is not defined"
- Add `ENCRYPTION_KEY` to `.env`
- Must be exactly 32 characters

### "Invalid token"
- Check `JWT_SECRET` in `.env`
- Token format: `Bearer <token>`
- Token may have expired

### "Decryption failed"
- `ENCRYPTION_KEY` may have changed
- Existing data cannot be decrypted with new key
- Re-register users if key changed

## 💡 Tips

1. **Always use HTTPS in production**
2. **Keep secrets in `.env`, never commit**
3. **Regularly update dependencies**
4. **Use strong encryption keys (32+ chars)**
5. **Monitor JWT token expiration**
6. **Test encryption by checking database**
7. **Use Postman for faster testing**
8. **Read comments in code for details**

## 📞 Need Help?

1. **Setup Issues** → Read `SETUP.md`
2. **API Testing** → Read `API_TESTING_GUIDE.md`
3. **Architecture** → Read `ARCHITECTURE.md`
4. **Code Details** → Check inline comments

---

**Quick Links:**
- Main Docs: `README.md`
- Setup Guide: `SETUP.md`
- Architecture: `ARCHITECTURE.md`
- Testing: `API_TESTING_GUIDE.md`
- Summary: `PROJECT_SUMMARY.md`
