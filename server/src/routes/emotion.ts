import { Router, Request, Response, NextFunction } from 'express';
import { EmotionAnalysisModel } from '../models/emotion/analysis';
import { authenticateToken } from '../middleware/auth';
import { uploadAudio } from '../middleware/upload';
import { analyzeEmotion } from '../services/emotionService';
import { generateQRCode } from '../utils/qrcode';
import { getLocation } from '../utils/location';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    apiToken: string;
  };
}

const router = Router();

// Get all emotion analyses for the authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const analyses = await EmotionAnalysisModel.find({ userId: authReq.user.id });
    res.json(analyses);
  } catch (error) {
    next(error);
  }
});

// Create new emotion analysis
router.post('/', authenticateToken, uploadAudio, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const location = await getLocation();
    const { emotion, confidence } = await analyzeEmotion(req.file.path);
    const qrCode = await generateQRCode(req.file.path);

    const analysis = new EmotionAnalysisModel({
      userId: authReq.user.id,
      audioUrl: req.file.path,
      emotion,
      confidence,
      qrCodeUrl: qrCode,
      location,
      apiToken: authReq.user.apiToken
    });

    await analysis.save();
    res.status(201).json(analysis);
  } catch (error) {
    next(error);
  }
});

// Update emotion analysis
router.put('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const analysis = await EmotionAnalysisModel.findOneAndUpdate(
      { _id: req.params.id, userId: authReq.user.id },
      req.body,
      { new: true }
    );
    if (!analysis) {
      return res.status(404).json({ error: 'Emotion analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Delete emotion analysis
router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const analysis = await EmotionAnalysisModel.findOneAndDelete({
      _id: req.params.id,
      userId: authReq.user.id
    });
    if (!analysis) {
      return res.status(404).json({ error: 'Emotion analysis not found' });
    }
    res.json({ message: 'Emotion analysis deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as emotionRoutes }; 