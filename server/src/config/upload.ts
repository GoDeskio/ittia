// import { Schema } from 'mongoose';

export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  uploadPath: string;
}

export interface IUploadSettings extends Document {
  maxFileSize: number;
  lastModifiedBy: string; // Schema.Types.ObjectId;
  lastModifiedAt: Date;
}

const defaultConfig: UploadConfig = {
  maxFileSize: 25 * 1024 * 1024 * 1024, // 25GB in bytes
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav'
  ],
  uploadPath: 'uploads/'
};

export { defaultConfig }; 