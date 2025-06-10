import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { User } from '../models/User';
import passport from 'passport';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';
import { AudioFile } from '../models/audio';
import { CachedAudio } from '../models/cachedAudio';
import { processAudioToWords, WordFile } from '../services/audioProcessor';

export const audioRoutes = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    apiToken: string;
  };
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req: AuthRequest, file, cb) => {
    if (!req.user?.id) {
      cb(new Error('User not authenticated'), '');
      return;
    }
    const uploadDir = path.join(__dirname, '../../uploads', req.user.id, file.fieldname === 'cache' ? 'cache' : 'library');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'audio/wav') {
      cb(new Error('Only .wav files are allowed'));
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for raw files
  },
});

// Get all cached audio files for the authenticated user
audioRoutes.get('/cache', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const cachedFiles = await CachedAudio.find({ userId, processed: false }).sort({ createdAt: -1 });
    res.json(cachedFiles);
  } catch (error) {
    console.error('Error fetching cached files:', error);
    res.status(500).json({ error: 'Error fetching cached files' });
  }
});

// Upload a new cached audio file
audioRoutes.post(
  '/cache',
  authenticateToken,
  upload.single('audio'),
  async (req: AuthRequest, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const file = req.file;
      const apiToken = req.body.apiToken;

      // Get audio duration using ffprobe or similar tool
      // This is a placeholder - you'll need to implement actual duration calculation
      const duration = 0;

      const cachedAudio = new CachedAudio({
        userId,
        filename: file.originalname,
        path: file.path,
        size: file.size,
        duration,
        url: `/api/audio/stream/cache/${path.basename(file.path)}`,
        apiToken,
        processed: false,
      });

      await cachedAudio.save();
      res.status(201).json(cachedAudio);
    } catch (error) {
      console.error('Error uploading cached file:', error);
      res.status(500).json({ error: 'Error uploading cached file' });
    }
  }
);

// Process cached audio file into individual word files
audioRoutes.post('/process/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cachedFile = await CachedAudio.findOne({ _id: req.params.id, userId });

    if (!cachedFile) {
      return res.status(404).json({ error: 'Cached file not found' });
    }

    // Process the audio file into individual word files
    const wordFiles = await processAudioToWords(cachedFile.path, userId, cachedFile.apiToken);

    // Create AudioFile records for each word file
    const audioFiles = await Promise.all(
      wordFiles.map(async (wordFile: WordFile) => {
        const audioFile = new AudioFile({
          userId,
          filename: wordFile.filename,
          path: wordFile.path,
          size: wordFile.size,
          duration: wordFile.duration,
          url: `/api/audio/stream/library/${path.basename(wordFile.path)}`,
        });
        await audioFile.save();
        return audioFile;
      })
    );

    // Mark the cached file as processed
    cachedFile.processed = true;
    await cachedFile.save();

    res.json(audioFiles);
  } catch (error) {
    console.error('Error processing audio file:', error);
    res.status(500).json({ error: 'Error processing audio file' });
  }
});

// Mark cached audio as processed
audioRoutes.post('/cache/:id/mark-processed', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cachedAudio = await CachedAudio.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!cachedAudio) {
      return res.status(404).json({ error: 'Cached audio not found' });
    }

    cachedAudio.processed = true;
    await cachedAudio.save();

    res.json({ message: 'Audio marked as processed', audio: cachedAudio });
  } catch (error) {
    console.error('Error marking audio as processed:', error);
    res.status(500).json({ error: 'Error marking audio as processed' });
  }
});

// Delete cached audio
audioRoutes.delete('/cache/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const cachedAudio = await CachedAudio.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!cachedAudio) {
      return res.status(404).json({ error: 'Cached audio not found' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, '..', '..', 'uploads', req.user.id, 'cache', cachedAudio.filename);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue even if file doesn't exist, as we want to clean up the database entry
    }

    // Delete the database entry
    await CachedAudio.deleteOne({ _id: req.params.id });

    // Update storage usage
    const user = await User.findById(req.user.id);
    if (user) {
      user.storageUsed.cache -= cachedAudio.size;
      if (user.storageUsed.cache < 0) user.storageUsed.cache = 0;
      await user.save();
    }

    res.json({ message: 'Cached audio deleted successfully' });
  } catch (error) {
    console.error('Error deleting cached audio:', error);
    res.status(500).json({ error: 'Error deleting cached audio' });
  }
});

// Get all processed audio files for the authenticated user
audioRoutes.get('/library', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const audioFiles = await AudioFile.find({ userId }).sort({ createdAt: -1 });
    res.json(audioFiles);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    res.status(500).json({ error: 'Error fetching audio files' });
  }
});

// Stream audio file (either cached or library)
audioRoutes.get('/stream/:type/:filename', authenticateToken, (req: AuthRequest, res: express.Response) => {
  try {
    const { type, filename } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const filePath = path.join(__dirname, '../../uploads', userId, type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/wav',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/wav',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming audio file:', error);
    res.status(500).json({ error: 'Error streaming audio file' });
  }
}); 