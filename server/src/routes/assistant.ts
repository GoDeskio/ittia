import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { transcribeAudio } from '../services/audioProcessingService';
import { pool } from '../db';

const router = express.Router();

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Chat endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context, voiceLibraryId, voiceLibraryApiKey, voiceLibraryToken } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemma-3' });

    // If a voice library is specified, fetch its details
    let voiceLibrary = null;
    if (voiceLibraryId) {
      const result = await pool.query(
        `SELECT * FROM voice_libraries 
         WHERE id = $1 AND (owner = $2 OR is_public = true)`,
        [voiceLibraryId, req.user.id]
      );
      if (result.rows.length > 0) {
        voiceLibrary = result.rows[0];
      }
    }

    // Prepare conversation history with voice context if available
    const chat = model.startChat({
      history: context.map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Add voice library context if available
    let prompt = message;
    if (voiceLibrary) {
      prompt = `[Using voice library: ${voiceLibrary.name}]\n${message}`;
    }

    // Generate response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Transcribe audio endpoint
router.post('/transcribe', authenticateToken, async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = req.files.audio;
    const { voiceLibraryId } = req.body;

    // If a voice library is specified, fetch its details
    let voiceLibrary = null;
    if (voiceLibraryId) {
      const result = await pool.query(
        `SELECT * FROM voice_libraries 
         WHERE id = $1 AND (owner = $2 OR is_public = true)`,
        [voiceLibraryId, req.user.id]
      );
      if (result.rows.length > 0) {
        voiceLibrary = result.rows[0];
      }
    }

    // Use voice library API key or token if available
    const transcription = await transcribeAudio(audioFile, {
      apiKey: voiceLibrary?.api_key,
      token: voiceLibrary?.token,
    });

    res.json({ text: transcription });
  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

export default router; 