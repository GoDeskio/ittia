import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { UploadSettings } from '../models/UploadSettings';
import { defaultConfig } from '../config/upload';

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, defaultConfig.uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (defaultConfig.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Dynamic file size limit middleware
export const getDynamicMulter = async (_req: Request, _res: Response, _next: NextFunction) => {
  try {
    // Get current upload settings
    const settings = await UploadSettings.getSettings();
    
    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: settings.maxFileSize
      }
    });

    return upload;
  } catch (error) {
    // Fallback to default config if settings cannot be fetched
    const upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: defaultConfig.maxFileSize
      }
    });

    return upload;
  }
};

// Error handling middleware for multer
export const handleMulterError = (err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File size exceeds the allowed limit'
      });
    }
    return res.status(400).json({
      error: 'File upload error'
    });
  }
  return next(err);
};

// Middleware to check file size before upload
export const checkFileSize = async (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  
  try {
    const settings = await UploadSettings.getSettings();
    
    if (contentLength > settings.maxFileSize) {
      return res.status(413).json({
        error: 'File size exceeds the allowed limit'
      });
    }
    return next();
  } catch (error) {
    // Fallback to default config if settings cannot be fetched
    if (contentLength > defaultConfig.maxFileSize) {
      return res.status(413).json({
        error: 'File size exceeds the allowed limit'
      });
    }
    return next();
  }
}; 