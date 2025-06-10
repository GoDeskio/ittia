"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
exports.config = {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/voicevault',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    environment: process.env.NODE_ENV || 'development'
};
