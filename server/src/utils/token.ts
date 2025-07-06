import crypto from 'crypto';

export async function generateApiToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(new Error('Failed to generate API token'));
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
}

export function validateApiToken(token: string): boolean {
  // Check if token is a valid hex string of correct length (64 characters)
  return /^[0-9a-f]{64}$/.test(token);
}

export function hashApiToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
} 