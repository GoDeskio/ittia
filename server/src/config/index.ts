import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/voicevault?directConnection=true',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  environment: process.env.NODE_ENV || 'development'
}; 