import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Mock email service for development
const logEmailToFile = async (to: string, subject: string, content: string) => {
  const logDir = path.join(__dirname, '../../../logs');
  const logFile = path.join(logDir, 'email.log');

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logEntry = `
----- Email Sent at ${new Date().toISOString()} -----
To: ${to}
Subject: ${subject}
Content:
${content}
-------------------------------------------------
`;

  await fs.promises.appendFile(logFile, logEntry);
};

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email: string, name: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const emailContent = `
Welcome to VoiceVault, ${name}!

Thank you for signing up. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.
  `;

  // In development, log the email to a file
  await logEmailToFile(email, 'Welcome to VoiceVault - Please Verify Your Email', emailContent);

  console.log(`[DEV] Verification email sent to ${email}`);
  console.log(`[DEV] Verification URL: ${verificationUrl}`);
}; 