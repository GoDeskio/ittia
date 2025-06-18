import QRCode from 'qrcode';

interface VoiceLibraryQRData {
  libraryName: string;
  apiToken: string;
  userId: string;
  timestamp: number;
}

export const generateVoiceLibraryQR = async (data: VoiceLibraryQRData): Promise<string> => {
  const qrData = JSON.stringify({
    type: 'voicevault-library',
    ...data,
  });

  try {
    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const parseVoiceLibraryQR = (qrData: string): VoiceLibraryQRData => {
  try {
    const data = JSON.parse(qrData);
    if (data.type !== 'voicevault-library') {
      throw new Error('Invalid QR code type');
    }
    return {
      libraryName: data.libraryName,
      apiToken: data.apiToken,
      userId: data.userId,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    throw new Error('Invalid QR code data');
  }
}; 