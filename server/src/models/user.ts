import { pool } from '../db';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password_hash: string;
  api_token?: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export type MessageRetentionPeriod = '1week' | '1month' | '3months' | '6months' | '1year' | 'forever';

export class User {
  static async findById(id: number): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async findOne(criteria: any): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      if (criteria.email) {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [criteria.email]);
        return result.rows[0] || null;
      }
      return null;
    } finally {
      client.release();
    }
  }

  static async findByApiToken(token: string): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE api_token = $1', [token]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async create(userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    api_token?: string;
    is_admin?: boolean;
  }): Promise<IUser> {
    const client = await pool.connect();
    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(userData.password, salt);

      const result = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, api_token, is_admin, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.phone,
          password_hash,
          userData.api_token,
          userData.is_admin || false
        ]
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async updateApiToken(id: number, apiToken: string): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [apiToken, id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async validatePassword(user: IUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static async updatePassword(id: number, newPassword: string): Promise<IUser | null> {
    const client = await pool.connect();
    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);

      const result = await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [password_hash, id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async getAll(): Promise<IUser[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }
}