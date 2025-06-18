import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authenticateToken, authenticateUser } from '../middleware/auth';
import passport from 'passport';
import { validateRequest } from '../middleware/validation';
import multer from 'multer';
import { mediaService } from '../services/mediaService';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Get user profile
router.get('/profile', authenticateUser, async (req: any, res: Response, next: any) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Exclude password from response
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req: any, res: Response, next: any) => {
  try {
    const updates = {
      name: req.body.name,
      profilePicture: req.body.profilePicture,
      bannerImage: req.body.bannerImage,
      title: req.body.title,
      bio: req.body.bio
    };
    const user = await User.findByIdAndUpdate(req.user?._id, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile media (profile picture or banner)
router.post(
  '/upload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  (req: any, res: Response, next: any) => {
    if (!['profile', 'banner'].includes(req.body.type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    next();
  },
  validateRequest,
  async (req: any, res: Response, next: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const mediaData = await mediaService.uploadFile(req.file, req.body.type as 'profile' | 'banner');
      // Update user profile with new media URL
      const updateField = req.body.type === 'profile' ? 'profilePicture' : 'bannerImage';
      const updates: any = {};
      updates[updateField] = mediaData.url;
      await User.findByIdAndUpdate(req.user?._id, updates);
      return res.json(mediaData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(400).json({ message: errorMessage });
    }
  }
);

// Update user password
router.post('/change-password', authenticateToken, async (req: any, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Verify current password
    const validPassword = await User.comparePassword(user, currentPassword);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    // Update password
    await User.findByIdAndUpdate(user._id, { password: await bcrypt.hash(newPassword, 10) });
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Error updating password' });
  }
});

// Update storage quota
router.post('/storage-quota', authenticateToken, async (req: any, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { cache, library } = req.body;
    // Validate new quotas (must be greater than current usage)
    if (cache && cache < user.storageUsed.cache) {
      return res.status(400).json({ 
        error: 'New cache quota must be greater than current usage',
        currentUsage: user.storageUsed.cache
      });
    }
    if (library && library < user.storageUsed.library) {
      return res.status(400).json({ 
        error: 'New library quota must be greater than current usage',
        currentUsage: user.storageUsed.library
      });
    }
    // Update quotas
    if (cache) await User.updateStorageQuota(user._id, 'cache', cache);
    if (library) await User.updateStorageQuota(user._id, 'library', library);
    const updatedUser = await User.findById(user._id);
    return res.json({ 
      message: 'Storage quota updated successfully',
      storageQuota: updatedUser?.storageQuota,
      storageUsed: updatedUser?.storageUsed
    });
  } catch (error) {
    console.error('Error updating storage quota:', error);
    return res.status(500).json({ error: 'Error updating storage quota' });
  }
});

// Get storage usage
router.get('/storage-usage', authenticateToken, async (req: any, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      quota: user.storageQuota,
      used: user.storageUsed,
      available: {
        cache: user.storageQuota.cache - user.storageUsed.cache,
        library: user.storageQuota.library - user.storageUsed.library
      }
    });
  } catch (error) {
    console.error('Error fetching storage usage:', error);
    return res.status(500).json({ error: 'Error fetching storage usage' });
  }
});

export default router; 