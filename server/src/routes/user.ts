import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authenticateToken, authenticateUser } from '../middleware/auth';
import { body, param } from 'express-validator';
import passport from 'passport';
import { validateRequest } from '../middleware/validation';
import multer from 'multer';
import { mediaService } from '../services/mediaService';
import { AuthenticatedRequest } from '../types/express/AuthenticatedRequest';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    apiToken: string;
  };
}

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Get user profile
router.get('/profile', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = {
      name: req.body.name,
      profilePicture: req.body.profilePicture,
      bannerImage: req.body.bannerImage,
      title: req.body.title,
      bio: req.body.bio
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile media (profile picture or banner)
router.post(
  '/upload',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  [
    body('type').isIn(['profile', 'banner']),
    validateRequest
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const mediaData = await mediaService.uploadFile(req.file, req.body.type as 'profile' | 'banner');

      // Update user profile with new media URL
      const updateField = req.body.type === 'profile' ? 'profilePicture' : 'bannerImage';
      await User.findByIdAndUpdate(req.user._id, {
        $set: { [updateField]: mediaData.url }
      });

      res.json(mediaData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ message: errorMessage });
    }
  }
);

// Update user password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    const validPassword = await user.comparePassword(currentPassword);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error updating password' });
  }
});

// Update storage quota
router.post('/storage-quota', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    if (cache) user.storageQuota.cache = cache;
    if (library) user.storageQuota.library = library;

    await user.save();
    res.json({ 
      message: 'Storage quota updated successfully',
      storageQuota: user.storageQuota,
      storageUsed: user.storageUsed
    });
  } catch (error) {
    console.error('Error updating storage quota:', error);
    res.status(500).json({ error: 'Error updating storage quota' });
  }
});

// Get storage usage
router.get('/storage-usage', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      quota: user.storageQuota,
      used: user.storageUsed,
      available: {
        cache: user.storageQuota.cache - user.storageUsed.cache,
        library: user.storageQuota.library - user.storageUsed.library
      }
    });
  } catch (error) {
    console.error('Error fetching storage usage:', error);
    res.status(500).json({ error: 'Error fetching storage usage' });
  }
});

// Delete user account
router.delete('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Error deleting user account' });
  }
});

// Get user settings
router.get(
  '/settings',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById((req.user as any)._id)
        .select('-password -pinCode -fingerPrintHash');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        authMethods: user.authMethods,
        preferredAuthMethod: user.preferredAuthMethod,
        socialIntegrations: user.socialIntegrations,
        devicePermissions: user.devicePermissions
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user settings' });
    }
  }
);

// Update auth methods
router.post(
  '/auth-methods/:method/toggle',
  [
    body('enabled').isBoolean(),
    validateRequest,
    passport.authenticate('jwt', { session: false })
  ],
  async (req, res) => {
    try {
      const { method } = req.params;
      const { enabled } = req.body;
      
      const user = await User.findById((req.user as any)._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!(method in user.authMethods)) {
        return res.status(400).json({ message: 'Invalid authentication method' });
      }

      // Don't allow disabling email auth if it's the only method enabled
      if (method === 'email' && !enabled) {
        const enabledMethods = Object.entries(user.authMethods)
          .filter(([key, value]) => key !== 'email' && value)
          .length;
        
        if (enabledMethods === 0) {
          return res.status(400).json({
            message: 'Cannot disable email authentication when no other methods are enabled'
          });
        }
      }

      user.authMethods[method as keyof typeof user.authMethods] = enabled;
      await user.save();

      res.json({ authMethods: user.authMethods });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update authentication method' });
    }
  }
);

// Update preferred auth method
router.post(
  '/auth-methods/preferred',
  [
    body('method').isString(),
    validateRequest,
    passport.authenticate('jwt', { session: false })
  ],
  async (req, res) => {
    try {
      const { method } = req.body;
      
      const user = await User.findById((req.user as any)._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!(method in user.authMethods)) {
        return res.status(400).json({ message: 'Invalid authentication method' });
      }

      if (!user.authMethods[method as keyof typeof user.authMethods]) {
        return res.status(400).json({ message: 'Selected authentication method is not enabled' });
      }

      user.preferredAuthMethod = method;
      await user.save();

      res.json({ preferredAuthMethod: user.preferredAuthMethod });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update preferred authentication method' });
    }
  }
);

// Update device permissions
router.post(
  '/permissions/:permission/toggle',
  [
    body('enabled').isBoolean(),
    validateRequest,
    passport.authenticate('jwt', { session: false })
  ],
  async (req, res) => {
    try {
      const { permission } = req.params;
      const { enabled } = req.body;
      
      const user = await User.findById((req.user as any)._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!(permission in user.devicePermissions)) {
        return res.status(400).json({ message: 'Invalid permission' });
      }

      user.devicePermissions[permission as keyof typeof user.devicePermissions] = enabled;
      await user.save();

      res.json({ devicePermissions: user.devicePermissions });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update device permission' });
    }
  }
);

// Disconnect social integration
router.post(
  '/social/:platform/disconnect',
  [
    passport.authenticate('jwt', { session: false })
  ],
  async (req, res) => {
    try {
      const { platform } = req.params;
      
      const user = await User.findById((req.user as any)._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.socialIntegrations[platform]) {
        return res.status(400).json({ message: 'Invalid social platform' });
      }

      user.socialIntegrations[platform] = {
        connected: false,
        permissions: []
      };
      await user.save();

      res.json({ socialIntegrations: user.socialIntegrations });
    } catch (error) {
      res.status(500).json({ message: 'Failed to disconnect social integration' });
    }
  }
);

export default router; 