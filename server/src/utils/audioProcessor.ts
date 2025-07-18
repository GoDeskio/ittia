import * as fs from 'fs';
import * as path from 'path';
import * as wav from 'node-wav';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

export interface AudioInfo {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  bitRate?: number;
  size: number;
}

export interface AudioSegment {
  startTime: number;
  endTime: number;
  buffer: Buffer;
}

export class AudioProcessor {
  private static instance: AudioProcessor;
  private tempDir: string;

  private constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDir();
  }

  public static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor();
    }
    return AudioProcessor.instance;
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Get audio file information
   */
  async getAudioInfo(filePath: string): Promise<AudioInfo> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
        if (!audioStream) {
          reject(new Error('No audio stream found'));
          return;
        }

        const info: AudioInfo = {
          duration: metadata.format.duration || 0,
          sampleRate: audioStream.sample_rate || 44100,
          channels: audioStream.channels || 1,
          format: metadata.format.format_name || 'unknown',
          bitRate: audioStream.bit_rate ? parseInt(audioStream.bit_rate) : undefined,
          size: metadata.format.size || 0,
        };

        resolve(info);
      });
    });
  }

  /**
   * Convert audio to WAV format with specified parameters
   */
  async convertToWav(
    inputPath: string,
    outputPath: string,
    options: {
      sampleRate?: number;
      channels?: number;
      bitDepth?: number;
    } = {}
  ): Promise<string> {
    const {
      sampleRate = 44100,
      channels = 1,
      bitDepth = 16,
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFrequency(sampleRate)
        .audioChannels(channels)
        .audioBitrate(`${bitDepth}k`)
        .format('wav')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Extract audio segment from a larger file
   */
  async extractSegment(
    inputPath: string,
    startTime: number,
    endTime: number,
    outputPath?: string
  ): Promise<string> {
    const output = outputPath || path.join(
      this.tempDir,
      `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`
    );

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .seekInput(startTime)
        .duration(endTime - startTime)
        .format('wav')
        .output(output)
        .on('end', () => resolve(output))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Normalize audio levels
   */
  async normalizeAudio(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters('loudnorm')
        .format('wav')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Reduce noise in audio
   */
  async reduceNoise(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          'highpass=f=80',      // Remove low-frequency noise
          'lowpass=f=8000',     // Remove high-frequency noise
          'afftdn=nf=-25'       // Noise reduction
        ])
        .format('wav')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Split audio into chunks for processing
   */
  async splitAudio(
    inputPath: string,
    chunkDuration: number = 30
  ): Promise<string[]> {
    const info = await this.getAudioInfo(inputPath);
    const totalDuration = info.duration;
    const chunks: string[] = [];

    for (let start = 0; start < totalDuration; start += chunkDuration) {
      const end = Math.min(start + chunkDuration, totalDuration);
      const chunkPath = path.join(
        this.tempDir,
        `chunk_${chunks.length}_${Date.now()}.wav`
      );
      
      await this.extractSegment(inputPath, start, end, chunkPath);
      chunks.push(chunkPath);
    }

    return chunks;
  }

  /**
   * Merge multiple audio files
   */
  async mergeAudioFiles(inputPaths: string[], outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      inputPaths.forEach(inputPath => {
        command.input(inputPath);
      });

      command
        .complexFilter([
          `concat=n=${inputPaths.length}:v=0:a=1[out]`
        ])
        .outputOptions(['-map', '[out]'])
        .format('wav')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Get audio waveform data for visualization
   */
  async getWaveformData(
    inputPath: string,
    samples: number = 1000
  ): Promise<number[]> {
    const tempOutput = path.join(this.tempDir, `waveform_${Date.now()}.json`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioFilters([
          `aresample=${samples}`,
          'astats=metadata=1:reset=1'
        ])
        .format('null')
        .output(tempOutput)
        .on('end', () => {
          try {
            // This is a simplified version - in practice, you'd need to
            // extract the actual waveform data from FFmpeg output
            const waveformData = Array.from({ length: samples }, () => 
              Math.random() * 2 - 1 // Placeholder: random values between -1 and 1
            );
            resolve(waveformData);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject)
        .run();
    });
  }

  /**
   * Detect silence in audio
   */
  async detectSilence(
    inputPath: string,
    threshold: number = -30,
    minDuration: number = 0.5
  ): Promise<Array<{ start: number; end: number }>> {
    return new Promise((resolve, reject) => {
      const silenceSegments: Array<{ start: number; end: number }> = [];
      
      ffmpeg(inputPath)
        .audioFilters([
          `silencedetect=noise=${threshold}dB:duration=${minDuration}`
        ])
        .format('null')
        .output('-')
        .on('stderr', (stderrLine) => {
          // Parse silence detection output
          const silenceStartMatch = stderrLine.match(/silence_start: ([\d.]+)/);
          const silenceEndMatch = stderrLine.match(/silence_end: ([\d.]+)/);
          
          if (silenceStartMatch && silenceEndMatch) {
            silenceSegments.push({
              start: parseFloat(silenceStartMatch[1]),
              end: parseFloat(silenceEndMatch[1])
            });
          }
        })
        .on('end', () => resolve(silenceSegments))
        .on('error', reject)
        .run();
    });
  }

  /**
   * Clean up temporary files
   */
  async cleanup(filePaths: string[]): Promise<void> {
    const unlinkAsync = promisify(fs.unlink);
    
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
          }
        } catch (error) {
          console.warn(`Failed to delete temporary file ${filePath}:`, error);
        }
      })
    );
  }

  /**
   * Validate audio file
   */
  async validateAudioFile(filePath: string): Promise<boolean> {
    try {
      const info = await this.getAudioInfo(filePath);
      return info.duration > 0 && info.sampleRate > 0 && info.channels > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get audio file buffer
   */
  async getAudioBuffer(filePath: string): Promise<Buffer> {
    return fs.promises.readFile(filePath);
  }

  /**
   * Save audio buffer to file
   */
  async saveAudioBuffer(buffer: Buffer, outputPath: string): Promise<string> {
    await fs.promises.writeFile(outputPath, buffer);
    return outputPath;
  }

  /**
   * Convert buffer to WAV format
   */
  convertBufferToWav(buffer: Buffer, sampleRate: number = 44100, channels: number = 1): Buffer {
    // This is a simplified implementation
    // In practice, you might want to use a more robust WAV encoding library
    const wavData = wav.encode(null, {
      sampleRate,
      channels,
      bitDepth: 16
    });
    
    return Buffer.from(wavData);
  }
}

export default AudioProcessor;