import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  mediaUrls: string[];
  mediaTypes: ('image' | 'video' | 'audio' | 'file')[];
  likes: mongoose.Types.ObjectId[];
  shares: number;
  comments: {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  visibility: 'public' | 'private' | 'friends';
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  mediaUrls: [{
    type: String
  }],
  mediaTypes: [{
    type: String,
    enum: ['image', 'video', 'audio', 'file']
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ visibility: 1 });
PostSchema.index({ content: 'text' });

export const Post = mongoose.model<IPost>('Post', PostSchema); 