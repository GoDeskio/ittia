import mongoose, { Document, Schema } from 'mongoose';

export interface CachedAudio extends Document {
  userId: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  url: string;
  apiToken: string;
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    deviceId?: string;
    recordingQuality?: string;
    [key: string]: any;
  };
}

const cachedAudioSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    url: {
      type: String,
      required: true,
    },
    apiToken: {
      type: String,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    metadata: {
      deviceId: String,
      recordingQuality: String,
    },
  },
  {
    timestamps: true,
  }
);

export const CachedAudio = mongoose.model<CachedAudio>('CachedAudio', cachedAudioSchema); 