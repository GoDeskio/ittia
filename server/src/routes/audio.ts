import express, { Response, NextFunction, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth';
import { AudioFile } from '../models/AudioFile';
import { CachedAudio } from '../models/CachedAudio';
import { User } from '../models/User';
import { processAudioToWords, WordFile } from '../services/audioProcessor';
import { AuthRequest } from '../types';

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const authReq = req as any;
    if (!authReq.user?.id) {
      cb(new Error('User not authenticated'), '');
      return;
    }
    const uploadDir = path.join(__dirname, '../../uploads', authReq.user.id, file.fieldname === 'cache' ? 'cache' : 'library');
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
router.get('/cache', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const cachedFiles = await CachedAudio.findByUserId(userId, false);
    res.json(cachedFiles);
  } catch (error) {
    console.error('Error fetching cached files:', error);
    res.status(500).json({ error: 'Error fetching cached files' });
  }
});

// Upload a new audio file
router.post('/upload', authenticateToken, upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;
    if (!userId || !req.file) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check storage quota
    const totalSize = await AudioFile.getTotalSize(userId);
    if (totalSize + req.file.size > user.storage_quota.library) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Storage quota exceeded' });
    }

    // Create audio file record
    const audioFile = await AudioFile.create({
      user_id: userId,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      duration: 0, // You'll need to implement duration calculation
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype
      }
    });

    // Update user's storage usage
    await User.updateStorageUsage(userId, 'library', req.file.size);

    res.json(audioFile);
  } catch (error) {
    console.error('Error uploading audio file:', error);
    res.status(500).json({ error: 'Error uploading audio file' });
  }
});

// Delete an audio file
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;
    const fileId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const audioFile = await AudioFile.findById(fileId);
    if (!audioFile || audioFile.user_id !== userId) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    // Delete the file from storage
    fs.unlinkSync(audioFile.path);

    // Delete the database record
    await AudioFile.delete(fileId);

    // Update user's storage usage
    await User.updateStorageUsage(userId, 'library', -audioFile.size);

    res.json({ message: 'Audio file deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio file:', error);
    res.status(500).json({ error: 'Error deleting audio file' });
  }
});

// Process cached audio file into individual word files
router.post('/process/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
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
router.post('/cache/:id/mark-processed', authenticateToken, async (req: AuthRequest, res: express.Response) => {
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
router.delete('/cache/:id', authenticateToken, async (req: AuthRequest, res: express.Response) => {
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
router.get('/library', authenticateToken, async (req: AuthRequest, res: express.Response) => {
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
router.get('/stream/:type/:filename', authenticateToken, (req: AuthRequest, res: express.Response) => {
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

export { router as audioRoutes }; 