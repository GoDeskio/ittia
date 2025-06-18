/**
 * Audio Utilities
 * 
 * Collection of utility functions for audio processing and conversion.
 */

/**
 * Convert audio blob to text using Web Speech API
 * @param audioBlob - The audio blob to convert
 * @returns Promise with the transcribed text
 */
export const convertAudioToText = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          // Decode audio data
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Create audio source
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;

          // Create speech recognition
          const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          // Handle recognition results
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            resolve(transcript);
          };

          recognition.onerror = (event) => {
            reject(new Error(`Speech recognition error: ${event.error}`));
          };

          // Start recognition
          recognition.start();
          source.connect(audioContext.destination);
          source.start(0);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = (error) => {
        reject(error);
      };

      // Read audio file
      fileReader.readAsArrayBuffer(audioBlob);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Convert audio blob to base64 string
 * @param audioBlob - The audio blob to convert
 * @returns Promise with the base64 string
 */
export const audioBlobToBase64 = (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Format audio duration in seconds to MM:SS format
 * @param duration - Duration in seconds
 * @returns Formatted duration string
 */
export const formatAudioDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate audio volume level
 * @param audioBuffer - The audio buffer to analyze
 * @returns Average volume level (0-1)
 */
export const calculateVolumeLevel = (audioBuffer: AudioBuffer): number => {
  const channelData = audioBuffer.getChannelData(0);
  let sum = 0;
  for (let i = 0; i < channelData.length; i++) {
    sum += Math.abs(channelData[i]);
  }
  return sum / channelData.length;
}; 