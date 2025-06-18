import { pool } from '../db';
import bcrypt from 'bcrypt';
import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  role: string;
  settings: {
    libraryPath?: string;
  };
  storageQuota: {
    library: number;
    cache: number;
  };
  storageUsed: {
    library: number;
    cache: number;
  };
  authMethods: {
    password: boolean;
    pinCode: boolean;
    fingerprint: boolean;
    google: boolean;
    facebook: boolean;
    linkedin: boolean;
    instagram: boolean;
  };
  preferredAuthMethod: string;
  pinCode?: string;
  fingerPrintHash?: string;
  apiToken?: string;
  privateKey?: string;
  publicKey?: string;
  messageRetentionPeriod: number;
  socialIntegrations: {
    [key: string]: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
    };
  };
  devicePermissions: {
    microphone: boolean;
    camera: boolean;
    location: boolean;
    notifications: boolean;
  };
  stylePreferences?: {
    theme: string;
    fontSize: number;
    colorScheme: string;
  };
  bannerImage?: string;
  created_at: Date;
  updated_at: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  save(): Promise<IUser>;
}

export class User {
  static async findById(id: string): Promise<IUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findOne(query: any): Promise<IUser | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [query.email]);
    return result.rows[0] || null;
  }

  static async create(userData: { name: string; email: string; password: string; role?: string }): Promise<IUser> {
    const password_hash = await bcrypt.hash(userData.password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, settings, storage_quota, storage_used, auth_methods, device_permissions, social_integrations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [
        userData.name,
        userData.email,
        password_hash,
        userData.role || 'user',
        { libraryPath: null },
        { library: 1073741824, cache: 1073741824 }, // 1GB default quota
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
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = Object.values(updates);
    const result = await pool.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  static async updateStorageUsage(id: string, storageType: 'cache' | 'library', size: number): Promise<void> {
    const column = `storage_used.${storageType}`;
    await pool.query(
      `UPDATE users SET storage_used = jsonb_set(storage_used, '{${storageType}}', to_jsonb(COALESCE((storage_used->>'${storageType}')::int + $1, 0)), true), updated_at = NOW() WHERE id = $2`,
      [size, id]
    );
  }

  static async updateStorageQuota(id: string, storageType: 'cache' | 'library', quota: number): Promise<void> {
    const column = `storage_quota.${storageType}`;
    await pool.query(
      `UPDATE users SET storage_quota = jsonb_set(storage_quota, '{${storageType}}', to_jsonb($1), true), updated_at = NOW() WHERE id = $2`,
      [quota, id]
    );
  }

  static async findAll(): Promise<IUser[]> {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }

  static async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  }

  static async findByIdAndUpdate(id: string, updates: Partial<IUser>, options?: any): Promise<IUser | null> {
    return this.update(id, updates);
  }

  static async findByIdAndDelete(id: string): Promise<IUser | null> {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}