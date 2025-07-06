"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorScreenshotUpload = exports.errorLoggingService = exports.ErrorLoggingService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ErrorLog {
    constructor(data) {
        Object.assign(this, data);
        this.id = Date.now().toString();
    }
    async save() {
        return this;
    }
    static find(_query) {
        return {
            sort: (_sortOptions) => []
        };
    }
    static findByIdAndUpdate(_id, _update, _options) {
        return null;
    }
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.join(__dirname, '../../uploads/error-screenshots');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        files: 10,
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Only JPEG/PNG files are allowed'));
        }
        cb(null, true);
    }
});
exports.errorScreenshotUpload = upload;
class ErrorLoggingService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    async logError(errorData) {
        try {
            const screenshotPaths = errorData.screenshots.map(file => file.path);
            const errorLog = new ErrorLog({
                userId: errorData.userId,
                errorType: errorData.errorType,
                description: errorData.description,
                userAgent: errorData.userAgent,
                route: errorData.route,
                stackTrace: errorData.stackTrace,
                screenshots: screenshotPaths
            });
            await errorLog.save();
            await this.sendErrorEmail(errorLog);
            return errorLog;
        }
        catch (error) {
            console.error('Error logging error:', error);
            throw error;
        }
    }
    async sendErrorEmail(errorLog) {
        const devTeamEmail = process.env.DEV_TEAM_EMAIL || 'dev-team@voicevault.com';
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: devTeamEmail,
            subject: `[VoiceVault Error] ${errorLog.errorType}`,
            html: `
        <h2>Error Report</h2>
        <p><strong>Error ID:</strong> ${errorLog.id}</p>
        <p><strong>Timestamp:</strong> ${errorLog.timestamp}</p>
        <p><strong>User ID:</strong> ${errorLog.userId || 'Anonymous'}</p>
        <p><strong>Error Type:</strong> ${errorLog.errorType}</p>
        <p><strong>Description:</strong> ${errorLog.description}</p>
        <p><strong>Route:</strong> ${errorLog.route}</p>
        <p><strong>User Agent:</strong> ${errorLog.userAgent}</p>
        ${errorLog.stackTrace ? `<p><strong>Stack Trace:</strong><br><pre>${errorLog.stackTrace}</pre></p>` : ''}
      `,
            attachments: errorLog.screenshots.map(screenshot => ({
                filename: path_1.default.basename(screenshot),
                path: screenshot
            }))
        };
        await this.transporter.sendMail(mailOptions);
    }
    async getErrorLogs(filters) {
        const query = {};
        if (filters.status)
            query.status = filters.status;
        if (filters.userId)
            query.userId = filters.userId;
        if (filters.errorType)
            query.errorType = filters.errorType;
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate)
                query.timestamp.$gte = filters.startDate;
            if (filters.endDate)
                query.timestamp.$lte = filters.endDate;
        }
        return ErrorLog.find(query).sort({ timestamp: -1 });
    }
    async updateErrorStatus(errorId, update) {
        return ErrorLog.findByIdAndUpdate(errorId, update, { new: true });
    }
}
exports.ErrorLoggingService = ErrorLoggingService;
exports.errorLoggingService = new ErrorLoggingService();
//# sourceMappingURL=errorLogging.service.js.map