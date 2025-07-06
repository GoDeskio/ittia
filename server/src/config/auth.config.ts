import dotenv from 'dotenv';

dotenv.config();

export const authConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: '/auth/google/callback'
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    callbackURL: '/auth/facebook/callback'
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    callbackURL: '/auth/linkedin/callback'
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    callbackURL: '/auth/instagram/callback'
  }
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: '24h'
};

export const socialIntegrationConfig = {
  facebook: {
    permissions: ['email', 'public_profile', 'publish_to_groups'],
  },
  twitter: {
    permissions: ['tweet.read', 'tweet.write', 'users.read'],
  },
  instagram: {
    permissions: ['basic', 'publish_media', 'pages_show_list'],
  },
  youtube: {
    permissions: ['youtube.readonly', 'youtube.upload'],
  },
  tiktok: {
    permissions: ['user.info.basic', 'video.list', 'video.upload'],
  },
  rumble: {
    permissions: ['read', 'upload'],
  }
}; 