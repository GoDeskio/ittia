import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface AdminUser extends Document {
  username: string;
  password: string;
  role: 'god' | 'admin';
  lastLogin: Date;
  loginHistory: Array<{
    timestamp: Date;
    ip: string;
    userAgent: string;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminUserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['god', 'admin'],
    required: true,
  },
  lastLogin: {
    type: Date,
  },
  loginHistory: [{
    timestamp: Date,
    ip: String,
    userAgent: String,
  }],
}, {
  timestamps: true,
});

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
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
adminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const AdminUser = mongoose.model<AdminUser>('AdminUser', adminUserSchema);

// Create initial god mode user if it doesn't exist
export async function initializeGodModeUser() {
  try {
    const existingGodUser = await AdminUser.findOne({ role: 'god' });
    if (!existingGodUser) {
      await AdminUser.create({
        username: 'GodMode',
        password: 'K24a4_(@)_rb26',
        role: 'god',
      });
      console.log('God mode user created successfully');
    }
  } catch (error) {
    console.error('Error creating god mode user:', error);
  }
} 