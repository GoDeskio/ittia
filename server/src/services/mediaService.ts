import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const mkdir = promisify(fs.mkdir);
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

export class MediaService {
  private static readonly UPLOAD_DIR = path.join(__dirname, '../../uploads');
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  private static readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(MediaService.UPLOAD_DIR)) {
      fs.mkdirSync(MediaService.UPLOAD_DIR, { recursive: true });
    }
  }

  private generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const hash = createHash('md5').update(Date.now().toString()).digest('hex');
    return `${uuidv4()}-${hash}${ext}`;
  }

  private async generateThumbnail(
    filePath: string,
    type: 'image' | 'video'
  ): Promise<string> {
    const thumbnailFileName = `thumb_${path.basename(filePath)}`;
    const thumbnailPath = path.join(
      MediaService.UPLOAD_DIR,
      'thumbnails',
      thumbnailFileName
    );

    // Ensure thumbnails directory exists
    await mkdir(path.dirname(thumbnailPath), { recursive: true });

    if (type === 'image') {
      await sharp(filePath)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .toFile(thumbnailPath);
    } else if (type === 'video') {
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: thumbnailFileName,
            folder: path.join(MediaService.UPLOAD_DIR, 'thumbnails'),
            size: '300x300'
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    return `/uploads/thumbnails/${thumbnailFileName}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    type: 'profile' | 'banner' | 'post'
  ): Promise<{
    url: string;
    type: 'image' | 'gif' | 'video';
    thumbnailUrl?: string;
  }> {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds maximum limit of 1GB');
    }

    const isImage = MediaService.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isVideo = MediaService.ALLOWED_VIDEO_TYPES.includes(file.mimetype);

    if (!isImage && !isVideo) {
      throw new Error('Invalid file type');
    }

    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(MediaService.UPLOAD_DIR, type, fileName);

    // Ensure directory exists
    await mkdir(path.dirname(filePath), { recursive: true });

    // Move file to upload directory
    await fs.promises.rename(file.path, filePath);

    const mediaType = file.mimetype === 'image/gif' ? 'gif' :
      isImage ? 'image' : 'video';

    // Generate thumbnail for images and videos
    const thumbnailUrl = await this.generateThumbnail(
      filePath,
      isImage ? 'image' : 'video'
    );

    return {
      url: `/uploads/${type}/${fileName}`,
      type: mediaType,
      thumbnailUrl
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(MediaService.UPLOAD_DIR, filePath);
    const thumbnailPath = path.join(
      MediaService.UPLOAD_DIR,
      'thumbnails',
      `thumb_${path.basename(filePath)}`
    );

    try {
      await fs.promises.unlink(fullPath);
      if (fs.existsSync(thumbnailPath)) {
        await fs.promises.unlink(thumbnailPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export const mediaService = new MediaService(); 