import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

export const generateQRCode = async (audioPath: string): Promise<string> => {
  const qrCodeDir = path.join(__dirname, '../../uploads/qrcodes');
  if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir, { recursive: true });
  }

  const qrCodePath = path.join(qrCodeDir, `${path.basename(audioPath)}.png`);
  await QRCode.toFile(qrCodePath, audioPath);
  return qrCodePath;
}; 