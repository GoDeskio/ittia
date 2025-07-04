"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
class User {
    static async findById(id) {
        const result = await db_1.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByEmail(email) {
        const result = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    static async findOne(query) {
        const result = await db_1.pool.query('SELECT * FROM users WHERE email = $1', [query.email]);
        return result.rows[0] || null;
    }
    static async create(userData) {
        const password_hash = await bcrypt_1.default.hash(userData.password, 10);
        const result = await db_1.pool.query('INSERT INTO users (name, email, password_hash, role, settings, storage_quota, storage_used, auth_methods, device_permissions, social_integrations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [
            userData.name,
            userData.email,
            password_hash,
            userData.role || 'user',
            { libraryPath: null },
            { library: 1073741824, cache: 1073741824 },
            { library: 0, cache: 0 },
            {
                password: true,
                pinCode: false,
                fingerprint: false,
                google: false,
                facebook: false,
                linkedin: false,
                instagram: false
            },
            {
                microphone: false,
                camera: false,
                location: false,
                notifications: false
            },
            {}
        ]);
        return result.rows[0];
    }
    static async update(id, updates) {
        const setClause = Object.keys(updates)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');
        const values = Object.values(updates);
        const result = await db_1.pool.query(`UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
        return result.rows[0] || null;
    }
    static async updateStorageUsage(id, storageType, size) {
        const column = `storage_used.${storageType}`;
        await db_1.pool.query(`UPDATE users SET storage_used = jsonb_set(storage_used, '{${storageType}}', to_jsonb(COALESCE((storage_used->>'${storageType}')::int + $1, 0)), true), updated_at = NOW() WHERE id = $2`, [size, id]);
    }
    static async updateStorageQuota(id, storageType, quota) {
        const column = `storage_quota.${storageType}`;
        await db_1.pool.query(`UPDATE users SET storage_quota = jsonb_set(storage_quota, '{${storageType}}', to_jsonb($1), true), updated_at = NOW() WHERE id = $2`, [quota, id]);
    }
    static async findAll() {
        const result = await db_1.pool.query('SELECT * FROM users');
        return result.rows;
    }
    static async comparePassword(user, candidatePassword) {
        return bcrypt_1.default.compare(candidatePassword, user.password);
    }
    static async findByIdAndUpdate(id, updates, options) {
        return this.update(id, updates);
    }
    static async findByIdAndDelete(id) {
        const result = await db_1.pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return result.rows[0] || null;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map