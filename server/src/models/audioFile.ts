import mongoose, { Document, Schema } from 'mongoose';

export interface AudioFile extends Document {
  userId: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  createdAt: Date;
  metadata: {
    deviceId?: string;
    recordingQuality?: string;
    [key: string]: any;
  };
}

const audioFileSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  metadata: {
    deviceId: String,
    recordingQuality: String,
  },
}, {
  timestamps: true,
});

export const AudioFile = mongoose.model<AudioFile>('AudioFile', audioFileSchema); 