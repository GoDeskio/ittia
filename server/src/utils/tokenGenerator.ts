import crypto from 'crypto';

export const generateApiToken = (): string => {
  // Generate multiple random buffers for enhanced security
  const buffer1 = crypto.randomBytes(48);
  const buffer2 = crypto.randomBytes(32);
  
  // Convert to base64 and remove non-alphanumeric characters
  const token1 = buffer1.toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  const token2 = buffer2.toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36);
  
  // Create a long, secure token (100+ characters)
  const fullToken = `vv_${token1}${token2}_${timestamp}_${crypto.randomBytes(16).toString('hex')}`;
  
  // Ensure minimum length of 100 characters
  if (fullToken.length < 100) {
    const padding = crypto.randomBytes(Math.ceil((100 - fullToken.length) / 2)).toString('hex');
    return `${fullToken}${padding}`.slice(0, 120); // Cap at 120 characters for database efficiency
  }
  
  return fullToken.slice(0, 120); // Cap at 120 characters
}; 