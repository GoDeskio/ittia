"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const db_1 = require("../db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User {
    static async findById(id) {
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            return result.rows[0] || null;
        }
        finally {
            client.release();
        }
    }
    static async findByEmail(email) {
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0] || null;
        }
        finally {
            client.release();
        }
    }
    static async findOne(criteria) {
        const client = await db_1.pool.connect();
        try {
            if (criteria.email) {
                const result = await client.query('SELECT * FROM users WHERE email = $1', [criteria.email]);
                return result.rows[0] || null;
            }
            return null;
        }
        finally {
            client.release();
        }
    }
    static async findByApiToken(token) {
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE api_token = $1', [token]);
            return result.rows[0] || null;
        }
        finally {
            client.release();
        }
    }
    static async create(userData) {
        const client = await db_1.pool.connect();
        try {
            const salt = await bcryptjs_1.default.genSalt(10);
            const password_hash = await bcryptjs_1.default.hash(userData.password, salt);
            const result = await client.query(`INSERT INTO users (first_name, last_name, email, phone, password_hash, api_token, is_admin, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`, [
                userData.first_name,
                userData.last_name,
                userData.email,
                userData.phone,
                password_hash,
                userData.api_token,
                userData.is_admin || false
            ]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    }
    static async updateApiToken(id, apiToken) {
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [apiToken, id]);
            return result.rows[0] || null;
        }
        finally {
            client.release();
        }
    }
    static async validatePassword(user, password) {
        return bcryptjs_1.default.compare(password, user.password_hash);
    }
    static async updatePassword(id, newPassword) {
        const client = await db_1.pool.connect();
        try {
            const salt = await bcryptjs_1.default.genSalt(10);
            const password_hash = await bcryptjs_1.default.hash(newPassword, salt);
            const result = await client.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [password_hash, id]);
            return result.rows[0] || null;
        }
        finally {
            client.release();
        }
    }
    static async getAll() {
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows;
        }
        finally {
            client.release();
        }
    }
    static async delete(id) {
        const client = await db_1.pool.connect();
        try {
            const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
            return result.rowCount > 0;
        }
        finally {
            client.release();
        }
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map