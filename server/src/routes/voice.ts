import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth';
import { processVoiceEmotion } from '../models/emotion/processor';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Configure multer for voice file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.wav', '.mp3'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only WAV and MP3 files are allowed.') as any);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload and process voice
router.post('/upload', auth, upload.single('voice'), async (req, res, next) => {
  try {
    if (!req.file) {
      const error: CustomError = new Error('No file uploaded');
      error.statusCode = 400;
      throw error;
    }

    const result = await processVoiceEmotion(req.file.path);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Get voice processing history
router.get('/history', auth, async (req, res, next) => {
  try {
    // TODO: Implement voice processing history retrieval
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
});

export const voiceRoutes = router; 