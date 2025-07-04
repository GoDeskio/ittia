import crypto from 'crypto';

export const generateApiToken = (): string => {
  // Generate a random 32-byte buffer
  const buffer = crypto.randomBytes(32);
  
  // Convert to base64 and remove non-alphanumeric characters
  const token = buffer.toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 32);
  
  // Add a prefix for identification
  return `vv_${token}`;
}; 