import { AudioFile } from '../models/AudioFile';
import { CachedAudio } from '../models/CachedAudio';
import { User } from '../models/User';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';

export interface WordFile {
  filename: string;
  path: string;
  size: number;
  duration: number;
  word: string;
  startTime: number;
  endTime: number;
}

export const processAudioToWords = async (audioPath: string): Promise<WordFile[]> => {
  try {
    // Get audio duration using ffprobe
    const duration = await getAudioDuration(audioPath);

    // Split audio into words (this is a placeholder - you'll need to implement actual word detection)
    const words = await detectWords(audioPath);

    // Create word files
    const wordFiles: WordFile[] = [];
    for (const word of words) {
      const wordPath = path.join(path.dirname(audioPath), `${word.word}-${Date.now()}.wav`);
      await extractWord(audioPath, wordPath, word.startTime, word.endTime);

      const stats = await fs.stat(wordPath);
      wordFiles.push({
        filename: path.basename(wordPath),
        path: wordPath,
        size: stats.size,
        duration: word.endTime - word.startTime,
        word: word.word,
        startTime: word.startTime,
        endTime: word.endTime
      });
    }

    return wordFiles;
  } catch (error) {
    console.error('Error processing audio to words:', error);
    throw error;
  }
};

const getAudioDuration = (audioPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(metadata.format.duration || 0);
    });
  });
};

const detectWords = async (audioPath: string): Promise<Array<{ word: string; startTime: number; endTime: number }>> => {
  // This is a placeholder - you'll need to implement actual word detection
  // For now, we'll just return some dummy data
  return [
    { word: 'hello', startTime: 0, endTime: 1 },
    { word: 'world', startTime: 1.5, endTime: 2.5 }
  ];
};

const extractWord = (audioPath: string, outputPath: string, startTime: number, endTime: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
};

export const processAudio = async (audioId: string, userId: string) => {
  try {
    const audioFile = await AudioFile.findById(audioId);
    if (!audioFile || audioFile.user_id !== userId) {
      throw new Error('Audio file not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Process the audio file into words
    const wordFiles = await processAudioToWords(audioFile.path);

    // Update user's storage usage
    const totalSize = wordFiles.reduce((total, wordFile) => total + wordFile.size, 0);
    await User.updateStorageUsage(userId, 'library', totalSize);

    return wordFiles;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
}; 