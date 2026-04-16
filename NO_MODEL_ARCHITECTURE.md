# No-Model Architecture Guide

**Architecture Type**: Clean Architecture Without Model Layer  
**Last Updated**: April 16, 2026  
**Status**: ✅ PRODUCTION READY

---

## Overview

This project follows **clean architecture principles** but **deliberately omits the model/ORM layer** for simplicity and direct database control.

### Why No Models?

1. **Simplicity**: One less abstraction layer
2. **Performance**: Direct SQL queries, no ORM overhead
3. **Control**: Full query optimization capabilities
4. **Clarity**: Clear data flow through layers
5. **Flexibility**: Easy to write complex queries

---

## Architecture

### 4-Layer Structure

```
┌──────────────────────────────┐
│  Controllers                 │  ← HTTP handling
├──────────────────────────────┤
│  Services                    │  ← Business logic + Decryption + Formatting
├──────────────────────────────┤
│  Repositories                │  ← Direct SQL + Encryption
├──────────────────────────────┤
│  Database                    │  ← MySQL
└──────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Does NOT Do |
|-------|---------------|-------------|
| **Controller** | HTTP requests/responses | Business logic, DB queries |
| **Service** | Business logic, Decrypt, Format | DB queries, HTTP handling |
| **Repository** | SQL queries, Encrypt | Decrypt, Business logic |
| **Database** | Store data | N/A |

---

## Data Flow

### Write Operation (Registration)

```javascript
// 1. Controller receives request
{
  email: "john@example.com",
  password: "SecurePass123!",
  firstName: "John"  // camelCase from client
}

// 2. Controller validates and calls service
service.registerUser(userData)

// 3. Service converts camelCase → snake_case and hashes password
{
  email: "john@example.com",
  password: "$2b$10$...",  // Bcrypt hash
  first_name: "John"       // snake_case
}

// 4. Service calls repository
repository.createUser(userData)

// 5. Repository encrypts personal fields
{
  email: "john@example.com",           // Plain text
  password: "$2b$10$...",               // Bcrypt hash
  first_name: <Buffer a3 7f 9e...>     // AES-256 encrypted
}

// 6. Repository executes SQL INSERT
INSERT INTO users (email, password, first_name) VALUES (?, ?, ?)

// 7. Database stores data
email: "john@example.com"      VARCHAR
password: "$2b$10$..."         VARCHAR
first_name: <Buffer a3...>     VARBINARY

// 8. Repository returns user ID
userId: 1

// 9. Service fetches raw user
SELECT * FROM users WHERE id = 1
{
  id: 1,
  email: "john@example.com",
  password: "$2b$10$...",
  first_name: <Buffer a3 7f 9e...>  // Still encrypted
}

// 10. Service decrypts fields
{
  id: 1,
  email: "john@example.com",
  first_name: "John"  // Decrypted!
}

// 11. Service formats response (snake_case → camelCase)
{
  id: 1,
  email: "john@example.com",
  firstName: "John"  // camelCase
}

// 12. Controller sends JSON response
```

### Read Operation (Get Profile)

```javascript
// 1. Service calls repository
const rawUser = await repository.getUserById(userId);

// Repository returns raw data from SQL
{
  id: 1,
  email: "john@example.com",
  first_name: <Buffer a3 7f 9e...>,  // Encrypted Buffer
  last_name: <Buffer b2 8c 1a...>    // Encrypted Buffer
}

// 2. Service decrypts fields
const decryptedUser = service.decryptUserFields(rawUser);
{
  id: 1,
  email: "john@example.com",
  first_name: "John",  // Decrypted string
  last_name: "Doe"     // Decrypted string
}

// 3. Service formats response
const response = service.formatUserResponse(decryptedUser);
{
  id: 1,
  email: "john@example.com",
  firstName: "John",  // camelCase
  lastName: "Doe"     // camelCase
}

// 4. Controller returns response
```

---

## Code Examples

### Repository (Direct SQL)

```javascript
class AuthRepository {
    async getUserByEmail(email) {
        // Direct SQL query - no model
        const query = `SELECT * FROM users WHERE email = ? AND is_active = 1`;
        const [rows] = await db.promise().query(query, [email]);
        return rows[0] || null;  // Returns raw data with encrypted Buffers
    }

