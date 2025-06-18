"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialIntegrationConfig = exports.jwtConfig = exports.authConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.authConfig = {
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
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
};
exports.socialIntegrationConfig = {
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
//# sourceMappingURL=auth.config.js.map