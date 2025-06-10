import { CachedAudio } from '../models/cachedAudio';
import { AudioFile } from '../models/audioFile';
import { User } from '../models/user';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';

export interface WordFile {
  userId: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  metadata: {
    deviceId?: string;
    recordingQuality?: string;
    [key: string]: any;
  };
}

export async function processAudioToWords(
  userId: string,
  cachedAudioId: string
): Promise<WordFile> {
  try {
    // Get the cached audio file
    const cachedAudio = await CachedAudio.findOne({
      _id: cachedAudioId,
      userId,
    });

    if (!cachedAudio) {
      throw new Error('Cached audio not found');
    }

    // Create the library directory if it doesn't exist
    const libraryDir = path.join(__dirname, '..', '..', 'uploads', userId, 'library');
    await fs.mkdir(libraryDir, { recursive: true });

    // Generate output filename
    const outputFilename = `${path.parse(cachedAudio.filename).name}_processed.wav`;
    const outputPath = path.join(libraryDir, outputFilename);

    // Process the audio file (example: convert to wav format)
    await new Promise<void>((resolve, reject) => {
      ffmpeg(cachedAudio.path)
        .toFormat('wav')
        .on('end', () => resolve())
        .on('error', (error: Error) => reject(error))
        .save(outputPath);
    });

    // Get the processed file stats
    const stats = await fs.stat(outputPath);

    // Create the processed file record
    const wordFile: WordFile = {
      userId,
      filename: outputFilename,
      path: outputPath,
      size: stats.size,
      duration: cachedAudio.duration,
      metadata: cachedAudio.metadata,
    };

    // Create AudioFile record in database
    const audioFile = new AudioFile({
      userId,
      filename: outputFilename,
      path: outputPath,
      size: stats.size,
      duration: cachedAudio.duration,
      metadata: cachedAudio.metadata,
    });

    await audioFile.save();

    // Update user's storage usage
    const user = await User.findById(userId);
    if (user) {
      user.storageUsed.library += stats.size;
      await user.save();
    }

    // Mark the cached audio as processed
    cachedAudio.processed = true;
    await cachedAudio.save();

    return wordFile;
  } catch (error) {
    console.error('Error processing audio to words:', error);
    throw error;
  }
} 