"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.generateVerificationToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logEmailToFile = async (to, subject, content) => {
    const logDir = path_1.default.join(__dirname, '../../../logs');
    const logFile = path_1.default.join(logDir, 'email.log');
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir, { recursive: true });
    }
    const logEntry = `
----- Email Sent at ${new Date().toISOString()} -----
To: ${to}
Subject: ${subject}
Content:
${content}
-------------------------------------------------
`;
    await fs_1.default.promises.appendFile(logFile, logEntry);
};
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateVerificationToken = generateVerificationToken;
const sendVerificationEmail = async (email, name, token) => {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const emailContent = `
Welcome to VoiceVault, ${name}!

Thank you for signing up. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.
  `;
    await logEmailToFile(email, 'Welcome to VoiceVault - Please Verify Your Email', emailContent);
    console.log(`[DEV] Verification email sent to ${email}`);
    console.log(`[DEV] Verification URL: ${verificationUrl}`);
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=emailService.js.map