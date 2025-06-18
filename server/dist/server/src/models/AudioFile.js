"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioFile = void 0;
const db_1 = require("../db");
class AudioFile {
    static async findById(id) {
        const result = await db_1.pool.query('SELECT * FROM audio_files WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByUserId(userId) {
        const result = await db_1.pool.query('SELECT * FROM audio_files WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return result.rows;
    }
    static async create(audioData) {
        const result = await db_1.pool.query('INSERT INTO audio_files (user_id, filename, path, size, duration, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [
            audioData.user_id,
            audioData.filename,
            audioData.path,
            audioData.size,
            audioData.duration,
            audioData.metadata || {}
        ]);
        return result.rows[0];
    }
    static async delete(id) {
        await db_1.pool.query('DELETE FROM audio_files WHERE id = $1', [id]);
    }
    static async updateMetadata(id, metadata) {
        const result = await db_1.pool.query('UPDATE audio_files SET metadata = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [metadata, id]);
        return result.rows[0] || null;
    }
    static async getTotalSize(userId) {
        const result = await db_1.pool.query('SELECT COALESCE(SUM(size), 0) as total_size FROM audio_files WHERE user_id = $1', [userId]);
        return parseInt(result.rows[0].total_size);
    }
    static async findAll() {
        const result = await db_1.pool.query('SELECT * FROM audio_files ORDER BY created_at DESC');
        return result.rows;
    }
}
exports.AudioFile = AudioFile;
//# sourceMappingURL=AudioFile.js.map