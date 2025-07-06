import express from 'express';
import { User } from '../models/User';
import { authenticateUser } from '../middleware/auth';
import multer from 'multer';
import { validateUserId } from '../middleware/validateUser';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get user profile (public)
router.get('/:userId/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -privateKey');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's style preferences (public)
router.get('/:userId/style-preferences', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('stylePreferences bannerImage');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      stylePreferences: user.stylePreferences,
      bannerImage: user.bannerImage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user's style preferences (protected)
router.put('/:userId/style-preferences', authenticateUser, validateUserId, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { stylePreferences: req.body.stylePreferences },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ stylePreferences: user.stylePreferences });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload banner image (protected)
router.post('/:userId/upload-banner', authenticateUser, validateUserId, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Handle file upload to your storage service here
    const imageUrl = `/uploads/${req.file.filename}`; // Replace with your actual file URL

    res.json({ url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update banner image settings (protected)
router.put('/:userId/banner', authenticateUser, validateUserId, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { bannerImage: req.body.bannerImage },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ bannerImage: user.bannerImage });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 