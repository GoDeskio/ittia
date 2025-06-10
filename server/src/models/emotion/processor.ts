import * as tf from '@tensorflow/tfjs-node';
import * as wav from 'node-wav';
import * as fs from 'fs';
import path from 'path';

interface EmotionResult {
  emotion: string;
  confidence: number;
}

// Load the pre-trained model
const loadModel = async (): Promise<tf.LayersModel> => {
  const modelPath = path.join(__dirname, '../../../models/emotion/model');
  return await tf.loadLayersModel(`file://${modelPath}/model.json`);
};

// Process audio file and extract features
const extractFeatures = (audioPath: string): Float32Array => {
  const buffer = fs.readFileSync(audioPath);
  const result = wav.decode(buffer);
  
  // Convert audio data to mono if stereo
  const audioData = result.channelData.length > 1
    ? averageChannels(result.channelData)
    : result.channelData[0];

  // Normalize audio data
  const normalizedData = normalizeAudio(audioData);
  
  return normalizedData;
};

// Average multiple audio channels into mono
const averageChannels = (channels: Float32Array[]): Float32Array => {
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

// Normalize audio data to range [-1, 1]
const normalizeAudio = (audioData: Float32Array): Float32Array => {
  const maxVal = Math.max(...audioData.map(Math.abs));
  return new Float32Array(audioData.map(x => x / maxVal));
};

// Map emotion index to label
const emotionLabels = [
  'angry',
  'happy',
  'neutral',
  'sad'
];

// Process voice file and detect emotion
export const processVoiceEmotion = async (filePath: string): Promise<EmotionResult> => {
  try {
    // Load model
    const model = await loadModel();
    
    // Extract features
    const features = extractFeatures(filePath);
    
    // Prepare input tensor
    const inputTensor = tf.tensor2d([Array.from(features)]);
    
    // Get prediction
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.array();
    
    // Get highest probability emotion
    const emotionIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
    const confidence = probabilities[0][emotionIndex];
    
    // Cleanup
    inputTensor.dispose();
    prediction.dispose();
    
    return {
      emotion: emotionLabels[emotionIndex],
      confidence
    };
  } catch (error) {
    console.error('Error processing voice emotion:', error);
    throw new Error('Failed to process voice emotion');
  }
}; 