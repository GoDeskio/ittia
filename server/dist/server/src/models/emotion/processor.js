"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processVoiceEmotion = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const wav = __importStar(require("node-wav"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const loadModel = async () => {
    const modelPath = path_1.default.join(__dirname, '../../../models/emotion/model');
    return await tf.loadLayersModel(`file://${modelPath}/model.json`);
};
const extractFeatures = (audioPath) => {
    const buffer = fs.readFileSync(audioPath);
    const result = wav.decode(buffer);
    const audioData = result.channelData.length > 1
        ? averageChannels(result.channelData)
        : result.channelData[0];
    const normalizedData = normalizeAudio(audioData);
    return normalizedData;
};
const averageChannels = (channels) => {
    const length = channels[0].length;
    const result = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        let sum = 0;
        for (const channel of channels) {
            sum += channel[i];
        }
        result[i] = sum / channels.length;
    }
    return result;
};
const normalizeAudio = (audioData) => {
    const maxVal = Math.max(...audioData.map(Math.abs));
    return new Float32Array(audioData.map(x => x / maxVal));
};
const emotionLabels = [
    'angry',
    'happy',
    'neutral',
    'sad'
];
const processVoiceEmotion = async (filePath) => {
    try {
        const model = await loadModel();
        const features = extractFeatures(filePath);
        const inputTensor = tf.tensor2d([Array.from(features)]);
        const prediction = model.predict(inputTensor);
        const probabilities = await prediction.array();
        const emotionIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
        const confidence = probabilities[0][emotionIndex];
        inputTensor.dispose();
        prediction.dispose();
        return {
            emotion: emotionLabels[emotionIndex],
            confidence
        };
    }
    catch (error) {
        console.error('Error processing voice emotion:', error);
        throw new Error('Failed to process voice emotion');
    }
};
exports.processVoiceEmotion = processVoiceEmotion;
//# sourceMappingURL=processor.js.map