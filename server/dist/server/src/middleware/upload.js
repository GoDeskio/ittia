"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFileSize = exports.handleMulterError = exports.getDynamicMulter = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const UploadSettings_1 = require("../models/UploadSettings");
const upload_1 = require("../config/upload");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, upload_1.defaultConfig.uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (upload_1.defaultConfig.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type'));
    }
};
const getDynamicMulter = async (req, res, next) => {
    try {
        const settings = await UploadSettings_1.UploadSettings.getSettings();
        const upload = (0, multer_1.default)({
            storage: storage,
            fileFilter: fileFilter,
            limits: {
                fileSize: settings.maxFileSize
            }
        });
        return upload;
    }
    catch (error) {
        const upload = (0, multer_1.default)({
            storage: storage,
            fileFilter: fileFilter,
            limits: {
                fileSize: upload_1.defaultConfig.maxFileSize
            }
        });
        return upload;
    }
};
exports.getDynamicMulter = getDynamicMulter;
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: 'File size exceeds the allowed limit'
            });
        }
        return res.status(400).json({
            error: 'File upload error'
        });
    }
    next(err);
};
exports.handleMulterError = handleMulterError;
const checkFileSize = async (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    try {
        const settings = await UploadSettings_1.UploadSettings.getSettings();
        if (contentLength > settings.maxFileSize) {
            return res.status(413).json({
                error: 'File size exceeds the allowed limit'
            });
        }
        next();
    }
    catch (error) {
        if (contentLength > upload_1.defaultConfig.maxFileSize) {
            return res.status(413).json({
                error: 'File size exceeds the allowed limit'
            });
        }
        next();
    }
};
exports.checkFileSize = checkFileSize;
//# sourceMappingURL=upload.js.map