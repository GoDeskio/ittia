import mongoose, { Document, Schema } from 'mongoose';

export interface AudioFile extends Document {
  userId: string;
  filename: string;
  path: string;
  size: number;
  duration: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const audioFileSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

export const AudioFile = mongoose.model<AudioFile>('AudioFile', audioFileSchema); 