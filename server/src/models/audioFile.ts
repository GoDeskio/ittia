import { pool } from '../db';

export interface IAudioFile {
  id: string;
  user_id: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

export class AudioFile {
  static async findById(id: string): Promise<IAudioFile | null> {
    const result = await pool.query('SELECT * FROM audio_files WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<IAudioFile[]> {
    const result = await pool.query('SELECT * FROM audio_files WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  static async create(audioData: {
    user_id: string;
    filename: string;
    path: string;
    size: number;
    duration: number;
    metadata?: any;
  }): Promise<IAudioFile> {
    const result = await pool.query(
      'INSERT INTO audio_files (user_id, filename, path, size, duration, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        audioData.user_id,
        audioData.filename,
        audioData.path,
        audioData.size,
        audioData.duration,
        audioData.metadata || {}
      ]
    );
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM audio_files WHERE id = $1', [id]);
  }

  static async updateMetadata(id: string, metadata: any): Promise<IAudioFile | null> {
    const result = await pool.query(
      'UPDATE audio_files SET metadata = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [metadata, id]
    );
    return result.rows[0] || null;
  }

  static async getTotalSize(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COALESCE(SUM(size), 0) as total_size FROM audio_files WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].total_size);
  }

  static async findAll(): Promise<IAudioFile[]> {
    const result = await pool.query('SELECT * FROM audio_files ORDER BY created_at DESC');
    return result.rows;
  }
} 