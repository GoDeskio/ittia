import express, { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { AudioFile } from '../models/AudioFile';
import { CachedAudio } from '../models/CachedAudio';
import { authenticateAdmin, requireGodMode } from '../middleware/adminAuth';
import archiver from 'archiver';
import path from 'path';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// AuthenticatedRequest interface for routes that require user info
interface AuthenticatedRequest extends Request {
  user: IUser;
}

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Get system statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [users, audioFiles, cachedFiles] = await Promise.all([
      User.findAll(),
      AudioFile.findAll(),
      CachedAudio.findAll()
    ]);
    const totalStorageUsed = audioFiles.reduce((sum, file) => sum + file.size, 0) +
      cachedFiles.reduce((sum, file) => sum + file.size, 0);
    const stats = {
      totalUsers: users.length,
      totalAudioFiles: audioFiles.length,
      totalCachedFiles: cachedFiles.length,
      totalStorageUsed
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      storage_quota: user.storage_quota,
      storage_used: user.storage_used,
      created_at: user.created_at
    })));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user storage quota
router.put('/users/:id/quota', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { storage_quota } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (typeof storage_quota !== 'number' || storage_quota < 0) {
      return res.status(400).json({ error: 'Invalid storage quota value' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await User.update(id, { storage_quota });
    res.json({ message: 'Storage quota updated successfully' });
  } catch (error) {
    console.error('Error updating storage quota:', error);
    res.status(500).json({ error: 'Failed to update storage quota' });
  }
});

// Clean up old cached files
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { daysOld } = req.body;
    if (typeof daysOld !== 'number' || daysOld < 1) {
      return res.status(400).json({ error: 'Invalid days value' });
    }
    await CachedAudio.cleanupOldFiles(daysOld);
    res.json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    res.status(500).json({ error: 'Failed to clean up old files' });
  }
});

// Download source code (admin only)
router.get('/source-code', authenticateAdmin, requireGodMode, async (req: Request, res: Response) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const rootDir = path.join(__dirname, '..', '..');
    res.attachment('voicevault-source.zip');
    archive.pipe(res);
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

// Get user activity logs (admin only)
router.get('/user-activity/:userId', authenticateAdmin, requireGodMode, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const [cachedAudios, audioFiles] = await Promise.all([
      CachedAudio.findByUserId(userId, false),
      AudioFile.findByUserId(userId)
    ]);
    // Sort by created_at descending
    cachedAudios.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    audioFiles.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    res.json({
      cachedAudios,
      audioFiles,
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Error fetching user activity' });
  }
});

export { router as adminRoutes }; 