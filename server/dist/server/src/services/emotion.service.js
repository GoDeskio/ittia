"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEmotion = exports.EmotionService = void 0;
const processor_1 = require("../models/emotion/processor");
const qrcode_1 = require("../utils/qrcode");
const gps_1 = require("../utils/gps");
const token_1 = require("../utils/token");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const EMOTION_COLORS = {
    angry: '#FF0000',
    happy: '#FFD700',
    neutral: '#808080',
    sad: '#0000FF'
};
class EmotionService {
    static async processVoice(userId, audioFile, word) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user) {
                throw new errorHandler_1.CustomError('User not found', 404);
            }
            const emotionResult = await (0, processor_1.processVoiceEmotion)(audioFile.path);
            const location = await (0, gps_1.getLocation)();
            let apiToken = user.api_token;
            if (!apiToken) {
                apiToken = await (0, token_1.generateApiToken)();
                await User_1.User.updateApiToken(parseInt(userId), apiToken);
            }
            const qrCodePath = await (0, qrcode_1.generateQRCode)(audioFile.path);
            const analysis = {
                id: Date.now().toString(),
                userId,
                word,
                audioUrl: audioFile.path,
                qrCodeUrl: qrCodePath,
                emotion: emotionResult.emotion,
                confidence: emotionResult.confidence,
                color: EMOTION_COLORS[emotionResult.emotion],
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timestamp: location.timestamp
                },
                apiToken: apiToken,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return analysis;
        }
        catch (error) {
            throw new errorHandler_1.CustomError('Failed to process voice emotion', 500);
        }
    }
    static async getStats(_userId) {
        return {
            totalAnalyses: 0,
            emotionDistribution: {
                angry: 0,
                happy: 0,
                neutral: 0,
                sad: 0
            }
        };
    }
    static async getRecent(_userId) {
        return [];
    }
}
exports.EmotionService = EmotionService;
const analyzeEmotion = async (_audioFilePath) => {
    const emotions = ['happy', 'sad', 'angry', 'neutral'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = 0.7 + Math.random() * 0.3;
    const emotionColors = {
        happy: '#4caf50',
        sad: '#2196f3',
        angry: '#f44336',
        neutral: '#9e9e9e'
    };
    return {
        emotion: randomEmotion,
        confidence,
        color: emotionColors[randomEmotion]
    };
};
exports.analyzeEmotion = analyzeEmotion;
//# sourceMappingURL=emotion.service.js.map