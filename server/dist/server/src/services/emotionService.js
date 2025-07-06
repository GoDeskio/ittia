"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEmotion = void 0;
const analyzeEmotion = async (_audioPath) => {
    const emotions = ['happy', 'sad', 'angry', 'neutral'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.random() * 0.5 + 0.5;
    return {
        emotion: randomEmotion,
        confidence
    };
};
exports.analyzeEmotion = analyzeEmotion;
//# sourceMappingURL=emotionService.js.map