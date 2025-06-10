export type MessageRetentionPeriod = '1h' | '6h' | '24h' | '7d' | '30d';

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bannerImage?: string;
  title?: string;
  bio?: string;
  role: 'user' | 'admin';
  token: string;
  messageRetentionPeriod: MessageRetentionPeriod;
  createdAt: string;
  updatedAt: string;
} 