    async createUser(userData) {
        // Encrypt personal fields
        const encryptedData = this.encryptPersonalFields(userData);
        
        // Direct SQL INSERT
        const query = `
            INSERT INTO users (email, password, first_name, last_name) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(query, [
            encryptedData.email,
            encryptedData.password,
            encryptedData.first_name,  // Encrypted Buffer
            encryptedData.last_name    // Encrypted Buffer
        ]);
        return result.insertId;
    }

    encryptPersonalFields(userData) {
        const result = { ...userData };
        ['first_name', 'last_name', 'mobile', 'address', 'state', 'pincode']
            .forEach(field => {
                if (userData[field]) {
                    result[field] = CryptoHelper.encrypt(userData[field]);
                }
            });
        return result;
    }
}
```

### Service (Business Logic + Decryption)

```javascript
class AuthService {
    async registerUser(userData) {
        // Check email exists
        const emailExists = await authRepository.checkEmailExists(userData.email);
        if (emailExists) {
            return { Status: 'FAIL', Message: 'Email already exists' };
        }

        // Hash password
        const hashedPassword = await PasswordHelper.hash(userData.password);

        // Create user (repository will encrypt)
        const userId = await authRepository.createUser({
            email: userData.email,
            password: hashedPassword,
            first_name: userData.first_name,  // Plain text
            last_name: userData.last_name
        });

        // Fetch raw user (encrypted fields)
        const rawUser = await authRepository.getUserById(userId);

        // Decrypt fields
        const decryptedUser = this.decryptUserFields(rawUser);

        // Generate JWT
        const token = JwtHelper.generateAccessToken(decryptedUser);

        // Format response (camelCase)
        return {
            Status: 'SUCCESS',
            Data: {
                token,
                user: this.formatUserResponse(decryptedUser)
            }
        };
    }

    decryptUserFields(rawUser) {
        const decrypted = { ...rawUser };
        ['first_name', 'last_name', 'mobile', 'address', 'state', 'pincode']
            .forEach(field => {
                if (rawUser[field] && Buffer.isBuffer(rawUser[field])) {
                    decrypted[field] = CryptoHelper.decrypt(rawUser[field]);
                }
            });
        return decrypted;
    }

    formatUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.first_name,    // snake_case → camelCase
            lastName: user.last_name,
            mobile: user.mobile,
            address: user.address,
            state: user.state,
            pincode: user.pincode
        };
    }
}
```

### Controller (HTTP Handling)

```javascript
class AuthController {
    async register(req, res) {
        try {
            // Validate input
            const validation = AuthValidation.validateRegisterInput(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    Status: 'FAIL',
                    Errors: validation.errors
                });
            }

            // Call service
            const result = await authService.registerUser(req.body);

            // Return response
            return res.status(result.Status === 'SUCCESS' ? 201 : 400).json(result);
        } catch (error) {
            return res.status(500).json({
                Status: 'ERROR',
                Message: 'Internal server error'
            });
        }
    }
}
```

---

## Key Principles

### 1. Repository Returns Raw Data

❌ **Don't**: Decrypt in repository
```javascript
async getUserById(id) {
    const user = await db.query(...);
    return this.decryptFields(user);  // DON'T DO THIS
}
```

✅ **Do**: Return raw data
```javascript
async getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await db.promise().query(query, [id]);
    return rows[0];  // Raw data with encrypted Buffers
}
```

### 2. Service Handles Decryption

❌ **Don't**: Use encrypted data directly
```javascript
async loginUser(credentials) {
    const user = await repository.getUserByEmail(email);
    return { firstName: user.first_name };  // Still a Buffer!
}
```

✅ **Do**: Decrypt in service
```javascript
async loginUser(credentials) {
    const rawUser = await repository.getUserByEmail(email);
    const decrypted = this.decryptUserFields(rawUser);
    return { firstName: decrypted.first_name };  // String
}
```

### 3. Service Formats Response

❌ **Don't**: Return database field names
```javascript
return {
    user: {
        first_name: user.first_name,  // snake_case
        last_name: user.last_name
    }
};
```

✅ **Do**: Format to camelCase
```javascript
return {
    user: this.formatUserResponse(user)  // camelCase
};
```

---

## Security Implementation

### Encryption Points

| Operation | Layer | Method | Result |
|-----------|-------|--------|--------|
| **Encrypt** | Repository | `encryptPersonalFields()` | Plain → Buffer |
| **Store** | Database | SQL INSERT/UPDATE | Buffer → VARBINARY |
| **Retrieve** | Database | SQL SELECT | VARBINARY → Buffer |
| **Decrypt** | Service | `decryptUserFields()` | Buffer → Plain |
| **Format** | Service | `formatUserResponse()` | snake_case → camelCase |

### Example Flow

```javascript
// Plain text input
firstName: "John"

// ↓ Repository encrypts
first_name: <Buffer a3 7f 9e 2c ...>

// ↓ Database stores
VARBINARY column: 0xa37f9e2c...

// ↓ Database retrieves  
first_name: <Buffer a3 7f 9e 2c ...>

// ↓ Service decrypts
first_name: "John"

// ↓ Service formats
firstName: "John"

// ↓ API response
{ "firstName": "John" }
```

---

## Benefits

### ✅ Advantages

1. **Simpler Code**
   - Fewer files to maintain
   - Less abstraction
   - Clearer data flow

2. **Better Performance**
   - No ORM overhead
   - Direct SQL execution
   - Optimized queries

3. **More Control**
   - Write any SQL query
   - Use database-specific features
   - Full query optimization

4. **Easier Debugging**
   - See exact SQL queries
   - No hidden ORM magic
   - Clear error messages

5. **Flexible**
   - Easy to add complex queries
   - No ORM limitations
   - Direct database access

### 🎯 What We Maintain

- ✅ Clean architecture
- ✅ Separation of concerns
- ✅ AES-256 encryption
- ✅ Bcrypt password hashing
- ✅ JWT authentication
- ✅ Input validation
- ✅ Error handling

---

## Testing

### Unit Tests

**Repository Tests** (Mock database):
```javascript
test('createUser encrypts fields', async () => {
    const mockDb = jest.fn().mockResolvedValue([{ insertId: 1 }]);
    const userData = { first_name: 'John' };
    
    await repository.createUser(userData);
    
    // Verify encrypted Buffer was passed to query
    expect(mockDb.mock.calls[0][1][2]).toBeInstanceOf(Buffer);
});
```

**Service Tests** (Mock repository):
```javascript
test('registerUser decrypts and formats', async () => {
    const mockRawUser = {
        id: 1,
        first_name: Buffer.from('encrypted')
    };
    authRepository.getUserById = jest.fn().mockResolvedValue(mockRawUser);
    
    const result = await authService.registerUser({...});
    
    expect(result.Data.user.firstName).toBe('John');  // Decrypted & camelCase
});
```

---

## Best Practices

### DO ✅

1. **Repository**: Execute SQL, encrypt before write
2. **Service**: Decrypt after read, format responses
3. **Controller**: Handle HTTP, validate input
4. **Always**: Use prepared statements (prevent SQL injection)
5. **Always**: Encrypt personal data before database write
6. **Always**: Decrypt in service, never in repository

### DON'T ❌

1. **Don't**: Put business logic in repository
2. **Don't**: Put SQL queries in service
3. **Don't**: Decrypt data in repository
4. **Don't**: Return snake_case to client (use camelCase)
5. **Don't**: Use string concatenation for SQL (use parameters)

---

## Migration from Model-Based Architecture

If you previously had models, here's how to migrate:

### Before (With Models)
```javascript
// Repository
async getUserById(id) {
    return await UserModel.findById(id);
}

// Model
static async findById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await db.promise().query(query, [id]);
    return rows[0];
}
```

### After (No Models)
```javascript
// Repository only
async getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [rows] = await db.promise().query(query, [id]);
    return rows[0];
}
```

**Steps:**
1. Move SQL queries from Model to Repository
2. Delete models folder
3. Update repository imports (remove model imports)
4. Move decryption from repository to service
5. Test thoroughly

---

## Common Patterns

### Pattern 1: Create Entity

```javascript
// Service
async create(data) {
    // 1. Validate
    // 2. Hash/encrypt sensitive data
    const hashedPassword = await PasswordHelper.hash(data.password);
    
    // 3. Repository creates (encrypts personal fields)
    const id = await repository.create({ ...data, password: hashedPassword });
    
    // 4. Fetch raw data
    const rawEntity = await repository.getById(id);
    
    // 5. Decrypt
    const decrypted = this.decrypt(rawEntity);
    
    // 6. Format and return
    return this.format(decrypted);
}
```

### Pattern 2: Update Entity

```javascript
// Service
async update(id, data) {
    // 1. Validate
    // 2. Repository updates (encrypts if needed)
    const updated = await repository.update(id, data);
    
    // 3. Fetch raw data
    const rawEntity = await repository.getById(id);
    
    // 4. Decrypt and format
    return this.format(this.decrypt(rawEntity));
}
```

### Pattern 3: Fetch Entity

```javascript
// Service
async getById(id) {
    // 1. Repository fetches raw data
    const rawEntity = await repository.getById(id);
    if (!rawEntity) return null;
    
    // 2. Decrypt
    const decrypted = this.decrypt(rawEntity);
    
    // 3. Format and return
    return this.format(decrypted);
}
```

---

## Summary

### Architecture

- ✅ 4 layers: Controller → Service → Repository → Database
- ✅ No model/ORM layer
- ✅ Direct SQL queries in repository
- ✅ Encryption in repository
- ✅ Decryption in service
- ✅ Formatting in service

### Key Points

1. **Repositories** execute SQL and encrypt
2. **Services** decrypt and format
3. **Controllers** handle HTTP only
4. **Helpers** provide utilities
5. **No models** needed

### Result

A **simpler, faster, and more maintainable** architecture with full control over database operations!

---

**Status**: ✅ Production Ready  
**Performance**: ⚡ Optimized  
**Complexity**: 📉 Simplified  

---

*End of No-Model Architecture Guide*
