import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAdmin, isGod } from '../../middleware/auth';
import { IconType } from '../../types/icons';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../../client/public/assets');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const iconType = req.body.type as IconType;
    const extension = path.extname(file.originalname);
    let filename: string;

    switch (iconType) {
      case 'loading':
        filename = 'loading.gif';
        break;
      case 'desktop':
        filename = 'desktop-icon.png';
        break;
      case 'mobile':
        filename = 'mobile-icon.png';
        break;
      case 'favicon':
        filename = 'favicon.ico';
        break;
      default:
        return cb(new Error('Invalid icon type'), '');
    }

    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route to upload/update icons (requires admin or god role)
router.post('/', [isAdmin], upload.single('icon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      message: 'Icon updated successfully',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading icon:', error);
    res.status(500).json({ error: 'Failed to upload icon' });
  }
});

export default router; 