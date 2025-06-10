import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type MessageRetentionPeriod = '1h' | '6h' | '24h' | '7d' | '30d';

export interface IUserStyle {
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  tableColor: string;
  commentBoxColor: string;
}

export interface IBannerImage {
  url: string;
  width: number;
  height: number;
  position: {
    x: number;
    y: number;
    scale: number;
  };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'god';
  profilePicture?: string;
  bannerImage?: IBannerImage;
  title?: string;
  bio?: string;
  publicKey: string;
  privateKey: string;
  messageRetentionPeriod: MessageRetentionPeriod;
  stylePreferences: IUserStyle;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const BannerImageSchema = new Schema<IBannerImage>({
  url: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  position: {
    x: { type: Number, default: 50 }, // center position percentage
    y: { type: Number, default: 50 }, // center position percentage
    scale: { type: Number, default: 1 },
  },
});

const UserStyleSchema = new Schema<IUserStyle>({
  primaryColor: { type: String, default: '#1976d2' },
  secondaryColor: { type: String, default: '#dc004e' },
  buttonColor: { type: String, default: '#1976d2' },
  tableColor: { type: String, default: '#ffffff' },
  commentBoxColor: { type: String, default: '#f5f5f5' },
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'god'],
    default: 'user'
  },
  profilePicture: {
    type: String
  },
  bannerImage: {
    type: BannerImageSchema
  },
  title: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  publicKey: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  messageRetentionPeriod: {
    type: String,
    enum: ['1h', '6h', '24h', '7d', '30d'],
    default: '7d'
  },
  stylePreferences: {
    type: UserStyleSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema); 