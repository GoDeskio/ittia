// This file sets up the Express application, configures middleware, connects to the database, and defines routes.

// Import necessary modules and configurations
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { configurePassport } from './config/passport';
import userRoutes from './routes/user';
import { adminRoutes } from './routes/admin';
import { audioRoutes } from './routes/audio';
import errorRoutes from './routes/error';
import elevenLabsRoutes from './routes/elevenlabs';
import { initializeGodModeUser } from './models/adminUser';
import path from 'path';
import { messageRoutes } from './routes/message';
import { postRoutes } from './routes/post';
import { Pool } from 'pg';
import { config } from './config';

// Create an Express application instance
const app = express();

// Initialize PostgreSQL connection pool using the database URL from config
const pool = new Pool({
  connectionString: config.databaseUrl
});

// Test the database connection and log the result
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Make the database pool available globally in the app
app.locals.db = pool;

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(passport.initialize()); // Initialize Passport for authentication

// Configure Passport strategies for authentication
configurePassport();

// Initialize the admin user if it doesn't exist
initializeGodModeUser().catch(console.error);

// Define API routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/elevenlabs', elevenLabsRoutes);
app.use('/api/error', errorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware to catch and log errors
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Export the configured Express app
export default app; 