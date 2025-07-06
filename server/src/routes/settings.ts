import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { generateApiToken } from '../utils/tokenGenerator';
import { pool } from '../db';

const router = express.Router();

// Get storage path settings
router.get('/storage-path', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      libraryPath: user.settings?.libraryPath || ''
    });
  } catch (error) {
    console.error('Error fetching storage path settings:', error);
    res.status(500).json({ error: 'Error fetching storage path settings' });
  }
});

// Update storage path settings
router.post('/storage-path', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { libraryPath } = req.body;

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {};
    }

    // Update the library path
    user.settings.libraryPath = libraryPath;
    await user.save();

    res.json({
      message: 'Storage path settings updated successfully',
      libraryPath: user.settings.libraryPath
    });
  } catch (error) {
    console.error('Error updating storage path settings:', error);
    res.status(500).json({ error: 'Error updating storage path settings' });
  }
});

// Get user's API token and QR code
router.get('/api-token', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

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

      // Generate new token if none exists or if it's too short (less than 100 characters)
      if (!apiToken || apiToken.length < 100) {
        apiToken = generateApiToken();
        
        // Update user's API token in database
        await client.query(
          'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [apiToken, req.user.id]
        );
      }

      // Create QR code data for voice library access
      const qrData = {
        type: 'voicevault_library_access',
        version: '2.0',
        userId: req.user.id,
        userName: userName,
        userEmail: user.email,
        apiToken: apiToken,
        accessUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/profile/${req.user.id}`,
        timestamp: new Date().toISOString(),
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      };

      // Generate QR code using online service
      const qrDataString = encodeURIComponent(JSON.stringify(qrData));
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${qrDataString}&color=1976d2&bgcolor=ffffff&ecc=H&margin=2`;

      // Get basic stats
      const audioFilesResult = await client.query(
        'SELECT COUNT(*) as file_count FROM audio_files WHERE user_id = $1',
        [req.user.id]
      );

      const fileCount = parseInt(audioFilesResult.rows[0]?.file_count || '0');

      res.json({
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
    res.status(500).json({ error: 'Error fetching API token' });
  }
});

// Regenerate API token
router.post('/api-token/regenerate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Generate new API token
    const newToken = generateApiToken();

    const client = await pool.connect();
    try {
      // Update user's API token in database
      await client.query(
        'UPDATE users SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newToken, req.user.id]
      );

      // Get user info for QR code
      const userResult = await client.query(
        'SELECT first_name, last_name, email FROM users WHERE id = $1',
        [req.user.id]
      );

      const user = userResult.rows[0];
      const userName = user.first_name && user.last_name ? 
        `${user.first_name} ${user.last_name}` : 
        user.email.split('@')[0];

      // Create new QR code
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

      res.json({
        apiToken: newToken,
        qrCode,
        tokenLength: newToken.length,
        message: 'API token regenerated successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error regenerating API token:', error);
    res.status(500).json({ error: 'Error regenerating API token' });
  }
});

// Validate API token (for external access)
router.get('/validate-token/:token', async (req, res) => {
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

      // Get user's audio files count
      const audioFilesResult = await client.query(
        'SELECT COUNT(*) as file_count FROM audio_files WHERE user_id = $1',
        [user.id]
      );

      const fileCount = parseInt(audioFilesResult.rows[0]?.file_count || '0');

      res.json({
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
    res.status(500).json({ error: 'Error validating token' });
  }
});

export default router; 