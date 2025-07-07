import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import { generateApiToken } from './utils/tokenGenerator';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple auth middleware for testing
const authenticateToken = (req: any, _res: any, next: any) => {
  // For testing purposes, we'll use a simple user ID
  req.user = { id: 1 }; // Admin user
  next();
};

// API Token endpoints
app.get('/api/settings/api-token', authenticateToken, async (req: any, res) => {
  try {
    const client = await pool.connect();
    try {
      // Get user's current API token
      const userResult = await client.query(
        'SELECT api_token, first_name, last_name, email FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      let apiToken = userResult.rows[0].api_token;
      const user = userResult.rows[0];
      const userName = user.first_name && user.last_name ? 
        `${user.first_name} ${user.last_name}` : 
        user.email.split('@')[0];

      // Generate new token if none exists or if it's too short
      if (!apiToken || apiToken.length < 100) {
        apiToken = generateApiToken();
        
        await client.query(
          'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [apiToken, req.user.id]
        );
      }

      // Create QR code data
      const qrData = {
        type: 'voicevault_library_access',
        version: '2.0',
        userId: req.user.id,
        userName: userName,
        userEmail: user.email,
        apiToken: apiToken,
        accessUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Generate QR code URL
      const qrDataString = encodeURIComponent(JSON.stringify(qrData));
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataString}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;

      // Get basic stats
      const audioFilesResult = await client.query(
        'SELECT COUNT(*) as file_count FROM audio_files WHERE user_id = $1',
        [req.user.id]
      );

      const fileCount = parseInt(audioFilesResult.rows[0]?.file_count || '0');

      return res.json({
        apiToken,
        qrCode,
        tokenLength: apiToken.length,
        userName,
        userEmail: user.email,
        publicUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
        stats: {
          audioFiles: fileCount
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching API token:', error);
    return res.status(500).json({ error: 'Error fetching API token' });
  }
});

// Regenerate API token
app.post('/api/settings/api-token/regenerate', authenticateToken, async (req: any, res) => {
  try {
    const newToken = generateApiToken();

    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newToken, req.user.id]
      );

      const userResult = await client.query(
        'SELECT first_name, last_name, email FROM users WHERE id = $1',
        [req.user.id]
      );

      const user = userResult.rows[0];
      const userName = user.first_name && user.last_name ? 
        `${user.first_name} ${user.last_name}` : 
        user.email.split('@')[0];

      const qrData = {
        type: 'voicevault_library_access',
        version: '2.0',
        userId: req.user.id,
        userName: userName,
        userEmail: user.email,
        apiToken: newToken,
        accessUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const qrDataString = encodeURIComponent(JSON.stringify(qrData));
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataString}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;

      return res.json({
        apiToken: newToken,
        qrCode,
        tokenLength: newToken.length,
        message: 'API token regenerated successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error regenerating token:', error);
    return res.status(500).json({ error: 'Error regenerating token' });
  }
});

// Validate API token
app.get('/api/settings/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, first_name, last_name, email FROM users WHERE api_token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid API token' });
      }

      const user = result.rows[0];
      const userName = user.first_name && user.last_name ? 
        `${user.first_name} ${user.last_name}` : 
        user.email.split('@')[0];

      const audioFilesResult = await client.query(
        'SELECT COUNT(*) as file_count FROM audio_files WHERE user_id = $1',
        [user.id]
      );

      const fileCount = parseInt(audioFilesResult.rows[0]?.file_count || '0');

      return res.json({
        valid: true,
        user: {
          id: user.id,
          name: userName,
          email: user.email
        },
        stats: {
          audioFiles: fileCount
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return res.status(500).json({ error: 'Error validating token' });
  }
});

// Basic authentication endpoints for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For testing purposes, accept any email/password combination
    // In a real app, you would verify against the database
    const mockUser = {
      id: 1,
      _id: '1',
      name: 'Test User',
      username: 'testuser',
      email: email,
      role: 'user',
      token: 'mock-jwt-token',
      messageRetentionPeriod: '7d',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      token: 'mock-jwt-token',
      user: mockUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    // For testing purposes, accept any registration
    const mockUser = {
      id: 2,
      _id: '2',
      name: username,
      username: username,
      email: email,
      role: 'user',
      token: 'mock-jwt-token-register',
      messageRetentionPeriod: '7d',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      token: 'mock-jwt-token-register',
      user: mockUser,
      apiToken: 'mock-api-token-' + Date.now()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  // For testing purposes, return a mock user
  const mockUser = {
    id: 1,
    _id: '1',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    token: 'mock-jwt-token',
    messageRetentionPeriod: '7d',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json(mockUser);
});

// Version check endpoint for update notifications
app.get('/api/version/check', (req, res) => {
  const { currentVersion, platform } = req.query;
  
  // Mock version response for testing
  const mockVersionInfo = {
    version: '1.0.1',
    releaseDate: new Date().toISOString(),
    releaseNotes: [
      'Bug fixes and performance improvements',
      'Enhanced security features',
      'UI/UX improvements'
    ],
    critical: false,
    platform: platform || 'web'
  };

  // For testing, always return no update available
  res.json(mockVersionInfo);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API Token Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Token Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Token endpoint: http://localhost:${PORT}/api/settings/api-token`);
});

export default app;