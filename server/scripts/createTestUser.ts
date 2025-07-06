import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user';
import { generateVerificationToken, sendVerificationEmail } from '../src/services/emailService';
import jwt from 'jsonwebtoken';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicevault');
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@godesk.io' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Generate API token
    const apiToken = jwt.sign(
      { email: 'admin@godesk.io' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1y' }
    );

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();

    // Create user
    const user = new User({
      email: 'admin@godesk.io',
      password: 'K24a4_rb26',
      name: 'Test Admin',
      apiToken,
      emailVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      marketingConsent: true
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.name, emailVerificationToken);

    console.log('Test user created successfully');
    console.log('Email:', user.email);
    console.log('API Token:', apiToken);

    // Add to marketing list (mock implementation)
    console.log('Added to marketing list:', {
      name: user.name,
      email: user.email,
      dateAdded: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser(); 