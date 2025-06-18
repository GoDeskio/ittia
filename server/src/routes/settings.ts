import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { User } from '../models/User';

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

export default router; 