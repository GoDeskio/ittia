import { Audio } from 'expo-av';

/**
 * Converts an audio blob to text using the Web Speech API
 * @param audioBlob - The audio blob to convert
 * @returns A promise that resolves to the transcribed text
 */
export const convertAudioToText = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Use the Web Speech API for transcription
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            resolve(transcript);
          };
          
          recognition.onerror = (event) => {
            reject(new Error(`Speech recognition error: ${event.error}`));
          };
          
          recognition.start();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };
      
      reader.readAsArrayBuffer(audioBlob);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Converts an audio blob to a base64 string
 * @param audioBlob - The audio blob to convert
 * @returns A promise that resolves to the base64 string
 */
export const audioBlobToBase64 = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]);
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert audio to base64'));
    };
    reader.readAsDataURL(audioBlob);
  });
};

/**
 * Formats audio duration from seconds to MM:SS string
 * @param seconds - The duration in seconds
 * @returns Formatted duration string
 */
export const formatAudioDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculates the average volume level of an audio buffer
 * @param audioBuffer - The audio buffer to analyze
 * @returns A value between 0 and 1 representing the average volume
 */
export const calculateVolumeLevel = (audioBuffer: AudioBuffer): number => {
  const channelData = audioBuffer.getChannelData(0);
  let sum = 0;
  
  for (let i = 0; i < channelData.length; i++) {
    sum += Math.abs(channelData[i]);
  }
  
  return sum / channelData.length;
};

/**
 * Records audio using the device's microphone
 * @param duration - Optional maximum duration in milliseconds
 * @returns A promise that resolves to the recorded audio blob
 */
export const recordAudio = async (duration?: number): Promise<Blob> => {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    if (duration) {
      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
      }, duration);
    }

    return new Promise((resolve, reject) => {
      recording.setOnRecordingStatusUpdate(async (status) => {
        if (status.isDoneRecording) {
          const uri = recording.getURI();
          if (!uri) {
            reject(new Error('Failed to get recording URI'));
            return;
          }

          try {
            const response = await fetch(uri);
            const blob = await response.blob();
            resolve(blob);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to record audio: ${error}`);
  }
};

/**
 * Plays an audio blob
 * @param audioBlob - The audio blob to play
 * @returns A promise that resolves when playback is complete
 */
export const playAudio = async (audioBlob: Blob): Promise<void> => {
  try {
    const uri = URL.createObjectURL(audioBlob);
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    
    return new Promise((resolve) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          resolve();
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to play audio: ${error}`);
  }
}; 