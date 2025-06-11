import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export interface VoiceSample {
  id: string;
  userId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export const VoiceSampleService = {
  async getUserVoiceSample(userId: string): Promise<VoiceSample | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/voice-sample`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voice sample:', error);
      return null;
    }
  },

  async uploadVoiceSample(userId: string, audioBlob: Blob): Promise<VoiceSample | null> {
    try {
      const formData = new FormData();
      formData.append('voiceSample', audioBlob, 'voice-sample.wav');

      const response = await axios.post(
        `${API_BASE_URL}/api/users/${userId}/voice-sample`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading voice sample:', error);
      return null;
    }
  },

  async deleteVoiceSample(userId: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userId}/voice-sample`);
      return true;
    } catch (error) {
      console.error('Error deleting voice sample:', error);
      return false;
    }
  },

  async generateVoiceSample(
    userId: string,
    text: string,
    options?: { voice?: string; speed?: number }
  ): Promise<VoiceSample | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/${userId}/generate-voice-sample`, {
        text,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating voice sample:', error);
      return null;
    }
  },
};

export default VoiceSampleService; 