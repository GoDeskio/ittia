import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { User } from '../models/User';
import passport from 'passport';
import { isAdmin } from '../middleware/adminAuth';
import { AdminUser } from '../models/adminUser';
import { CachedAudio } from '../models/cachedAudio';
import { AudioFile } from '../models/audioFile';
import { authenticateAdmin, requireGodMode } from '../middleware/adminAuth';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';
import archiver from 'archiver';
import { authenticateUser } from '../middleware/auth';
import { UploadSettings } from '../models/UploadSettings';
import { AuthenticatedRequest } from '../types/express/AuthenticatedRequest';

export const adminRoutes = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AdminAuthRequest extends express.Request {
  admin?: {
    id: string;
    username: string;
    role: 'god' | 'admin';
  };
}

// Admin login
adminRoutes.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password } = req.body;
    const admin = await AdminUser.findOne({ username });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update login history
    admin.lastLogin = new Date();
    admin.loginHistory.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });
    await admin.save();

    // Generate token
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: admin.role });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// Get system statistics
adminRoutes.get('/stats', authenticateAdmin, requireGodMode, async (req: AdminAuthRequest, res: express.Response) => {
  try {
    const [
      totalUsers,
      totalCachedFiles,
      totalLibraryFiles,
      totalStorage,
      activeUsers,
    ] = await Promise.all([
      User.countDocuments(),
      CachedAudio.countDocuments(),
      AudioFile.countDocuments(),
      calculateTotalStorage(),
      getActiveUsers(),
    ]);

    res.json({
      totalUsers,
      totalCachedFiles,
      totalLibraryFiles,
      totalStorage,
      activeUsers,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Get all users with their storage usage
adminRoutes.get('/users', authenticateAdmin, requireGodMode, async (req: AdminAuthRequest, res: express.Response) => {
  try {
    const users = await User.find().select('-password');
    const userStats = await Promise.all(
      users.map(async (user) => {
        const [cachedFiles, libraryFiles] = await Promise.all([
          CachedAudio.find({ userId: user._id }),
          AudioFile.find({ userId: user._id }),
        ]);

        return {
          ...user.toJSON(),
          cachedFilesCount: cachedFiles.length,
          libraryFilesCount: libraryFiles.length,
          totalCachedSize: cachedFiles.reduce((acc, file) => acc + file.size, 0),
          totalLibrarySize: libraryFiles.reduce((acc, file) => acc + file.size, 0),
        };
      })
    );

    res.json(userStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// Download source code
adminRoutes.get('/source-code', authenticateAdmin, requireGodMode, async (req: AdminAuthRequest, res: express.Response) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const rootDir = path.join(__dirname, '..', '..');

    res.attachment('voicevault-source.zip');
    archive.pipe(res);

    // Add source files to the archive
    archive.glob('**/*', {
      cwd: rootDir,
      ignore: [
        'node_modules/**',
        'uploads/**',
        'logs/**',
        '.env',
        '*.log',
        '*.zip',
      ],
    });

    await archive.finalize();
  } catch (error) {
    console.error('Error creating source code archive:', error);
    res.status(500).json({ error: 'Error downloading source code' });
  }
});

// Get user activity logs
adminRoutes.get('/user-activity/:userId', authenticateAdmin, requireGodMode, async (req: AdminAuthRequest, res: express.Response) => {
  try {
    const userId = req.params.userId;
    const [cachedAudios, audioFiles] = await Promise.all([
      CachedAudio.find({ userId }).sort('-createdAt'),
      AudioFile.find({ userId }).sort('-createdAt'),
    ]);

    res.json({
      cachedAudios,
      audioFiles,
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Error fetching user activity' });
  }
});

// Middleware to check admin role
const isAdminMiddleware = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (req.user.role !== 'admin' && req.user.role !== 'god') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get current upload settings
adminRoutes.get('/upload-settings', authenticateUser, isAdminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await UploadSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upload settings' });
  }
});

// Update upload settings
adminRoutes.put('/upload-settings', authenticateUser, isAdminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { maxFileSize } = req.body;

    // Additional validation for god mode
    if (req.user.role !== 'god' && maxFileSize > (25 * 1024 * 1024 * 1024)) { // 25GB limit for regular admins
      return res.status(403).json({ error: 'File size limit exceeds admin permissions' });
    }

    const settings = await UploadSettings.findOneAndUpdate(
      {},
      {
        maxFileSize,
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update upload settings' });
  }
});

// Helper functions
async function calculateTotalStorage(): Promise<{ cache: number; library: number }> {
  const [cachedFiles, libraryFiles] = await Promise.all([
    CachedAudio.find(),
    AudioFile.find(),
  ]);

  return {
    cache: cachedFiles.reduce((acc, file) => acc + file.size, 0),
    library: libraryFiles.reduce((acc, file) => acc + file.size, 0),
  };
}

async function getActiveUsers(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await User.countDocuments({
    updatedAt: { $gte: thirtyDaysAgo },
  });

  return activeUsers;
} 