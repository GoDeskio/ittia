"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAudio = exports.processAudioToWords = void 0;
const AudioFile_1 = require("../models/AudioFile");
const User_1 = require("../models/User");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const processAudioToWords = async (audioPath) => {
    try {
        const duration = await getAudioDuration(audioPath);
        const words = await detectWords(audioPath);
        const wordFiles = [];
        for (const word of words) {
            const wordPath = path_1.default.join(path_1.default.dirname(audioPath), `${word.word}-${Date.now()}.wav`);
            await extractWord(audioPath, wordPath, word.startTime, word.endTime);
            const stats = await promises_1.default.stat(wordPath);
            wordFiles.push({
                filename: path_1.default.basename(wordPath),
                path: wordPath,
                size: stats.size,
                duration: word.endTime - word.startTime,
                word: word.word,
                startTime: word.startTime,
                endTime: word.endTime
            });
        }
        return wordFiles;
    }
    catch (error) {
        console.error('Error processing audio to words:', error);
        throw error;
    }
};
exports.processAudioToWords = processAudioToWords;
const getAudioDuration = (audioPath) => {
    return new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.ffprobe(audioPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(metadata.format.duration || 0);
        });
    });
};
const detectWords = async (audioPath) => {
    return [
        { word: 'hello', startTime: 0, endTime: 1 },
        { word: 'world', startTime: 1.5, endTime: 2.5 }
    ];
};
const extractWord = (audioPath, outputPath, startTime, endTime) => {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(audioPath)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
};
const processAudio = async (audioId, userId) => {
    try {
        const audioFile = await AudioFile_1.AudioFile.findById(audioId);
        if (!audioFile || audioFile.user_id !== userId) {
            throw new Error('Audio file not found');
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const wordFiles = await (0, exports.processAudioToWords)(audioFile.path);
        const totalSize = wordFiles.reduce((total, wordFile) => total + wordFile.size, 0);
        await User_1.User.updateStorageUsage(userId, 'library', totalSize);
        return wordFiles;
    }
    catch (error) {
        console.error('Error processing audio:', error);
        throw error;
    }
};
exports.processAudio = processAudio;
//# sourceMappingURL=audioProcessor.js.map