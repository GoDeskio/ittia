import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import { configurePassport } from './config/passport';
import { userRoutes } from './routes/user';
import { adminRoutes } from './routes/admin';
import { audioRoutes } from './routes/audio';
import errorRoutes from './routes/error';
import { initializeGodModeUser } from './models/adminUser';
import path from 'path';
import { messageRoutes } from './routes/message';
import { postRoutes } from './routes/post';

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicevault')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Configure passport strategies
configurePassport();

// Initialize admin user if not exists
initializeGodModeUser().catch(console.error);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/error', errorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app; 