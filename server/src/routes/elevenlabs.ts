import express from 'express';
import multer from 'multer';
import ElevenLabsService from '../services/ElevenLabsService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const elevenLabsService = new ElevenLabsService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

/**
 * GET /api/elevenlabs/voices
 * Get all available voices
 */
router.get('/voices', authenticateToken, async (req, res) => {
  try {
    const voices = await elevenLabsService.getVoices();
    res.json({ success: true, voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch voices' });
  }
});

/**
 * GET /api/elevenlabs/voice-library
 * Get organized voice library
 */
router.get('/voice-library', authenticateToken, async (req, res) => {
  try {
    const library = await elevenLabsService.getVoiceLibrary();
    res.json({ success: true, library });
  } catch (error) {
    console.error('Error fetching voice library:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch voice library' });
  }
});

/**
 * POST /api/elevenlabs/clone-voice
 * Clone a voice from audio samples
 */
router.post('/clone-voice', authenticateToken, upload.array('audioFiles', 10), async (req, res) => {
  try {
    const { name, description } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!name || !files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and audio files are required' 
      });
    }

    const audioBuffers = files.map(file => file.buffer);
    const clonedVoice = await elevenLabsService.cloneVoice(name, description, audioBuffers);

    res.json({ success: true, voice: clonedVoice });
  } catch (error) {
    console.error('Error cloning voice:', error);
    res.status(500).json({ success: false, error: 'Failed to clone voice' });
  }
});

/**
 * POST /api/elevenlabs/text-to-speech
 * Convert text to speech
 */
router.post('/text-to-speech', authenticateToken, async (req, res) => {
  try {
    const { text, voiceId, options } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text and voice ID are required' 
      });
    }

    const audioStream = await elevenLabsService.textToSpeech(text, voiceId, options);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    
    audioStream.pipe(res);
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    res.status(500).json({ success: false, error: 'Failed to generate speech' });
  }
});

/**
 * POST /api/elevenlabs/speech-to-speech
 * Convert speech to speech with different voice
 */
router.post('/speech-to-speech', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { voiceId, options } = req.body;
    const audioFile = req.file;

    if (!voiceId || !audioFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'Voice ID and audio file are required' 
      });
    }

    const audioStream = await elevenLabsService.speechToSpeech(
      audioFile.buffer, 
      voiceId, 
      JSON.parse(options || '{}')
    );
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="converted_speech.mp3"');
    
    audioStream.pipe(res);
  } catch (error) {
    console.error('Error in speech-to-speech:', error);
    res.status(500).json({ success: false, error: 'Failed to convert speech' });
  }
});

/**
 * POST /api/elevenlabs/process-audio
 * Process audio with metadata extraction
 */
router.post('/process-audio', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    const { location } = req.body;

    if (!audioFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'Audio file is required' 
      });
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    const userLocation = location ? JSON.parse(location) : undefined;

    const metadata = await elevenLabsService.processAudioWithMetadata(
      audioFile.buffer,
      clientIP,
      userLocation
    );

    // Generate unique filename
    const filename = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save audio with metadata
    const savedFiles = await elevenLabsService.saveAudioWithMetadata(
      audioFile.buffer,
      metadata,
      filename
    );

    res.json({ 
      success: true, 
      metadata,
      files: savedFiles,
      filename 
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ success: false, error: 'Failed to process audio' });
  }
});

/**
 * DELETE /api/elevenlabs/voice/:voiceId
 * Delete a cloned voice
 */
router.delete('/voice/:voiceId', authenticateToken, async (req, res) => {
  try {
    const { voiceId } = req.params;
    await elevenLabsService.deleteVoice(voiceId);
    res.json({ success: true, message: 'Voice deleted successfully' });
  } catch (error) {
    console.error('Error deleting voice:', error);
    res.status(500).json({ success: false, error: 'Failed to delete voice' });
  }
});

/**
 * POST /api/elevenlabs/analyze-emotion
 * Analyze emotion in text or audio
 */
router.post('/analyze-emotion', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const { text } = req.body;
    const audioFile = req.file;

    if (!text && !audioFile) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either text or audio file is required' 
      });
    }

    let emotionData;
    
    if (audioFile) {
      const metadata = await elevenLabsService.processAudioWithMetadata(audioFile.buffer);
      emotionData = {
        overallEmotion: metadata.overallEmotion,
        wordLevelEmotions: metadata.words.map(w => ({
          word: w.word,
          emotion: w.emotion,
          timestamp: w.timestamp,
        })),
      };
    } else {
      // Text-only emotion analysis would go here
      emotionData = { message: 'Text-only emotion analysis not implemented yet' };
    }

    res.json({ success: true, emotionData });
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze emotion' });
  }
});

export default router;