import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  author: Schema.Types.ObjectId;
  content: string;
  media?: {
    url: string;
    type: 'image' | 'gif' | 'video';
    thumbnailUrl?: string;
  };
  likes: Schema.Types.ObjectId[];
  comments: {
    author: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  visibility: 'public' | 'private' | 'followers';
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  media: {
    url: String,
    type: {
      type: String,
      enum: ['image', 'gif', 'video']
    },
    thumbnailUrl: String
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
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
    enum: ['public', 'private', 'followers'],
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