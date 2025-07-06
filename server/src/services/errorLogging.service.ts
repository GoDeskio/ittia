import nodemailer from 'nodemailer';
// import mongoose, { Document, Schema } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface IErrorLog {
  id?: string;
  userId?: string;
  timestamp: Date;
  errorType: string;
  description: string;
  userAgent: string;
  route: string;
  stackTrace?: string;
  screenshots: string[];
  status: 'new' | 'in-progress' | 'resolved';
  resolution?: string;
  assignedTo?: string;
}

// const ErrorLogSchema = new Schema<IErrorLog>({
//   userId: { type: String },
//   timestamp: { type: Date, default: Date.now },
//   errorType: { type: String, required: true },
//   description: { type: String, required: true },
//   userAgent: { type: String },
//   route: { type: String },
//   stackTrace: { type: String },
//   screenshots: [{ type: String }],
//   status: { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new' },
//   resolution: { type: String },
//   assignedTo: { type: String }
// });

// const ErrorLog = mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema);

// Mock ErrorLog class for development
class ErrorLog {
  id: string;
  userId?: string;
  timestamp: Date;
  errorType: string;
  description: string;
  userAgent: string;
  route: string;
  stackTrace?: string;
  screenshots: string[];
  status: 'new' | 'in-progress' | 'resolved';
  resolution?: string;
  assignedTo?: string;

  constructor(data: any) {
    Object.assign(this, data);
    this.id = Date.now().toString();
  }

  async save() {
    // Mock save - in real implementation would save to database
    return this;
  }

  static find(_query: any) {
    return {
      sort: (_sortOptions: any) => []
    };
  }

  static findByIdAndUpdate(_id: string, _update: any, _options: any) {
    return null;
  }
}

// Configure multer for screenshot uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads/error-screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    files: 10, // Maximum 10 files
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JPEG/PNG files are allowed'));
    }
    cb(null, true);
  }
});

export class ErrorLoggingService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async logError(errorData: {
    userId?: string;
    errorType: string;
    description: string;
    userAgent: string;
    route: string;
    stackTrace?: string;
    screenshots: Express.Multer.File[];
  }): Promise<IErrorLog> {
    try {
      // Save screenshots and get their paths
      const screenshotPaths = errorData.screenshots.map(file => file.path);

      // Create error log
      const errorLog = new ErrorLog({
        userId: errorData.userId,
        errorType: errorData.errorType,
        description: errorData.description,
        userAgent: errorData.userAgent,
        route: errorData.route,
        stackTrace: errorData.stackTrace,
        screenshots: screenshotPaths
      });

      await errorLog.save();

      // Send email to development team
      await this.sendErrorEmail(errorLog);

      return errorLog;
    } catch (error) {
      console.error('Error logging error:', error);
      throw error;
    }
  }

  private async sendErrorEmail(errorLog: IErrorLog): Promise<void> {
    const devTeamEmail = process.env.DEV_TEAM_EMAIL || 'dev-team@voicevault.com';

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: devTeamEmail,
      subject: `[VoiceVault Error] ${errorLog.errorType}`,
      html: `
        <h2>Error Report</h2>
        <p><strong>Error ID:</strong> ${errorLog.id}</p>
        <p><strong>Timestamp:</strong> ${errorLog.timestamp}</p>
        <p><strong>User ID:</strong> ${errorLog.userId || 'Anonymous'}</p>
        <p><strong>Error Type:</strong> ${errorLog.errorType}</p>
        <p><strong>Description:</strong> ${errorLog.description}</p>
        <p><strong>Route:</strong> ${errorLog.route}</p>
        <p><strong>User Agent:</strong> ${errorLog.userAgent}</p>
        ${errorLog.stackTrace ? `<p><strong>Stack Trace:</strong><br><pre>${errorLog.stackTrace}</pre></p>` : ''}
      `,
      attachments: errorLog.screenshots.map(screenshot => ({
        filename: path.basename(screenshot),
        path: screenshot
      }))
    };

    await this.transporter.sendMail(mailOptions);
  }

  async getErrorLogs(filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    errorType?: string;
  }): Promise<IErrorLog[]> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = filters.userId;
    if (filters.errorType) query.errorType = filters.errorType;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    return ErrorLog.find(query).sort({ timestamp: -1 });
  }

  async updateErrorStatus(
    errorId: string,
    update: {
      status: 'new' | 'in-progress' | 'resolved';
      resolution?: string;
      assignedTo?: string;
    }
  ): Promise<IErrorLog | null> {
    return ErrorLog.findByIdAndUpdate(errorId, update, { new: true });
  }
}

export const errorLoggingService = new ErrorLoggingService();
export { upload as errorScreenshotUpload };
export type { IErrorLog }; 