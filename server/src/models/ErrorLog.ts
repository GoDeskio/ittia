import mongoose, { Document, Schema } from 'mongoose';

export interface IErrorLog extends Document {
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

const ErrorLogSchema = new Schema<IErrorLog>({
  userId: { type: String, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  errorType: { type: String, required: true, index: true },
  description: { type: String, required: true },
  userAgent: { type: String },
  route: { type: String, index: true },
  stackTrace: { type: String },
  screenshots: [{ type: String }],
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new',
    index: true
  },
  resolution: { type: String },
  assignedTo: { type: String, index: true }
}, {
  timestamps: true
});

// Compound indexes for common queries
ErrorLogSchema.index({ status: 1, timestamp: -1 });
ErrorLogSchema.index({ errorType: 1, status: 1 });
ErrorLogSchema.index({ userId: 1, timestamp: -1 });

// Text index for search functionality
ErrorLogSchema.index({
  errorType: 'text',
  description: 'text',
  resolution: 'text'
}, {
  weights: {
    errorType: 10,
    description: 5,
    resolution: 3
  }
});

// Ensure screenshots are cleaned up when error log is deleted
ErrorLogSchema.pre('remove', async function() {
  const errorLog = this as IErrorLog;
  if (errorLog.screenshots && errorLog.screenshots.length > 0) {
    const fs = require('fs').promises;
    await Promise.all(
      errorLog.screenshots.map(screenshot =>
        fs.unlink(screenshot).catch(err =>
          console.error(`Failed to delete screenshot ${screenshot}:`, err)
        )
      )
    );
  }
});

// Add TTL index for old resolved errors (90 days)
ErrorLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { status: 'resolved' } }
);

export const ErrorLog = mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema); 