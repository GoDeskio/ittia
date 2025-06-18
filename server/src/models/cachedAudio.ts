import { pool } from '../db';

export interface ICachedAudio {
  id: string;
  user_id: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  url: string;
  api_token: string;
  processed: boolean;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export class CachedAudio {
  static async findById(id: string): Promise<ICachedAudio | null> {
    const result = await pool.query('SELECT * FROM cached_audio WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, processed: boolean): Promise<ICachedAudio[]> {
    const result = await pool.query(
      'SELECT * FROM cached_audio WHERE user_id = $1 AND processed = $2 ORDER BY created_at DESC',
      [userId, processed]
    );
    return result.rows;
  }

  static async create(audioData: {
    user_id: string;
    filename: string;
    path: string;
    size: number;
    duration: number;
    url: string;
    api_token: string;
    metadata?: any;
  }): Promise<ICachedAudio> {
    const result = await pool.query(
      'INSERT INTO cached_audio (user_id, filename, path, size, duration, url, api_token, processed, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        audioData.user_id,
        audioData.filename,
        audioData.path,
        audioData.size,
        audioData.duration,
        audioData.url,
        audioData.api_token,
        false,
        audioData.metadata || {}
      ]
    );
    return result.rows[0];
  }

  static async markAsProcessed(id: string): Promise<ICachedAudio | null> {
    const result = await pool.query(
      'UPDATE cached_audio SET processed = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM cached_audio WHERE id = $1', [id]);
  }

  static async getTotalSize(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_size FROM cached_audio WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].total_size);
  }

  static async cleanupOldFiles(daysOld: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    await pool.query(
      'DELETE FROM cached_audio WHERE processed = true AND created_at < $1',
      [cutoffDate]
    );
  }

  static async findAll(): Promise<ICachedAudio[]> {
    const result = await pool.query('SELECT * FROM cached_audio ORDER BY created_at DESC');
    return result.rows;
  }
} 