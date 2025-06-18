import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth';
import { processVoiceEmotion } from '../models/emotion/processor';
import { CustomError } from '../middleware/errorHandler';
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db';

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

const librariesRouter = express.Router();

// Get all voice libraries
librariesRouter.get('/libraries', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, owner, is_public, created_at 
       FROM voice_libraries 
       WHERE owner = $1 OR is_public = true`,
      [req.user.id]
    );

    res.json({ libraries: result.rows });
  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({ error: 'Failed to fetch libraries' });
  }
});

// Add new voice library
librariesRouter.post('/libraries', authenticateToken, async (req, res) => {
  const { name, apiKey, token } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO voice_libraries (name, owner, api_key, token, is_public)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, owner, is_public, created_at`,
      [name, req.user.id, apiKey, token]
    );

    res.status(201).json({ library: result.rows[0] });
  } catch (error) {
    console.error('Error adding library:', error);
    res.status(500).json({ error: 'Failed to add library' });
  }
});

// Delete voice library
librariesRouter.delete('/libraries/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM voice_libraries 
       WHERE id = $1 AND owner = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Library not found or unauthorized' });
    }

    res.json({ message: 'Library deleted successfully' });
  } catch (error) {
    console.error('Error deleting library:', error);
    res.status(500).json({ error: 'Failed to delete library' });
  }
});

// Update voice library
librariesRouter.put('/libraries/:id', authenticateToken, async (req, res) => {
  const { name, apiKey, token, isPublic } = req.body;

  try {
    const result = await pool.query(
      `UPDATE voice_libraries 
       SET name = COALESCE($1, name),
           api_key = COALESCE($2, api_key),
           token = COALESCE($3, token),
           is_public = COALESCE($4, is_public)
       WHERE id = $5 AND owner = $6
       RETURNING id, name, owner, is_public, created_at`,
      [name, apiKey, token, isPublic, req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Library not found or unauthorized' });
    }

    res.json({ library: result.rows[0] });
  } catch (error) {
    console.error('Error updating library:', error);
    res.status(500).json({ error: 'Failed to update library' });
  }
});

// Get voice library details
librariesRouter.get('/libraries/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, owner, is_public, created_at 
       FROM voice_libraries 
       WHERE id = $1 AND (owner = $2 OR is_public = true)`,
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Library not found or unauthorized' });
    }

    res.json({ library: result.rows[0] });
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});

export const voiceRoutes = router;
export default librariesRouter; 