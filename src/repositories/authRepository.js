const IAuthRepository = require('./interfaces/iAuthRepository');
const db = require('../config/db');
const CryptoHelper = require('../helpers/cryptoHelper');

/**
 * AuthRepository - Data access layer for authentication
 * Handles direct database queries and data encryption
 * No model layer - queries database directly
 * Encrypted fields: first_name, last_name, mobile, address, state, pincode
 */
class AuthRepository extends IAuthRepository {
    constructor() {
        super();
        this.tableName = 'users';
    }

    /**
     * Get user by email (returns raw data with encrypted fields as Buffer)
     * @param {string} email - User email (stored as plain text)
     * @returns {Object|null} - Raw user object from database
     */
    async getUserByEmail(email) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE email = ? AND is_active = 1`;
            const [rows] = await db.promise().query(query, [email]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in getUserByEmail:', error);
            throw error;
        }
    }

    /**
     * Get user by ID (returns raw data with encrypted fields as Buffer)
     * @param {number} id - User ID
     * @returns {Object|null} - Raw user object from database
     */
    async getUserById(id) {
        try {
            const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const [rows] = await db.promise().query(query, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in getUserById:', error);
            throw error;
        }
    }

    /**
     * Create new user (encrypts personal fields before storing)
     * @param {Object} userData - User data with plain text fields
     * @returns {number} - Inserted user ID
     */
    async createUser(userData) {
        try {
            // Encrypt personal fields before storing
            const encryptedData = this.encryptPersonalFields(userData);

            // Build dynamic query based on provided fields
            const fields = ['email', 'password', 'first_name', 'last_name'];
            const placeholders = ['?', '?', '?', '?'];
            const values = [
                encryptedData.email,
                encryptedData.password,
                encryptedData.first_name, // Encrypted Buffer
                encryptedData.last_name   // Encrypted Buffer
            ];

            // Add optional encrypted fields
            if (encryptedData.mobile !== undefined) {
                fields.push('mobile');
                placeholders.push('?');
                values.push(encryptedData.mobile);
            }
            if (encryptedData.address !== undefined) {
                fields.push('address');
                placeholders.push('?');
                values.push(encryptedData.address);
            }
            if (encryptedData.state !== undefined) {
                fields.push('state');
                placeholders.push('?');
                values.push(encryptedData.state);
            }
            if (encryptedData.pincode !== undefined) {
                fields.push('pincode');
                placeholders.push('?');
                values.push(encryptedData.pincode);
            }

            // Add metadata fields
            fields.push('is_active', 'created_at');
            placeholders.push('?', 'NOW()');
            values.push(encryptedData.is_active !== undefined ? encryptedData.is_active : 1);

            const query = `
                INSERT INTO ${this.tableName} 
                (${fields.join(', ')}) 
                VALUES (${placeholders.join(', ')})
            `;

            const [result] = await db.promise().query(query, values);
            return result.insertId;
        } catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    }

    /**
     * Update user (encrypts personal fields if provided)
     * @param {number} id - User ID
     * @param {Object} userData - User data to update
     * @returns {boolean} - Success status
     */
    async updateUser(id, userData) {
        try {
            // Encrypt personal fields if they're being updated
            const encryptedData = this.encryptPersonalFields(userData);

            const fields = [];
            const values = [];

            // Handle all possible fields including encrypted ones
            Object.keys(encryptedData).forEach(key => {
                if (encryptedData[key] !== undefined && key !== 'id' && key !== 'created_at') {
                    fields.push(`${key} = ?`);
                    values.push(encryptedData[key]);
                }
            });

            if (fields.length === 0) return false;

            fields.push('updated_at = NOW()');
            values.push(id);

            const query = `UPDATE ${this.tableName} SET ${fields.join(', ')} WHERE id = ?`;
            const [result] = await db.promise().query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in updateUser:', error);
            throw error;
        }
    }

    /**
     * Soft delete user
     * @param {number} id - User ID
     * @returns {boolean} - Success status
     */
    async deleteUser(id) {
        try {
            const query = `UPDATE ${this.tableName} SET is_active = 0, updated_at = NOW() WHERE id = ?`;
            const [result] = await db.promise().query(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in deleteUser:', error);
            throw error;
        }
    }

    /**
     * Get all users (returns raw data with encrypted fields)
     * @param {Object} filters - Optional filters
     * @returns {Array} - Array of raw user objects
     */
    async getAllUsers(filters = {}) {
        try {
            let query = `SELECT * FROM ${this.tableName} WHERE is_active = 1`;
            const values = [];

            query += ' ORDER BY created_at DESC';

            const [rows] = await db.promise().query(query, values);
            return rows;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
    }

    /**
     * Check if email already exists
     * @param {string} email - Email to check
     * @returns {boolean} - True if exists
     */
    async checkEmailExists(email) {
        try {
            const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ?`;
            const [rows] = await db.promise().query(query, [email]);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error in checkEmailExists:', error);
            throw error;
        }
    }

    /**
     * Encrypt personal fields only
     * @param {Object} userData - User data with plain text
     * @returns {Object} - User data with encrypted fields as Buffer
     * @private
     */
    encryptPersonalFields(userData) {
        const encryptedFields = ['first_name', 'last_name', 'mobile', 'address', 'state', 'pincode'];
        const result = { ...userData };

        encryptedFields.forEach(field => {
            if (userData[field] !== undefined && userData[field] !== null) {
                result[field] = CryptoHelper.encrypt(userData[field]);
            }
        });

        return result;
    }
}

module.exports = new AuthRepository();
