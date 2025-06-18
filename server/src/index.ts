// This file is the main entry point for the server application.
// It initializes the Express server, sets up middleware, connects to the database, and starts the server.

// Import necessary modules and configurations
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import { initializeBackupCron } from './cron/backupCron';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { emotionRoutes } from './routes/emotion';
import { audioRoutes } from './routes/audio';
import { initializeDatabase, testConnection } from './db';
import fileUpload from 'express-fileupload';
import voiceRoutes from './routes/voice';
import assistantRoutes from './routes/assistant';

// Load environment variables from .env file
dotenv.config();

// Function to initialize the database and start the server
async function startServer() {
  try {
    // Initialize the database schema
    await initializeDatabase();
    
    // Test the database connection to ensure it's working
    await testConnection();

    // Start the server on the specified port (default: 3000)
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Call the startServer function to begin the server
startServer(); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/assistant', assistantRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 