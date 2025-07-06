export type MessageRetentionPeriod = '1h' | '6h' | '24h' | '7d' | '30d';

export interface User {
  _id: string;
  id: string;
  name: string;
  username: string;
  email: string;
  profilePicture?: string;
  bannerImage?: string;
  title?: string;
  bio?: string;
  role: 'user' | 'admin' | 'god';
  token: string;
  apiToken?: string;
  qrCode?: string;
  messageRetentionPeriod: MessageRetentionPeriod;
  createdAt: string;
  updatedAt: string;
} 