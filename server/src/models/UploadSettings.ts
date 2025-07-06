import mongoose, { Schema, Document, Model } from 'mongoose';
import { defaultConfig } from '../config/upload';

export interface IUploadSettings extends Document {
  maxFileSize: number;
  lastModifiedBy: Schema.Types.ObjectId;
  lastModifiedAt: Date;
}

interface IUploadSettingsModel extends Model<IUploadSettings> {
  getSettings(): Promise<IUploadSettings>;
}

const UploadSettingsSchema = new Schema<IUploadSettings>({
  maxFileSize: {
    type: Number,
    required: true,
    default: defaultConfig.maxFileSize
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one settings document exists
UploadSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      maxFileSize: defaultConfig.maxFileSize,
      lastModifiedBy: null,
      lastModifiedAt: new Date()
    });
  }
  return settings;
};

export const UploadSettings = mongoose.model<IUploadSettings, IUploadSettingsModel>('UploadSettings', UploadSettingsSchema); 