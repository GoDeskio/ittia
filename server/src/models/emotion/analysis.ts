import mongoose, { Schema, Document } from 'mongoose';
import { EmotionType, Location, EmotionAnalysisData } from './types';

export interface IEmotionAnalysis extends Document, EmotionAnalysisData {}

const locationSchema = new Schema<Location>({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  timestamp: {
    type: Date,
    required: true
  }
}, { _id: false });

const emotionAnalysisSchema = new Schema<IEmotionAnalysis>({
  userId: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    enum: ['angry', 'happy', 'neutral', 'sad'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  apiToken: {
    type: String,
    required: true
  },
  word: {
    type: String,
    required: false
  },
  color: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
emotionAnalysisSchema.index({ userId: 1, createdAt: -1 });
emotionAnalysisSchema.index({ apiToken: 1 });
emotionAnalysisSchema.index({ emotion: 1 });
emotionAnalysisSchema.index({ 'location.timestamp': -1 });

// Virtual for file metadata
emotionAnalysisSchema.virtual('metadata').get(function() {
  return {
    word: this.word,
    emotion: this.emotion,
    color: this.color,
    location: {
      latitude: this.location.latitude,
      longitude: this.location.longitude,
      timestamp: this.location.timestamp.toISOString()
    },
    apiToken: this.apiToken,
    qrCode: this.qrCodeUrl
  };
});

// Remove methods that reference non-existent properties
delete emotionAnalysisSchema.methods.toJSON;

export const EmotionAnalysisModel = mongoose.model<IEmotionAnalysis>('EmotionAnalysis', emotionAnalysisSchema); 